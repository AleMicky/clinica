using Clinica.Modules.Personas.Application.Abstractions;
using Clinica.Modules.Personas.Application.Pacientes;
using Clinica.Modules.Personas.Application.Personas;
using Clinica.Modules.Personas.Domain.Entities;
using Clinica.Modules.Personas.Infrastructure.Persistence;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Personas.Infrastructure.Services;

public sealed class PacienteService(
    PersonasDbContext context,
    IPersonaService personaService
) : IPacienteService
{
    public Task<PagedResult<PacienteResponse>> GetPagedAsync(
        PagedRequest request,
        CancellationToken cancellationToken = default)
    {
        return GetPagedAsync(
            new PacientePagedRequest
            {
                Page = request.Page,
                PageSize = request.PageSize
            },
            cancellationToken);
    }

    public async Task<PagedResult<PacienteResponse>> GetPagedAsync(
        PacientePagedRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 10 : Math.Min(request.PageSize, 100);

        var query = ApplyFilters(context.Pacientes.AsNoTracking(), request);

        var total = await query.CountAsync(cancellationToken);

        var rows = await Project(query)
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = rows.Select(MapResponse).ToList();

        return new PagedResult<PacienteResponse>(items, total, page, pageSize);
    }

    public async Task<PacienteResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var row = await Project(context.Pacientes.AsNoTracking().Where(x => x.Id == id))
            .FirstOrDefaultAsync(cancellationToken);

        return row is null ? null : MapResponse(row);
    }

    public async Task<PacienteResponse> CreateAsync(
        CreatePacienteRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Modo == "nueva" && request.Persona is null)
            throw new BusinessException("Debe completar los datos de la nueva persona.");

        if (request.Modo == "existente" &&
            (request.PersonaId is not { } existingPersonaId || existingPersonaId == Guid.Empty))
            throw new BusinessException("Debe seleccionar una persona existente.");

        await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);

        PersonaResponse persona;

        if (request.Modo == "nueva")
        {
            persona = await personaService.CreateAsync(request.Persona!, cancellationToken);
        }
        else
        {
            persona = await personaService.GetByIdAsync(request.PersonaId!.Value, cancellationToken)
                      ?? throw new NotFoundException("Persona no encontrada.");
        }

        await EnsurePersonaNotPacienteAsync(persona.Id, null, cancellationToken);

        var numeroHistoria = await ResolveNumeroHistoriaClinicaAsync(
            request.NumeroHistoriaClinica,
            persona,
            null,
            cancellationToken);

        var entity = new Paciente
        {
            PersonaId = persona.Id,
            NumeroHistoriaClinica = numeroHistoria
        };

        context.Pacientes.Add(entity);
        await context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return ToResponse(entity.Id, entity.PersonaId, entity.NumeroHistoriaClinica, persona);
    }

    public async Task<PacienteResponse> UpdateAsync(
        Guid id,
        UpdatePacienteRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Pacientes
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Paciente no encontrado.");

        if (request.PersonaId != entity.PersonaId)
            throw new BusinessException("No se puede cambiar la persona asociada al paciente.");

        await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);

        PersonaResponse persona;

        if (request.Persona is not null)
        {
            persona = await personaService.UpdateAsync(entity.PersonaId, request.Persona, cancellationToken);
        }
        else
        {
            persona = await personaService.GetByIdAsync(entity.PersonaId, cancellationToken)
                      ?? throw new NotFoundException("Persona no encontrada.");
        }

        // La historia clínica no se edita: se conserva el valor existente.
        await transaction.CommitAsync(cancellationToken);

        return ToResponse(entity.Id, entity.PersonaId, entity.NumeroHistoriaClinica, persona);
    }

    public async Task DeleteAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Pacientes
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            throw new NotFoundException("Paciente no encontrado.");

        context.Pacientes.Remove(entity);
        await context.SaveChangesAsync(cancellationToken);
    }

    private static IQueryable<Paciente> ApplyFilters(
        IQueryable<Paciente> query,
        PacientePagedRequest request)
    {
        if (request.PersonaId is { } personaId && personaId != Guid.Empty)
            query = query.Where(x => x.PersonaId == personaId);

        if (!string.IsNullOrWhiteSpace(request.NumeroHistoriaClinica))
        {
            var hc = request.NumeroHistoriaClinica.Trim();
            query = query.Where(x => x.NumeroHistoriaClinica.Contains(hc));
        }

        if (!string.IsNullOrWhiteSpace(request.NumeroDocumento))
        {
            var documento = request.NumeroDocumento.Trim();
            query = query.Where(x =>
                x.Persona.NumeroDocumento.Contains(documento) ||
                (x.Persona.ComplementoDocumento != null &&
                 x.Persona.ComplementoDocumento.Contains(documento)));
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x =>
                x.NumeroHistoriaClinica.Contains(search) ||
                x.Persona.Nombres.Contains(search) ||
                x.Persona.ApellidoPaterno.Contains(search) ||
                x.Persona.ApellidoMaterno.Contains(search) ||
                x.Persona.NumeroDocumento.Contains(search) ||
                (x.Persona.ComplementoDocumento != null &&
                 x.Persona.ComplementoDocumento.Contains(search)));
        }

        return query;
    }

    private static IQueryable<PacienteListRow> Project(IQueryable<Paciente> query)
    {
        return query.Select(x => new PacienteListRow
        {
            Id = x.Id,
            PersonaId = x.PersonaId,
            CreatedAt = x.CreatedAt,
            NumeroHistoriaClinica = x.NumeroHistoriaClinica,
            TipoDocumentoId = x.Persona.TipoDocumentoId,
            TipoDocumentoNombre = x.Persona.TipoDocumento.Nombre,
            NumeroDocumento = x.Persona.NumeroDocumento,
            ExtensionDocumentoId = x.Persona.ExtensionDocumentoId,
            ExtensionDocumentoNombre = x.Persona.ExtensionDocumento != null
                ? x.Persona.ExtensionDocumento.Nombre
                : null,
            ComplementoDocumento = x.Persona.ComplementoDocumento,
            Nombres = x.Persona.Nombres,
            ApellidoPaterno = x.Persona.ApellidoPaterno,
            ApellidoMaterno = x.Persona.ApellidoMaterno,
            FechaNacimiento = x.Persona.FechaNacimiento,
            SexoId = x.Persona.SexoId,
            SexoNombre = x.Persona.Sexo.Nombre,
            EstadoCivilId = x.Persona.EstadoCivilId,
            EstadoCivilNombre = x.Persona.EstadoCivil.Nombre,
            Telefono = x.Persona.Telefono,
            Direccion = x.Persona.Direccion
        });
    }

    private async Task EnsurePersonaNotPacienteAsync(
        Guid personaId,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Pacientes
            .AnyAsync(x =>
                    x.PersonaId == personaId &&
                    (!currentId.HasValue || x.Id != currentId.Value),
                cancellationToken);

        if (exists)
            throw new BusinessException("La persona ya está registrada como paciente.");
    }

    private async Task<string> ResolveNumeroHistoriaClinicaAsync(
        string? requestedNumero,
        PersonaResponse persona,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        var baseNumero = string.IsNullOrWhiteSpace(requestedNumero)
            ? HistoriaClinicaGenerator.Generate(
                persona.Nombres,
                persona.ApellidoPaterno,
                persona.ApellidoMaterno,
                persona.NumeroDocumento)
            : requestedNumero.Trim();

        var candidate = baseNumero;
        var suffix = 1;

        while (await HistoriaClinicaExistsAsync(candidate, currentId, cancellationToken))
        {
            suffix++;
            candidate = $"{baseNumero}-{suffix}";

            if (candidate.Length > 30)
                throw new BusinessException(
                    "No se pudo generar un número de historia clínica único.");
        }

        return candidate;
    }

    private async Task<bool> HistoriaClinicaExistsAsync(
        string numeroHistoriaClinica,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        return await context.Pacientes
            .AnyAsync(x =>
                    x.NumeroHistoriaClinica == numeroHistoriaClinica &&
                    (!currentId.HasValue || x.Id != currentId.Value),
                cancellationToken);
    }

    private static PacienteResponse MapResponse(PacienteListRow row)
    {
        var nombreCompleto =
            $"{row.Nombres} {row.ApellidoPaterno} {row.ApellidoMaterno}".Trim();

        return new PacienteResponse(
            row.Id,
            row.PersonaId,
            nombreCompleto,
            row.NumeroHistoriaClinica,
            row.TipoDocumentoId,
            row.TipoDocumentoNombre,
            row.NumeroDocumento,
            row.ExtensionDocumentoId,
            row.ExtensionDocumentoNombre,
            row.ComplementoDocumento,
            row.Nombres,
            row.ApellidoPaterno,
            row.ApellidoMaterno,
            row.FechaNacimiento,
            row.SexoId,
            row.SexoNombre,
            row.EstadoCivilId,
            row.EstadoCivilNombre,
            row.Telefono,
            row.Direccion);
    }

    private static PacienteResponse ToResponse(
        Guid id,
        Guid personaId,
        string numeroHistoriaClinica,
        PersonaResponse persona)
    {
        return new PacienteResponse(
            id,
            personaId,
            persona.NombreCompleto,
            numeroHistoriaClinica,
            persona.TipoDocumentoId,
            persona.TipoDocumentoNombre,
            persona.NumeroDocumento,
            persona.ExtensionDocumentoId,
            persona.ExtensionDocumentoNombre,
            persona.ComplementoDocumento,
            persona.Nombres,
            persona.ApellidoPaterno,
            persona.ApellidoMaterno,
            persona.FechaNacimiento,
            persona.SexoId,
            persona.SexoNombre,
            persona.EstadoCivilId,
            persona.EstadoCivilNombre,
            persona.Telefono,
            persona.Direccion);
    }

    private sealed class PacienteListRow
    {
        public Guid Id { get; init; }
        public Guid PersonaId { get; init; }
        public DateTime CreatedAt { get; init; }
        public string NumeroHistoriaClinica { get; init; } = string.Empty;
        public Guid TipoDocumentoId { get; init; }
        public string TipoDocumentoNombre { get; init; } = string.Empty;
        public string NumeroDocumento { get; init; } = string.Empty;
        public Guid? ExtensionDocumentoId { get; init; }
        public string? ExtensionDocumentoNombre { get; init; }
        public string? ComplementoDocumento { get; init; }
        public string Nombres { get; init; } = string.Empty;
        public string ApellidoPaterno { get; init; } = string.Empty;
        public string ApellidoMaterno { get; init; } = string.Empty;
        public DateOnly FechaNacimiento { get; init; }
        public Guid SexoId { get; init; }
        public string SexoNombre { get; init; } = string.Empty;
        public Guid EstadoCivilId { get; init; }
        public string EstadoCivilNombre { get; init; } = string.Empty;
        public string Telefono { get; init; } = string.Empty;
        public string Direccion { get; init; } = string.Empty;
    }
}
