using Clinica.Api.Data;
using Clinica.Api.Modules.Recepcion.Pacientes.Dtos;
using Clinica.Api.Modules.Recepcion.Pacientes.Entity;
using Clinica.Api.Modules.Recepcion.Pacientes.Mappers;
using Clinica.Api.Modules.Seguridad.Personas.Entity;
using Clinica.Api.Shared.Exceptions;
using Clinica.Api.Shared.Extensions;
using Clinica.Api.Shared.Pagination;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Api.Modules.Recepcion.Pacientes.Services;

public sealed class PacienteService(AppDbContext dbContext)
{
    private DbSet<Paciente> Pacientes => dbContext.Set<Paciente>();
    private DbSet<Persona> Personas => dbContext.Set<Persona>();

    private IQueryable<Paciente> BuildQuery()
    {
        return Pacientes.Include(x => x.Persona);
    }

    public async Task<PagedResult<PacienteResponse>> ListarAsync(
        PaginationRequest pagination,
        string? search,
        CancellationToken cancellationToken = default)
    {
        var query = BuildQuery()
            .AsNoTracking()
            .Where(x => x.Activo);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();

            query = query.Where(x =>
                x.NumeroHistoriaClinica.Contains(term) ||
                x.Persona.Nombres.Contains(term) ||
                x.Persona.ApellidoPaterno.Contains(term) ||
                (x.Persona.ApellidoMaterno != null &&
                 x.Persona.ApellidoMaterno.Contains(term)) ||
                x.Persona.NumeroDocumento.Contains(term));
        }

        var totalItems = await query.CountAsync(cancellationToken);

        var pacientes = await query
            .OrderBy(x => x.Persona.ApellidoPaterno)
            .ThenBy(x => x.Persona.ApellidoMaterno)
            .ThenBy(x => x.Persona.Nombres)
            .Skip((pagination.ValidPage - 1) * pagination.ValidPageSize)
            .Take(pagination.ValidPageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<PacienteResponse>(
            PacienteMapper.ToResponseList(pacientes),
            pagination.ValidPage,
            pagination.ValidPageSize,
            totalItems
        );
    }

    public async Task<PacienteResponse> ObtenerAsync(int id, CancellationToken cancellationToken = default)
    {
        var paciente = await BuildQuery()
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Activo,
                cancellationToken);

        return paciente is null
            ? throw new NotFoundException(nameof(Paciente), id)
            : PacienteMapper.ToResponse(paciente);
    }

    public async Task<PacienteResponse> CrearAsync(
        CreatePacienteRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidarDocumentoDuplicadoAsync(
            request.TipoDocumento,
            request.NumeroDocumento,
            request.ComplementoDocumento,
            personaId: null,
            cancellationToken);

        var paciente = PacienteMapper.ToEntity(request);

        NormalizarPersona(paciente.Persona);

        paciente.NumeroHistoriaClinica = GenerarNumeroHistoriaClinica(request);

        await ValidarNumeroHistoriaClinicaUnicoAsync(paciente.NumeroHistoriaClinica, cancellationToken);
        await Pacientes.AddAsync(paciente, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(paciente.Id, cancellationToken);
    }

    public async Task<PacienteResponse> ActualizarAsync(
        int id,
        UpdatePacienteRequest request,
        CancellationToken cancellationToken = default)
    {
        var paciente = await Pacientes
            .Include(x => x.Persona)
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Activo,
                cancellationToken);

        if (paciente is null)
        {
            throw new NotFoundException(nameof(Paciente), id);
        }

        await ValidarDocumentoDuplicadoAsync(
            request.TipoDocumento,
            request.NumeroDocumento,
            request.ComplementoDocumento,
            paciente.PersonaId,
            cancellationToken
        );

        PacienteMapper.UpdateEntity(request, paciente);

        NormalizarPersona(paciente.Persona);

        await dbContext.SaveChangesAsync(cancellationToken);

        return await ObtenerAsync(paciente.Id, cancellationToken);
    }

    public async Task EliminarAsync(int id, CancellationToken cancellationToken = default)
    {
        var paciente = await Pacientes
            .FirstOrDefaultAsync(x => x.Id == id && x.Activo, cancellationToken);

        if (paciente is null)
        {
            throw new NotFoundException(nameof(Paciente), id);
        }

        paciente.Activo = false;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task ValidarNumeroHistoriaClinicaUnicoAsync(
        string numeroHistoriaClinica,
        CancellationToken cancellationToken)
    {
        var existe = await Pacientes
            .AsNoTracking()
            .AnyAsync(
                x => x.NumeroHistoriaClinica == numeroHistoriaClinica,
                cancellationToken);

        if (existe)
        {
            throw new ConflictException(
                $"Ya existe un paciente con el número de historia clínica '{numeroHistoriaClinica}'.");
        }
    }

    private async Task ValidarDocumentoDuplicadoAsync(
        string tipoDocumento,
        string numeroDocumento,
        string? complementoDocumento,
        int? personaId,
        CancellationToken cancellationToken)
    {
        var numero = numeroDocumento
            .Trim()
            .ToUpperInvariant();


        var existe = await Personas
            .AsNoTracking()
            .AnyAsync(x =>
                    (!personaId.HasValue ||
                     x.Id != personaId.Value) &&
                    x.TipoDocumento == tipoDocumento &&
                    x.NumeroDocumento == numero &&
                    x.ComplementoDocumento == complementoDocumento.TrimUpperOrNull(),
                cancellationToken);

        if (existe)
        {
            throw new ConflictException("Ya existe una persona registrada con el mismo documento.");
        }
    }

    private static string GenerarNumeroHistoriaClinica(int pacienteId)
    {
        return $"HC-{pacienteId:D8}";
    }

    private static void NormalizarPersona(Persona persona)
    {
        persona.Nombres = persona.Nombres.TrimRequired();
        persona.ApellidoPaterno = persona.ApellidoPaterno.TrimRequired();
        persona.ApellidoMaterno = persona.ApellidoMaterno.TrimOrNull();
        persona.Telefono = persona.Telefono.TrimOrNull();
        persona.Direccion = persona.Direccion.TrimOrNull();
        persona.NumeroDocumento = persona.NumeroDocumento.TrimUpperRequired();
        persona.ExtensionDocumento = persona.ExtensionDocumento.TrimUpperOrNull();
        persona.ComplementoDocumento = persona.ComplementoDocumento.TrimUpperOrNull();
    }

    private static string GenerarNumeroHistoriaClinica(
        CreatePacienteRequest request)
    {
        var iniciales = string.Concat(
            ObtenerInicial(request.Nombres),
            ObtenerInicial(request.ApellidoPaterno),
            ObtenerInicial(request.ApellidoMaterno));

        var numeroDocumento =
            NormalizarCodigo(request.NumeroDocumento);

        var complemento =
            NormalizarCodigo(request.ComplementoDocumento);

        return string.IsNullOrEmpty(complemento)
            ? $"{iniciales}-{numeroDocumento}"
            : $"{iniciales}-{numeroDocumento}-{complemento}";
    }

    private static string ObtenerInicial(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return string.Empty;

        return char.ToUpperInvariant(
                value.Trim()[0])
            .ToString();
    }

    private static string? NormalizarCodigo(
        string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        return new string(
            value
                .Trim()
                .ToUpperInvariant()
                .Where(char.IsLetterOrDigit)
                .ToArray());
    }
}