using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.Atenciones;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.Correlativos;
using Clinica.Modules.Personas.Domain.Entities;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;
using AtencionEntity = Clinica.Modules.AtencionMedica.Domain.Entities.Atencion;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class AtencionService(
    AtencionMedicaDbContext context,
    ICorrelativoService correlativoService) : IAtencionService
{
    public Task<PagedResult<AtencionResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return GetPagedAsync(
            new AtencionPagedRequest
            {
                Page = request.Page,
                PageSize = request.PageSize
            },
            cancellationToken);
    }

    public async Task<PagedResult<AtencionResponse>> GetPagedAsync(
        AtencionPagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.Atenciones.AsNoTracking();

        if (request.PacienteId is { } pacienteId && pacienteId != Guid.Empty)
            query = query.Where(x => x.PacienteId == pacienteId);

        if (request.TipoAtencionId is { } tipoAtencionId && tipoAtencionId != Guid.Empty)
            query = query.Where(x => x.TipoAtencionId == tipoAtencionId);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(x => x.FechaAtencion)
            .ThenBy(x => x.NumeroAtencion)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x))
            .ToListAsync(cancellationToken);

        return new PagedResult<AtencionResponse>(items, total, page, pageSize);
    }

    public async Task<AtencionResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.Atenciones
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<AtencionResponse> CreateAsync(
        CreateAtencionRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsurePacienteExistsAsync(request.PacienteId, cancellationToken);
        var tipoAtencionCodigo = await GetTipoAtencionCodigoAsync(request.TipoAtencionId, cancellationToken);
        await EnsureFormularioClinicoMatchesTipoAsync(
            request.FormularioClinicoId,
            request.TipoAtencionId,
            cancellationToken);

        var codigoCorrelativo = tipoAtencionCodigo.Trim().ToUpperInvariant();
        var prefijo = codigoCorrelativo.Length <= 20
            ? codigoCorrelativo
            : codigoCorrelativo[..20];

        var correlativo = await correlativoService.GenerarAsync(
            new GenerarCorrelativoRequest(codigoCorrelativo, Prefijo: prefijo),
            cancellationToken);

        var entity = new AtencionEntity
        {
            NumeroAtencion = correlativo.NumeroFormateado,
            PacienteId = request.PacienteId,
            TipoAtencionId = request.TipoAtencionId,
            FormularioClinicoId = request.FormularioClinicoId,
            FechaAtencion = request.FechaAtencion,
            Estado = "BORRADOR",
            Observaciones = NormalizeOptional(request.Observaciones)
        };

        context.Atenciones.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task<AtencionResponse> UpdateAsync(
        Guid id,
        UpdateAtencionRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Atenciones
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Atención no encontrada.");

        await EnsurePacienteExistsAsync(request.PacienteId, cancellationToken);
        await EnsureTipoAtencionExistsAsync(request.TipoAtencionId, cancellationToken);
        await EnsureFormularioClinicoMatchesTipoAsync(
            request.FormularioClinicoId,
            request.TipoAtencionId,
            cancellationToken);

        
        entity.PacienteId = request.PacienteId;
        entity.TipoAtencionId = request.TipoAtencionId;
        entity.FormularioClinicoId = request.FormularioClinicoId;
        entity.FechaAtencion = request.FechaAtencion;
        entity.Observaciones = NormalizeOptional(request.Observaciones);

        await context.SaveChangesAsync(cancellationToken);

        return ToResponse(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await context.Atenciones
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Atención no encontrada.");

        context.Atenciones.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsurePacienteExistsAsync(
        Guid pacienteId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Set<Paciente>()
            .AnyAsync(x => x.Id == pacienteId, cancellationToken);

        if (!exists)
            throw new BusinessException("El paciente no existe.");
    }

    private async Task EnsureTipoAtencionExistsAsync(
        Guid tipoAtencionId,
        CancellationToken cancellationToken)
    {
        var exists = await context.TiposAtencion
            .AnyAsync(x => x.Id == tipoAtencionId, cancellationToken);

        if (!exists)
            throw new BusinessException("El tipo de atención no existe.");
    }

    private async Task<string> GetTipoAtencionCodigoAsync(
        Guid tipoAtencionId,
        CancellationToken cancellationToken)
    {
        var codigo = await context.TiposAtencion
            .AsNoTracking()
            .Where(x => x.Id == tipoAtencionId)
            .Select(x => x.Codigo)
            .FirstOrDefaultAsync(cancellationToken);

        return codigo ?? throw new BusinessException("El tipo de atención no existe.");
    }

    private async Task EnsureFormularioClinicoMatchesTipoAsync(
        Guid formularioClinicoId,
        Guid tipoAtencionId,
        CancellationToken cancellationToken)
    {
        var formulario = await context.FormulariosClinicos
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == formularioClinicoId, cancellationToken);

        if (formulario is null)
            throw new BusinessException("El formulario clínico no existe.");

        if (formulario.TipoAtencionId != tipoAtencionId)
            throw new BusinessException("El formulario no corresponde al tipo de atención.");
    }

    private static AtencionResponse ToResponse(AtencionEntity entity) =>
        new(
            entity.Id,
            entity.NumeroAtencion,
            entity.PacienteId,
            entity.TipoAtencionId,
            entity.ServicioId,
            entity.EspecialidadId,
            entity.MedicoId,
            entity.MotivoConsulta,
            entity.FormularioClinicoId,
            entity.FechaAtencion,
            entity.FechaRecepcion,
            entity.Estado,
            entity.WorkflowInstanceId,
            entity.ResponsableFinancieroNombre,
            entity.ResponsableFinancieroDocumento,
            entity.ResponsableFinancieroTelefono,
            entity.SeguroNombre,
            entity.NumeroAfiliacion,
            entity.Observaciones);

    private static string? NormalizeOptional(string? value)
    {
        if (value is null) return null;
        var trimmed = value.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }
}
