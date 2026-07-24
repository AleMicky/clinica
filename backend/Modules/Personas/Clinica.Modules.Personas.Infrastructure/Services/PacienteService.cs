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
        var pageSize = request.PageSize <= 0 ? 10 : request.PageSize;

        var query = context.Pacientes
            .AsNoTracking()
            .AsQueryable();

        if (request.PersonaId is { } personaId && personaId != Guid.Empty)
            query = query.Where(x => x.PersonaId == personaId);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim();
            query = query.Where(x =>
                x.NumeroHistoriaClinica.Contains(search) ||
                x.Persona.Nombres.Contains(search) ||
                x.Persona.ApellidoPaterno.Contains(search) ||
                x.Persona.ApellidoMaterno.Contains(search) ||
                x.Persona.NumeroDocumento.Contains(search));
        }

        var total = await query.CountAsync(cancellationToken);

        var entities = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var personas = await personaService.GetByIdsAsync(
            entities.Select(x => x.PersonaId),
            cancellationToken);

        var items = entities
            .Select(x => ToResponse(x, personas.GetValueOrDefault(x.PersonaId)))
            .ToList();

        return new PagedResult<PacienteResponse>(items, total, page, pageSize);
    }

    public async Task<PacienteResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var entity = await context.Pacientes
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (entity is null)
            return null;

        var personas = await personaService.GetByIdsAsync(
            [entity.PersonaId],
            cancellationToken);

        return ToResponse(entity, personas.GetValueOrDefault(entity.PersonaId));
    }

    public async Task<PacienteResponse> CreateAsync(
        CreatePacienteRequest request,
        CancellationToken cancellationToken = default)
    {
        PersonaResponse persona;
        var personaCreated = false;

        if (request.Modo == "nueva")
        {
            if (request.Persona is null)
                throw new BusinessException("Debe completar los datos de la nueva persona.");

            persona = await personaService.CreateAsync(request.Persona, cancellationToken);
            personaCreated = true;
        }
        else
        {
            if (request.PersonaId is not { } personaId || personaId == Guid.Empty)
                throw new BusinessException("Debe seleccionar una persona existente.");

            persona = await personaService.GetByIdAsync(personaId, cancellationToken)
                      ?? throw new NotFoundException("Persona no encontrada.");
        }

        try
        {
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

            return (await GetByIdAsync(entity.Id, cancellationToken))!;
        }
        catch
        {
            if (personaCreated)
                await personaService.DeleteAsync(persona.Id, cancellationToken);

            throw;
        }
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

        await EnsurePersonaExistsAsync(request.PersonaId, cancellationToken);
        await EnsurePersonaNotPacienteAsync(request.PersonaId, id, cancellationToken);

        var numeroHistoria = Normalize(request.NumeroHistoriaClinica);
        await EnsureHistoriaClinicaIsUniqueAsync(numeroHistoria, id, cancellationToken);

        entity.PersonaId = request.PersonaId;
        entity.NumeroHistoriaClinica = numeroHistoria;

        await context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(entity.Id, cancellationToken))!;
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

    private async Task EnsurePersonaExistsAsync(
        Guid personaId,
        CancellationToken cancellationToken)
    {
        var exists = await context.Personas
            .AnyAsync(x => x.Id == personaId, cancellationToken);

        if (!exists)
            throw new BusinessException("La persona no existe.");
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
            : Normalize(requestedNumero);

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

    private async Task EnsureHistoriaClinicaIsUniqueAsync(
        string numeroHistoriaClinica,
        Guid? currentId,
        CancellationToken cancellationToken)
    {
        if (await HistoriaClinicaExistsAsync(numeroHistoriaClinica, currentId, cancellationToken))
            throw new BusinessException("El número de historia clínica ya existe.");
    }

    private static string Normalize(string value) => value.Trim();

    private static PacienteResponse ToResponse(Paciente entity, PersonaResponse? persona)
    {
        if (persona is null)
        {
            return new PacienteResponse(
                entity.Id,
                entity.PersonaId,
                string.Empty,
                entity.NumeroHistoriaClinica,
                string.Empty,
                string.Empty,
                null,
                null,
                default,
                string.Empty,
                string.Empty,
                string.Empty);
        }

        return new PacienteResponse(
            entity.Id,
            entity.PersonaId,
            persona.NombreCompleto,
            entity.NumeroHistoriaClinica,
            persona.TipoDocumentoNombre,
            persona.NumeroDocumento,
            persona.ExtensionDocumentoNombre,
            persona.ComplementoDocumento,
            persona.FechaNacimiento,
            persona.SexoNombre,
            persona.Telefono,
            persona.Direccion);
    }
}
