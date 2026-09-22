using Clinica.Api.Data;
using Clinica.Api.Modules.Parametros.Correlativo.Services;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Mappers;
using Clinica.Api.Shared.Abstractions;
using Clinica.Api.Shared.Excel;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;
using EmpleadoEntity = Clinica.Api.Modules.RecursosHumanos.Empleado.Entity.Empleado;
using PersonaEntity = Clinica.Api.Modules.Seguridad.Personas.Entity.Persona;

namespace Clinica.Api.Modules.RecursosHumanos.Empleado.Services;

public sealed class EmpleadoService(
    AppDbContext dbContext,
    ICurrentUserService currentUserService,
    IExcelReportGenerator excelReportGenerator)
{
    public async Task<PagedResult<EmpleadoResponse>> ListarAsync(
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Empleados
            .Include(x => x.Persona)
            .AsNoTracking()
            .Where(x => x.Activo);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();

            query = query.Where(x =>
                (x.CodigoEmpleado != null &&
                 x.CodigoEmpleado.Contains(term)) ||
                x.Persona.Nombres.Contains(term) ||
                x.Persona.ApellidoPaterno.Contains(term) ||
                x.Persona.NumeroDocumento.Contains(term));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var empleados = await query
            .OrderByDescending(x => x.Id)
            .Skip(
                (pagination.ValidPage - 1) *
                pagination.ValidPageSize)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<EmpleadoResponse>(
            empleados
                .Select(EmpleadoMapper.ToResponse)
                .ToList(),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems);
    }

    public async Task<EmpleadoResponse> ObtenerAsync(int id,CancellationToken cancellationToken = default)
    {
        var empleado = await dbContext.Empleados
                           .Include(x => x.Persona)
                           .AsNoTracking()
                           .FirstOrDefaultAsync(
                               x => x.Id == id && x.Activo,
                               cancellationToken)
                       ?? throw new NotFoundException("Empleado", id);

        return EmpleadoMapper.ToResponse(empleado);
    }

    public async Task<List<EmpleadoBaseInfo>> EmpleadoBase(CancellationToken cancellationToken = default)
    {
        return await dbContext.Empleados
            .AsNoTracking()
            .Where(x => x.Activo)
            .OrderBy(x => x.Persona.ApellidoPaterno)
            .ThenBy(x => x.Persona.ApellidoMaterno)
            .ThenBy(x => x.Persona.Nombres)
            .Select(x => new EmpleadoBaseInfo
            {
                Id = x.Id,
                CodigoEmpleado = x.CodigoEmpleado,
                NombreCompleto =
                    x.Persona.Nombres + " " +
                    x.Persona.ApellidoPaterno + " " +
                    (x.Persona.ApellidoMaterno ?? "")
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<List<EmpleadoBaseInfo>> EmpleadosPermitidos(CancellationToken cancellationToken = default)
    {
        var usuarioId = currentUserService.UserId
                        ?? throw new UnauthorizedAccessException();

        var query = dbContext.Empleados
            .AsNoTracking()
            .Where(x => x.Activo);

        if (!currentUserService.IsInRole("ADMINISTRADOR"))
        {
            var personaId = await dbContext.Users
                .Where(x => x.Id == usuarioId)
                .Select(x => x.PersonaId)
                .FirstOrDefaultAsync(cancellationToken);

            query = query.Where(x => x.PersonaId == personaId);
        }

        return await query
            .OrderBy(x => x.Persona.ApellidoPaterno)
            .ThenBy(x => x.Persona.ApellidoMaterno)
            .ThenBy(x => x.Persona.Nombres)
            .Select(x => new EmpleadoBaseInfo
            {
                Id = x.Id,
                CodigoEmpleado = x.CodigoEmpleado,
                NombreCompleto =
                    x.Persona.Nombres + " " +
                    x.Persona.ApellidoPaterno + " " +
                    (x.Persona.ApellidoMaterno ?? "")
            })
            .ToListAsync(cancellationToken);
    }

    // ---------------------------------------------------------
    // CREAR CON PERSONA EXISTENTE
    // ---------------------------------------------------------

    public async Task<EmpleadoResponse> CrearAsync(
        CreateEmpleadoRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarPersonaAsync(
            request.PersonaId,
            excludeEmpleadoId: null,
            cancellationToken);

        var empleado = EmpleadoMapper.ToEntity(request);

        empleado.Activo = true;
        await dbContext.Empleados.AddAsync(empleado, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        empleado.CodigoEmpleado = GenerarCodigoEmpleado(empleado.Id);
        await dbContext.SaveChangesAsync(cancellationToken);
        await dbContext.Entry(empleado)
            .Reference(x => x.Persona)
            .LoadAsync(cancellationToken);
        return EmpleadoMapper.ToResponse(empleado);
    }

    // ---------------------------------------------------------
    // ACTUALIZAR CON PERSONA EXISTENTE
    // ---------------------------------------------------------

    public async Task<EmpleadoResponse> ActualizarAsync(
        int id,
        UpdateEmpleadoRequest request,
        CancellationToken cancellationToken = default)
    {
        var empleado = await ObtenerEntityAsync(id, cancellationToken);

        await ValidarPersonaAsync(request.PersonaId, id, cancellationToken);
        EmpleadoMapper.UpdateEntity(request, empleado);
        await dbContext.SaveChangesAsync(cancellationToken);
        return EmpleadoMapper.ToResponse(empleado);
    }

    // ---------------------------------------------------------
    // CREAR EMPLEADO + PERSONA
    // ---------------------------------------------------------

    public async Task<EmpleadoResponse> CrearConPersonaAsync(EmpleadoPersonaRequest request, CancellationToken cancellationToken = default)
    {
        await ValidarDocumentoPersonaAsync(
            request.Persona.TipoDocumento,
            request.Persona.NumeroDocumento,
            request.Persona.ExtensionDocumento,
            request.Persona.ComplementoDocumento,
            excludePersonaId: null,
            cancellationToken);

        var empleado = EmpleadoPersonaMapper.ToEntity(request);

        empleado.Activo = true;
        empleado.Persona.Activo = true;
        await dbContext.Empleados.AddAsync(empleado, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        empleado.CodigoEmpleado = GenerarCodigoEmpleado(empleado.Id);
        await dbContext.SaveChangesAsync(cancellationToken);
        return EmpleadoMapper.ToResponse(empleado);
    }

    // ---------------------------------------------------------
    // ACTUALIZAR EMPLEADO + PERSONA
    // ---------------------------------------------------------

    public async Task<EmpleadoResponse> ActualizarConPersonaAsync(
        int id,
        EmpleadoPersonaRequest request,
        CancellationToken cancellationToken = default)
    {
        var empleado = await ObtenerEntityAsync(id, cancellationToken);

        await ValidarDocumentoPersonaAsync(
            request.Persona.TipoDocumento,
            request.Persona.NumeroDocumento,
            request.Persona.ExtensionDocumento,
            request.Persona.ComplementoDocumento,
            empleado.PersonaId,
            cancellationToken);

        EmpleadoPersonaMapper.UpdateEntity(request, empleado);
        EmpleadoPersonaMapper.UpdatePersona(request.Persona, empleado.Persona);

        await dbContext.SaveChangesAsync(cancellationToken);
        return EmpleadoMapper.ToResponse(empleado);
    }

    // ---------------------------------------------------------
    // ELIMINAR
    // ---------------------------------------------------------

    public async Task EliminarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var empleado = await dbContext.Empleados
                           .FirstOrDefaultAsync(
                               x => x.Id == id,
                               cancellationToken)
                       ?? throw new NotFoundException("Empleado", id);

        dbContext.Empleados.Remove(empleado);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    // ---------------------------------------------------------
    // INACTIVAR
    // ---------------------------------------------------------

    public async Task InactivarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var empleado = await dbContext.Empleados
                           .FirstOrDefaultAsync(
                               x => x.Id == id,
                               cancellationToken)
                       ?? throw new NotFoundException("Empleado", id);

        if (!empleado.Activo)
            return;

        empleado.Activo = false;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    // ---------------------------------------------------------
    // ACTIVAR
    // ---------------------------------------------------------

    public async Task ActivarAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var empleado = await dbContext.Empleados
                           .FirstOrDefaultAsync(
                               x => x.Id == id,
                               cancellationToken)
                       ?? throw new NotFoundException("Empleado", id);

        if (empleado.Activo)
            return;

        empleado.Activo = true;

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    // ---------------------------------------------------------
    // PRIVATE
    // ---------------------------------------------------------

    private async Task<EmpleadoEntity> ObtenerEntityAsync(
        int id,
        CancellationToken cancellationToken)
    {
        return await dbContext.Empleados
                   .Include(x => x.Persona)
                   .FirstOrDefaultAsync(
                       x => x.Id == id && x.Activo,
                       cancellationToken)
               ?? throw new NotFoundException("Empleado", id);
    }

    private async Task ValidarPersonaAsync(
        int personaId,
        int? excludeEmpleadoId,
        CancellationToken cancellationToken)
    {
        var existePersona = await dbContext
            .Set<PersonaEntity>()
            .AsNoTracking()
            .AnyAsync(
                x =>
                    x.Id == personaId &&
                    x.Activo,
                cancellationToken);

        if (!existePersona)
        {
            throw new NotFoundException(
                "Persona",
                personaId);
        }

        var query = dbContext.Empleados
            .AsNoTracking()
            .Where(x => x.PersonaId == personaId);

        if (excludeEmpleadoId.HasValue)
        {
            query = query.Where(x => x.Id != excludeEmpleadoId.Value);
        }

        if (await query.AnyAsync(cancellationToken))
        {
            throw new ConflictException(
                $"La persona '{personaId}' ya está registrada como empleado.");
        }
    }

    private async Task ValidarDocumentoPersonaAsync(
        string tipoDocumento,
        string numeroDocumento,
        string? extensionDocumento,
        string? complementoDocumento,
        int? excludePersonaId,
        CancellationToken cancellationToken)
    {
        var query = dbContext
            .Set<PersonaEntity>()
            .AsNoTracking()
            .Where(x =>
                x.TipoDocumento == tipoDocumento &&
                x.NumeroDocumento == numeroDocumento &&
                x.ExtensionDocumento == extensionDocumento &&
                x.ComplementoDocumento == complementoDocumento);

        if (excludePersonaId.HasValue)
        {
            query = query.Where(x => x.Id != excludePersonaId.Value);
        }

        if (await query.AnyAsync(cancellationToken))
        {
            throw new ConflictException(
                $"Ya existe una persona con el documento '{numeroDocumento}'.");
        }
    }

    private static string GenerarCodigoEmpleado(
        int empleadoId)
    {
        return $"CQ-{empleadoId:D5}";
    }

    public async Task<byte[]> ExportarExcelAsync(
        string? search,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Empleados
            .Include(x => x.Persona)
            .AsNoTracking()
            .Where(x => x.Activo);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();

            query = query.Where(x =>
                (x.CodigoEmpleado != null &&
                 x.CodigoEmpleado.Contains(term)) ||
                x.Persona.Nombres.Contains(term) ||
                x.Persona.ApellidoPaterno.Contains(term) ||
                x.Persona.NumeroDocumento.Contains(term));
        }

        var empleados = await query
            .OrderBy(x => x.Persona.ApellidoPaterno)
            .ThenBy(x => x.Persona.ApellidoMaterno)
            .ThenBy(x => x.Persona.Nombres)
            .ToListAsync(cancellationToken);

        var options = new ExcelReportOptions
        {
            Title = "Directorio General de Empleados",
            Subtitle = string.IsNullOrWhiteSpace(search)
                ? "Recursos Humanos - Personal Activo"
                : $"Recursos Humanos - Filtro de búsqueda: \"{search}\"",
            SheetName = "Empleados",
            HeaderColor = "#1E40AF",
            GeneratedBy = currentUserService.UserId?.ToString()
        };

        return excelReportGenerator.Generate(options, empleados, builder =>
        {
            builder.AddColumn("Código", x => x.CodigoEmpleado ?? $"EMP-{x.Id:D5}", ExcelColumnAlignment.Center);
            builder.AddColumn("Tipo Doc.", x => x.Persona.TipoDocumento, ExcelColumnAlignment.Center);
            builder.AddColumn("Nro. Documento", x => string.IsNullOrWhiteSpace(x.Persona.ExtensionDocumento)
                ? x.Persona.NumeroDocumento
                : $"{x.Persona.NumeroDocumento} {x.Persona.ExtensionDocumento}", ExcelColumnAlignment.Center);
            builder.AddColumn("Nombres", x => x.Persona.Nombres);
            builder.AddColumn("Apellido Paterno", x => x.Persona.ApellidoPaterno);
            builder.AddColumn("Apellido Materno", x => x.Persona.ApellidoMaterno ?? string.Empty);
            builder.AddDateColumn("Fecha Nacimiento", x => x.Persona.FechaNacimiento);
            builder.AddColumn("Género", x => x.Persona.Genero ?? string.Empty, ExcelColumnAlignment.Center);
            builder.AddColumn("Estado Civil", x => x.Persona.EstadoCivil ?? string.Empty, ExcelColumnAlignment.Center);
            builder.AddColumn("Teléfono", x => x.Persona.Telefono ?? string.Empty, ExcelColumnAlignment.Center);
            builder.AddColumn("Dirección", x => x.Persona.Direccion ?? string.Empty);
            builder.AddDateColumn("Fecha Ingreso", x => x.FechaIngreso);
            builder.AddDateColumn("Fecha Retiro", x => x.FechaRetiro);
            builder.AddBooleanColumn("Estado", x => x.Activo, trueText: "Activo", falseText: "Inactivo");
        });
    }
}