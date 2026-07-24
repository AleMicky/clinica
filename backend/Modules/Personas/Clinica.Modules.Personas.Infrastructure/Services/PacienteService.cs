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

        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ProjectToResponse()
            .ToListAsync(cancellationToken);

        return new PagedResult<PacienteResponse>(items, total, page, pageSize);
    }

    public async Task<PacienteResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await context.Pacientes
            .AsNoTracking()
            .Where(x => x.Id == id)
            .ProjectToResponse()
            .FirstOrDefaultAsync(cancellationToken);
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

        return PacienteMapper.ToResponse(persona, entity.Id, entity.NumeroHistoriaClinica);
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

        return PacienteMapper.ToResponse(persona, entity.Id, entity.NumeroHistoriaClinica);
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
}
