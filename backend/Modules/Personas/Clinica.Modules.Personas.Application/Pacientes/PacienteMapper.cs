using Clinica.Modules.Personas.Application.Personas;
using Clinica.Modules.Personas.Domain.Entities;
using Riok.Mapperly.Abstractions;

namespace Clinica.Modules.Personas.Application.Pacientes;

[Mapper(RequiredMappingStrategy = RequiredMappingStrategy.Target)]
public static partial class PacienteMapper
{
    public static partial IQueryable<PacienteResponse> ProjectToResponse(this IQueryable<Paciente> query);

    [MapNestedProperties(nameof(Paciente.Persona))]
    [MapPropertyFromSource(nameof(PacienteResponse.PersonaNombreCompleto), Use = nameof(MapNombreCompleto))]
    private static partial PacienteResponse MapToResponse(Paciente paciente);

    [MapProperty(nameof(PersonaResponse.Id), nameof(PacienteResponse.PersonaId))]
    [MapProperty(nameof(PersonaResponse.NombreCompleto), nameof(PacienteResponse.PersonaNombreCompleto))]
    public static partial PacienteResponse ToResponse(
        PersonaResponse persona,
        Guid id,
        string numeroHistoriaClinica);

    private static string MapNombreCompleto(Paciente paciente) =>
        (paciente.Persona.Nombres + " " + paciente.Persona.ApellidoPaterno + " " +
         paciente.Persona.ApellidoMaterno).Trim();
}
