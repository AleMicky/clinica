using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.Atenciones;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.Modules.Caja.Application.Abstractions;
using Clinica.Modules.Caja.Application.Cargos;
using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.Correlativos;
using Clinica.Modules.Personas.Application.Abstractions;
using Clinica.Modules.Personas.Application.Pacientes;
using Clinica.Modules.Personas.Application.Personas;
using Clinica.Modules.Personas.Domain.Entities;
using Clinica.Modules.Workflow.Application.Abstractions;
using Clinica.Modules.Workflow.Application.WorkflowInstances;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Text;
using Microsoft.EntityFrameworkCore;
using AtencionEntity = Clinica.Modules.AtencionMedica.Domain.Entities.Atencion;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class AtencionService(
    AtencionMedicaDbContext context,
    ICorrelativoService correlativoService,
    IPacienteService pacienteService,
    ICajaCargoService cajaCargoService,
    IWorkflowInstanceService workflowInstanceService) : IAtencionService
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
        var query = context.Atenciones.AsNoTracking();

        if (request.PacienteId is { } pacienteId && pacienteId != Guid.Empty)
            query = query.Where(x => x.PacienteId == pacienteId);

        if (request.TipoAtencionId is { } tipoAtencionId && tipoAtencionId != Guid.Empty)
            query = query.Where(x => x.TipoAtencionId == tipoAtencionId);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(a =>
                a.NumeroAtencion.Contains(search)
                || (a.Observaciones != null && a.Observaciones.Contains(search))
                || context.Set<Paciente>().Any(p =>
                    p.Id == a.PacienteId
                    && (p.NumeroHistoriaClinica.Contains(search)
                        || p.Persona.Nombres.Contains(search)
                        || p.Persona.ApellidoPaterno.Contains(search)
                        || p.Persona.ApellidoMaterno.Contains(search)
                        || p.Persona.NumeroDocumento.Contains(search))));
        }

        var ordered = query
            .OrderByDescending(x => x.FechaAtencion)
            .ThenBy(x => x.NumeroAtencion);

        return await ProjectToResponse(ordered)
            .ToPagedResultAsync(request, cancellationToken);
    }

    public async Task<AtencionResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await ProjectToResponse(
                context.Atenciones.AsNoTracking().Where(x => x.Id == id))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<AtencionResponse> RecepcionarAsync(
        RecepcionarAtencionRequest request,
        CancellationToken cancellationToken = default)
    {
        var tipo = await context.TiposAtencion
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.TipoAtencionId, cancellationToken)
            ?? throw new BusinessException("El tipo de atención no existe.");

        var formularioActivo = await context.FormulariosClinicos
            .AsNoTracking()
            .Where(x => x.TipoAtencionId == request.TipoAtencionId && x.Activo)
            .OrderByDescending(x => x.Version)
            .ThenByDescending(x => x.Codigo)
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new BusinessException(
                "No hay un formulario clínico activo para este tipo de atención.");

        Guid pacienteId;

        if (request.PacienteId is { } existingPacienteId && existingPacienteId != Guid.Empty)
        {
            await EnsurePacienteExistsAsync(existingPacienteId, cancellationToken);
            pacienteId = existingPacienteId;
        }
        else if (request.PacienteNuevo is { } nuevo)
        {
            var paciente = await pacienteService.CreateAsync(
                new CreatePacienteRequest(
                    Modo: "nueva",
                    PersonaId: null,
                    Persona: new CreatePersonaRequest(
                        TipoDocumentoId: nuevo.TipoDocumentoId,
                        NumeroDocumento: nuevo.NumeroDocumento,
                        Nombres: nuevo.Nombres,
                        ApellidoPaterno: nuevo.ApellidoPaterno,
                        ApellidoMaterno: nuevo.ApellidoMaterno ?? string.Empty,
                        FechaNacimiento: nuevo.FechaNacimiento,
                        SexoId: nuevo.SexoId,
                        EstadoCivilId: nuevo.EstadoCivilId,
                        Telefono: nuevo.Telefono,
                        Direccion: nuevo.Direccion ?? string.Empty,
                        ExtensionDocumentoId: nuevo.ExtensionDocumentoId,
                        ComplementoDocumento: nuevo.ComplementoDocumento),
                    NumeroHistoriaClinica: null),
                cancellationToken);

            pacienteId = paciente.Id;
        }
        else
        {
            throw new BusinessException(
                "Debe indicar un paciente existente o los datos del paciente nuevo.");
        }

        var fechaAtencion = request.FechaAtencion ?? DateTime.UtcNow;
        var fechaRecepcion = DateTime.UtcNow;

        var codigoCorrelativo = tipo.Codigo.Trim().ToUpperInvariant();
        var prefijo = codigoCorrelativo.Length <= 20
            ? codigoCorrelativo
            : codigoCorrelativo[..20];

        var correlativo = await correlativoService.GenerarAsync(
            new GenerarCorrelativoRequest(codigoCorrelativo, Prefijo: prefijo),
            cancellationToken);

        var entity = new AtencionEntity
        {
            NumeroAtencion = correlativo.NumeroFormateado,
            PacienteId = pacienteId,
            TipoAtencionId = request.TipoAtencionId,
            FormularioClinicoId = formularioActivo.Id,
            FechaAtencion = fechaAtencion,
            FechaRecepcion = fechaRecepcion,
            Estado = "BORRADOR",
            Observaciones = StringNormalize.Optional(request.Observaciones)
        };

        context.Atenciones.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return await GetRequiredResponseAsync(entity.Id, cancellationToken);
    }

    public async Task<AtencionResponse> CreateAsync(
        CreateAtencionRequest request,
        CancellationToken cancellationToken = default)
    {
        var validation = await (
            from t in context.TiposAtencion.AsNoTracking()
            where t.Id == request.TipoAtencionId
            select new
            {
                t.Codigo,
                PacienteExiste = context.Set<Paciente>().Any(p => p.Id == request.PacienteId),
                FormularioTipoAtencionId = context.FormulariosClinicos
                    .Where(f => f.Id == request.FormularioClinicoId)
                    .Select(f => (Guid?)f.TipoAtencionId)
                    .FirstOrDefault()
            }).FirstOrDefaultAsync(cancellationToken);

        if (validation is null)
            throw new BusinessException("El tipo de atención no existe.");

        if (!validation.PacienteExiste)
            throw new BusinessException("El paciente no existe.");

        if (validation.FormularioTipoAtencionId is null)
            throw new BusinessException("El formulario clínico no existe.");

        if (validation.FormularioTipoAtencionId != request.TipoAtencionId)
            throw new BusinessException("El formulario no corresponde al tipo de atención.");

        var codigoCorrelativo = validation.Codigo.Trim().ToUpperInvariant();
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
            FechaRecepcion = DateTime.UtcNow,
            Estado = "BORRADOR",
            Observaciones = StringNormalize.Optional(request.Observaciones)
        };

        context.Atenciones.Add(entity);
        await context.SaveChangesAsync(cancellationToken);

        return await GetRequiredResponseAsync(entity.Id, cancellationToken);
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
        entity.Observaciones = StringNormalize.Optional(request.Observaciones);

        await context.SaveChangesAsync(cancellationToken);

        return await GetRequiredResponseAsync(entity.Id, cancellationToken);
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

    public async Task<AtencionResponse> EnviarACajaAsync(
        Guid id,
        EnviarACajaRequest request,
        CancellationToken cancellationToken = default)
    {
        var atencion = await context.Atenciones
            .Include(x => x.TipoAtencion)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Atención no encontrada.");

        if (atencion.TipoAtencion.PrecioBase < 0)
            throw new BusinessException("El tipo de atención no tiene un precio válido.");

        var instance = atencion.WorkflowInstanceId.HasValue
            ? await workflowInstanceService.GetByIdAsync(
                atencion.WorkflowInstanceId.Value,
                cancellationToken)
            : await workflowInstanceService.GetByReferenceAsync(
                "AtencionMedica",
                "Atencion",
                atencion.Id,
                cancellationToken);

        if (instance is null)
        {
            instance = await workflowInstanceService.StartAsync(
                new StartWorkflowInstanceRequest(
                    "ATENCION_MEDICA",
                    "AtencionMedica",
                    "Atencion",
                    atencion.Id,
                    request.EmpleadoId),
                cancellationToken);
        }

        atencion.WorkflowInstanceId = instance.Id;
        await context.SaveChangesAsync(cancellationToken);

        // Avanzar workflow hasta CONSULTA_MEDICA si hace falta, luego ENVIAR_CAJA.
        // Si ya está en CONSULTA_MEDICA o posterior, solo intenta ENVIAR_CAJA.
        if (!string.Equals(instance.CurrentStateCode, "PENDIENTE_PAGO", StringComparison.OrdinalIgnoreCase)
            && !string.Equals(instance.CurrentStateCode, "PAGADO", StringComparison.OrdinalIgnoreCase)
            && !string.Equals(instance.CurrentStateCode, "FINALIZADO", StringComparison.OrdinalIgnoreCase))
        {
            if (!string.Equals(instance.CurrentStateCode, "CONSULTA_MEDICA", StringComparison.OrdinalIgnoreCase))
            {
                // No forzamos todo el flujo lineal aquí: exige estar en CONSULTA_MEDICA.
                throw new BusinessException(
                    $"La atención debe estar en consulta médica para enviar a caja (estado actual: {instance.CurrentStateCode}).");
            }

            instance = await workflowInstanceService.ExecuteAsync(
                instance.Id,
                new ExecuteWorkflowTransitionRequest(
                    "ENVIAR_CAJA",
                    request.EmpleadoId,
                    "Enviado a caja desde atención."),
                cancellationToken);
        }

        await cajaCargoService.AgregarCargosAsync(
            new AgregarCargosRequest(
                atencion.PacienteId,
                "AtencionMedica",
                "Atencion",
                atencion.Id,
                instance.Id,
                $"Atención {atencion.NumeroAtencion}",
                [
                    new AgregarCargosLineaRequest(
                        atencion.TipoAtencion.Nombre,
                        atencion.TipoAtencion.Codigo,
                        1,
                        atencion.TipoAtencion.PrecioBase,
                        atencion.TipoAtencionId)
                ]),
            cancellationToken);

        atencion.Estado = "PENDIENTE_PAGO";
        atencion.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);

        return await GetRequiredResponseAsync(atencion.Id, cancellationToken);
    }

    public async Task SetEstadoAsync(
        Guid id,
        string estado,
        CancellationToken cancellationToken = default)
    {
        var atencion = await context.Atenciones
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken)
            ?? throw new NotFoundException("Atención no encontrada.");

        atencion.Estado = estado.Trim().ToUpperInvariant();
        atencion.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync(cancellationToken);
    }

    private async Task<AtencionResponse> GetRequiredResponseAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await ProjectToResponse(
                context.Atenciones.AsNoTracking().Where(x => x.Id == id))
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException("Atención no encontrada.");
    }

    private IQueryable<AtencionResponse> ProjectToResponse(IQueryable<AtencionEntity> query)
    {
        return
            from a in query
            join p in context.Set<Paciente>().AsNoTracking() on a.PacienteId equals p.Id
            select new AtencionResponse(
                a.Id,
                a.NumeroAtencion,
                a.PacienteId,
                a.TipoAtencionId,
                a.MedicoId,
                a.FormularioClinicoId,
                a.FechaAtencion,
                a.FechaRecepcion,
                a.Estado,
                a.WorkflowInstanceId,
                a.Observaciones,
                (p.Persona.Nombres + " " + p.Persona.ApellidoPaterno + " " + p.Persona.ApellidoMaterno).Trim(),
                p.NumeroHistoriaClinica,
                a.TipoAtencion.Nombre,
                a.TipoAtencion.Codigo,
                a.TipoAtencion.Color,
                a.TipoAtencion.Icono,
                a.FormularioClinico != null ? a.FormularioClinico.Nombre : null);
    }
}
