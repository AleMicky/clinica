using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.Atenciones;
using Clinica.Modules.AtencionMedica.Application.Recepcion;
using Clinica.Modules.AtencionMedica.Domain.Constants;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.Modules.Personas.Domain.Entities;
using Clinica.Modules.RecursosHumanos.Domain.Entities;
using Clinica.SharedKernel.Exceptions;
using Microsoft.EntityFrameworkCore;
using AtencionEntity = Clinica.Modules.AtencionMedica.Domain.Entities.Atencion;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class RecepcionAtencionService(
    AtencionMedicaDbContext context,
    IWorkflowService workflowService) : IRecepcionAtencionService
{
    public async Task<AtencionResponse> CrearRecepcionAtencionAsync(
        CrearRecepcionAtencionRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsurePacienteExistsAsync(request.PacienteId, cancellationToken);
        await EnsureTipoAtencionExistsAsync(request.TipoAtencionId, cancellationToken);
        await EnsureServicioExistsAsync(request.ServicioId, cancellationToken);
        await EnsureEspecialidadExistsAsync(request.EspecialidadId, cancellationToken);
        await EnsureMedicoExistsAsync(request.MedicoId, cancellationToken);

        var now = DateTime.UtcNow;
        var numeroAtencion = await GenerateNumeroAtencionAsync(now.Year, cancellationToken);

        var entity = new AtencionEntity
        {
            NumeroAtencion = numeroAtencion,
            PacienteId = request.PacienteId,
            TipoAtencionId = request.TipoAtencionId,
            ServicioId = request.ServicioId,
            EspecialidadId = request.EspecialidadId,
            MedicoId = request.MedicoId,
            MotivoConsulta = Normalize(request.MotivoConsulta),
            FechaAtencion = now,
            FechaRecepcion = now,
            Estado = AtencionEstados.Recepcion,
            ResponsableFinancieroNombre = NormalizeOptional(request.ResponsableFinancieroNombre),
            ResponsableFinancieroDocumento = NormalizeOptional(request.ResponsableFinancieroDocumento),
            ResponsableFinancieroTelefono = NormalizeOptional(request.ResponsableFinancieroTelefono),
            SeguroNombre = NormalizeOptional(request.SeguroNombre),
            NumeroAfiliacion = NormalizeOptional(request.NumeroAfiliacion),
            Observaciones = NormalizeOptional(request.Observaciones)
        };

        context.Atenciones.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        var workflowInstanceId = await workflowService.IniciarAtencionMedicaEnRecepcionAsync(
            entity.Id,
            cancellationToken);

        if (workflowInstanceId.HasValue)
        {
            entity.WorkflowInstanceId = workflowInstanceId;
            await context.SaveChangesAsync(cancellationToken);
        }

        return AtencionMappings.ToResponse(entity);
    }

    public async Task<IReadOnlyCollection<AtencionResponse>> GetPendientesAsync(
        CancellationToken cancellationToken = default)
    {
        return await context.Atenciones
            .AsNoTracking()
            .Where(x => x.Estado == AtencionEstados.Recepcion)
            .OrderByDescending(x => x.FechaRecepcion)
            .ThenBy(x => x.NumeroAtencion)
            .Select(x => AtencionMappings.ToResponse(x))
            .ToListAsync(cancellationToken);
    }

    public async Task<AtencionResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.Atenciones
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => AtencionMappings.ToResponse(x))
            .FirstOrDefaultAsync(cancellationToken);
    }

    private async Task<string> GenerateNumeroAtencionAsync(
        int year,
        CancellationToken cancellationToken)
    {
        var prefix = $"AT-{year}-";

        var lastNumber = await context.Atenciones
            .AsNoTracking()
            .Where(x => x.NumeroAtencion.StartsWith(prefix))
            .OrderByDescending(x => x.NumeroAtencion)
            .Select(x => x.NumeroAtencion)
            .FirstOrDefaultAsync(cancellationToken);

        var nextSequence = 1;

        if (lastNumber is not null)
        {
            var suffix = lastNumber[prefix.Length..];
            if (int.TryParse(suffix, out var parsed))
                nextSequence = parsed + 1;
        }

        return $"{prefix}{nextSequence:D6}";
    }

    private async Task EnsurePacienteExistsAsync(
        Guid pacienteId,
        CancellationToken cancellationToken)
    {
        if (!await context.Set<Paciente>().AnyAsync(x => x.Id == pacienteId, cancellationToken))
            throw new BusinessException("El paciente no existe.");
    }

    private async Task EnsureTipoAtencionExistsAsync(
        Guid tipoAtencionId,
        CancellationToken cancellationToken)
    {
        if (!await context.TiposAtencion.AnyAsync(x => x.Id == tipoAtencionId, cancellationToken))
            throw new BusinessException("El tipo de atención no existe.");
    }

    private async Task EnsureServicioExistsAsync(
        Guid servicioId,
        CancellationToken cancellationToken)
    {
        if (!await context.Set<Servicio>().AnyAsync(x => x.Id == servicioId, cancellationToken))
            throw new BusinessException("El servicio no existe.");
    }

    private async Task EnsureEspecialidadExistsAsync(
        Guid? especialidadId,
        CancellationToken cancellationToken)
    {
        if (!especialidadId.HasValue || especialidadId == Guid.Empty)
            return;

        if (!await context.Set<Especialidad>().AnyAsync(x => x.Id == especialidadId, cancellationToken))
            throw new BusinessException("La especialidad no existe.");
    }

    private async Task EnsureMedicoExistsAsync(
        Guid? medicoId,
        CancellationToken cancellationToken)
    {
        if (!medicoId.HasValue || medicoId == Guid.Empty)
            return;

        if (!await context.Set<Medico>().AnyAsync(x => x.Id == medicoId, cancellationToken))
            throw new BusinessException("El médico no existe.");
    }

    private static string Normalize(string value) => value.Trim();

    private static string? NormalizeOptional(string? value)
    {
        if (value is null) return null;
        var trimmed = value.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }
}
