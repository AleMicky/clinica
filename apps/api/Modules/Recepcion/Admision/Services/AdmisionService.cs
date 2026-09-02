using Clinica.Api.Data;
using Clinica.Api.Modules.Parametros.Correlativo.Dtos;
using Clinica.Api.Modules.Parametros.Correlativo.Services;
using Clinica.Api.Modules.Recepcion.Admision.Dtos;
using Clinica.Api.Modules.Recepcion.Admision.Entity;
using Clinica.Api.Modules.Recepcion.Admision.Enums;
using Clinica.Api.Modules.Recepcion.Admision.Extensions;
using Clinica.Api.Modules.Recepcion.Admision.Mappers;
using Clinica.Api.Modules.Recepcion.Pacientes.Entity;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Entity;
using Clinica.Api.Modules.RecursosHumanos.Medico.Entity;
using Clinica.Api.Modules.Servicios.Convenios.Entity;
using Clinica.Api.Modules.Servicios.Servicios.Entity;
using Clinica.Api.Modules.Ventas.Venta.Services;
using Clinica.Api.Shared.Abstractions;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Extensions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using AdmisionEntity = Clinica.Api.Modules.Recepcion.Admision.Entity.Admision;
using AdmisionDetalleEntity = Clinica.Api.Modules.Recepcion.Admision.Entity.AdmisionDetalle;

namespace Clinica.Api.Modules.Recepcion.Admision.Services;

public sealed class AdmisionService(
    AppDbContext dbContext,
    VentaService ventaService,
    ICorrelativoService correlativoService,
    ICurrentUserService currentUserService
)
{
    private DbSet<AdmisionEntity> Admisiones => dbContext.Set<AdmisionEntity>();

    public async Task<PagedResult<AdmisionResponse>> ListarAsync(
        PaginationRequest pagination,
        string? search,
        EstadoAdmision? estado = null,
        CancellationToken cancellationToken = default)
    {
        var usuarioId = currentUserService.UserId ?? throw new UnauthorizedAccessException();

        var query = Admisiones
            .AsNoTracking()
            .IncludeGrafoCompleto()
            .Where(x => x.Activo);

        if (!currentUserService.IsInRole("ADMINISTRADOR"))
        {
            var empleadoId = await ObtenerEmpleadoIdPorUsuarioAsync(usuarioId, cancellationToken);

            if (empleadoId == 0)
            {
                return new PagedResult<AdmisionResponse>(
                    [],
                    pagination.ValidPage,
                    pagination.ValidPageSize,
                    0
                );
            }

            query = query.Where(x => x.RecepcionistaId == empleadoId);
        }

        if (estado.HasValue)
        {
            query = query.Where(x => x.Estado == estado.Value);
        }

        var normalizedSearch = search.TrimOrNull();
        if (normalizedSearch is not null)
        {
            query = query.Where(x =>
                x.Numero.Contains(normalizedSearch) ||
                (x.Observacion != null && x.Observacion.Contains(normalizedSearch)) ||
                x.Paciente.NumeroHistoriaClinica.Contains(normalizedSearch) ||
                x.Paciente.Persona.Nombres.Contains(normalizedSearch) ||
                x.Paciente.Persona.ApellidoPaterno.Contains(normalizedSearch) ||
                (x.Paciente.Persona.ApellidoMaterno != null &&
                 x.Paciente.Persona.ApellidoMaterno.Contains(normalizedSearch)) ||
                x.Paciente.Persona.NumeroDocumento.Contains(normalizedSearch)
            );
        }

        var totalItems = await query.CountAsync(cancellationToken);
        var offset = (pagination.ValidPage - 1) * pagination.ValidPageSize;

        var entities = await query
            .OrderByDescending(x => x.FechaHora)
            .ThenByDescending(x => x.Id)
            .Skip(offset)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        var items = entities.Select(MapToResponse).ToList();

        return new PagedResult<AdmisionResponse>(
            items,
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems
        );
    }

    public async Task<AdmisionResponse> ObtenerAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await Admisiones
                         .AsNoTracking()
                         .IncludeGrafoCompleto()
                         .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken)
                     ?? throw new NotFoundException(nameof(AdmisionEntity), id);

        return MapToResponse(entity);
    }

    public async Task<AdmisionResponse> CrearAsync(CreateAdmisionRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarAsync(request, cancellationToken);

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var entity = AdmisionMapper.ToEntity(request);
            Normalizar(entity, request.Observacion);

            var correlativo = await correlativoService.GenerarAsync(new GenerarCorrelativoRequest
            {
                Codigo = "ADM",
                Gestion = entity.FechaHora.Year,
                Prefijo = "ADM",
                Longitud = 6
            }, cancellationToken);

            entity.Numero = correlativo.NumeroFormateado;
            entity.Estado = EstadoAdmision.Registrada;
            entity.Detalles = request.Detalles.Select(CrearDetalle).ToList();

            await Admisiones.AddAsync(entity, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return await ObtenerAsync(entity.Id, cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<AdmisionResponse> ActualizarAsync(int id, UpdateAdmisionRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await Admisiones
                         .Include(x => x.Detalles)
                         .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken)
                     ?? throw new NotFoundException(nameof(AdmisionEntity), id);

        if (entity.Estado != EstadoAdmision.Registrada)
        {
            throw new ConflictException(
                $"No se puede editar una admisión en estado {entity.Estado}. " +
                $"Solo las admisiones en estado {EstadoAdmision.Registrada} pueden ser editadas."
            );
        }

        await ValidarAsync(request, cancellationToken);

        AdmisionMapper.UpdateEntity(request, entity);
        Normalizar(entity, request.Observacion);
        ReemplazarDetalles(entity, request.Detalles);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(entity.Id, cancellationToken);
    }

    public async Task EliminarAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await Admisiones
                         .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken)
                     ?? throw new NotFoundException(nameof(AdmisionEntity), id);

        if (entity.Estado != EstadoAdmision.Registrada)
        {
            throw new ConflictException(
                $"No se puede eliminar una admisión en estado {entity.Estado}. " +
                $"Solo las admisiones en estado {EstadoAdmision.Registrada} pueden ser eliminadas."
            );
        }

        entity.Activo = false;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<AdmisionResponse> CambiarEstadoAsync(int id, CambiarEstadoRequest request,
        CancellationToken cancellationToken = default)
    {
        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var entity = await Admisiones
                             .Include(x => x.Detalles)
                             .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken)
                         ?? throw new NotFoundException(nameof(AdmisionEntity), id);

            if (!AdmisionTransiciones.EsValida(entity.Estado, request.EstadoDestino))
            {
                throw new ConflictException(
                    $"No se puede transitar de {entity.Estado} a {request.EstadoDestino}."
                );
            }

            if (request.EstadoDestino == EstadoAdmision.EnviadaVenta)
            {
                if (entity.Detalles.Count == 0)
                {
                    throw new ConflictException(
                        "La admisión no tiene servicios registrados y no puede ser enviada a ventas.");
                }

                await ventaService.GenerarVentaDesdeAdmisionAsync(entity.Id, entity.RecepcionistaId, cancellationToken);
            }

            entity.Estado = request.EstadoDestino;
            AgregarMotivo(entity, request.Motivo);

            await dbContext.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return await ObtenerAsync(entity.Id, cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    private async Task ValidarAsync(AdmisionRequest request, CancellationToken cancellationToken = default)
    {
        await ValidarPacienteAsync(request.PacienteId, cancellationToken);
        await ValidarRecepcionistaAsync(request.RecepcionistaId, cancellationToken);
        if (request.ConvenioId.HasValue)
        {
            await ValidarConvenioAsync(request.ConvenioId.Value, cancellationToken);
        }

        await ValidarDetallesAsync(request.Detalles, cancellationToken);
    }

    private async Task ValidarPacienteAsync(int pacienteId, CancellationToken cancellationToken)
    {
        var existe = await dbContext.Pacientes
            .AsNoTracking()
            .AnyAsync(x => x.Id == pacienteId && x.Activo, cancellationToken);

        if (!existe)
        {
            throw new NotFoundException(nameof(Paciente), pacienteId);
        }
    }

    private async Task ValidarRecepcionistaAsync(int recepcionistaId, CancellationToken cancellationToken)
    {
        var existe = await dbContext.Empleados
            .AsNoTracking()
            .AnyAsync(x => x.Id == recepcionistaId && x.Activo, cancellationToken);

        if (!existe)
        {
            throw new NotFoundException(nameof(Empleado), recepcionistaId);
        }
    }

    private async Task ValidarConvenioAsync(int convenioId, CancellationToken cancellationToken)
    {
        var existe = await dbContext.Convenios
            .AsNoTracking()
            .AnyAsync(x => x.Id == convenioId && x.Activo, cancellationToken);

        if (!existe)
        {
            throw new NotFoundException(nameof(Convenio), convenioId);
        }
    }

    private async Task ValidarDetallesAsync(IReadOnlyCollection<AdmisionDetalleRequest> detalles,
        CancellationToken cancellationToken)
    {
        if (detalles.Count == 0)
        {
            throw new ConflictException("La admisión debe contener al menos un servicio.");
        }

        ValidarServiciosDuplicados(detalles);
        await ValidarServiciosAsync(detalles, cancellationToken);
        await ValidarMedicosAsync(detalles, cancellationToken);
    }

    private async Task ValidarServiciosAsync(IReadOnlyCollection<AdmisionDetalleRequest> detalles,
        CancellationToken cancellationToken)
    {
        var servicioIds = detalles
            .Select(x => x.ServicioId)
            .Distinct()
            .ToList();

        var existentes = await dbContext.Servicio
            .AsNoTracking()
            .Where(x =>
                servicioIds.Contains(x.Id) &&
                x.Activo)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        var faltantes = servicioIds
            .Except(existentes)
            .ToList();

        if (faltantes.Count > 0)
        {
            throw new NotFoundException(nameof(Servicio), faltantes[0]);
        }
    }

    private async Task ValidarMedicosAsync(IReadOnlyCollection<AdmisionDetalleRequest> detalles,
        CancellationToken cancellationToken)

    {
        var medicoIds = detalles
            .Where(x => x.MedicoId.HasValue)
            .Select(x => x.MedicoId!.Value)
            .Distinct()
            .ToList();

        if (medicoIds.Count == 0)
        {
            return;
        }

        var existentes = await dbContext.Medicos
            .AsNoTracking()
            .Where(x =>
                medicoIds.Contains(x.Id) &&
                x.Activo)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        var faltantes = medicoIds
            .Except(existentes)
            .ToList();

        if (faltantes.Count > 0)
        {
            throw new NotFoundException(nameof(Medico), faltantes[0]);
        }
    }

    private static void ValidarServiciosDuplicados(IReadOnlyCollection<AdmisionDetalleRequest> detalles)
    {
        var duplicado = detalles
            .GroupBy(x => x.ServicioId)
            .FirstOrDefault(x => x.Count() > 1);

        if (duplicado is not null)
        {
            throw new ConflictException(
                $"El servicio con ID {duplicado.Key} está registrado más de una vez en la admisión.");
        }
    }

    private static AdmisionResponse MapToResponse(AdmisionEntity entity)
    {
        return AdmisionMapper.ToResponse(entity) with
        {
            Detalles = AdmisionDetalleMapper.ToResponse(entity.Detalles)
        };
    }

    private async Task<int> ObtenerEmpleadoIdPorUsuarioAsync(int usuarioId, CancellationToken cancellationToken)
    {
        return await dbContext.Users
            .Where(u => u.Id == usuarioId)
            .Join(
                dbContext.Empleados,
                usuario => usuario.PersonaId,
                empleado => empleado.PersonaId,
                (_, empleado) => empleado.Id
            )
            .FirstOrDefaultAsync(cancellationToken);
    }

    private static AdmisionDetalleEntity CrearDetalle(AdmisionDetalleRequest request)
    {
        return new AdmisionDetalleEntity
        {
            ServicioId = request.ServicioId,
            MedicoId = request.MedicoId,
            Cantidad = request.Cantidad,
            PrecioUnitario = request.PrecioUnitario,
            Descuento = request.Descuento,
            Total = request.CalcularTotal()
        };
    }

    private static void ReemplazarDetalles(AdmisionEntity entity, IReadOnlyCollection<AdmisionDetalleRequest> detalles)
    {
        var existingByServicio = entity.Detalles.ToDictionary(x => x.ServicioId);
        var incomingServicioIds = detalles.Select(x => x.ServicioId).ToHashSet();

        var detallesAEliminar = entity.Detalles
            .Where(x => !incomingServicioIds.Contains(x.ServicioId))
            .ToList();

        foreach (var detalle in detallesAEliminar)
        {
            entity.Detalles.Remove(detalle);
        }

        foreach (var request in detalles)
        {
            if (existingByServicio.TryGetValue(request.ServicioId, out var detalle))
            {
                detalle.MedicoId = request.MedicoId;
                detalle.Cantidad = request.Cantidad;
                detalle.PrecioUnitario = request.PrecioUnitario;
                detalle.Descuento = request.Descuento;
                detalle.Total = request.CalcularTotal();
                continue;
            }

            entity.Detalles.Add(CrearDetalle(request));
        }
    }

    private static void Normalizar(AdmisionEntity entity, string? observacion)
    {
        entity.Observacion = observacion.TrimOrNull();
    }

    private static void AgregarMotivo(AdmisionEntity entity, string? motivo)
    {
        var motivoNormalizado = motivo.TrimOrNull();
        if (motivoNormalizado is null) return;

        entity.Observacion = string.IsNullOrWhiteSpace(entity.Observacion)
            ? motivoNormalizado
            : $"{entity.Observacion.Trim()} | {motivoNormalizado}";
    }
}