using Clinica.Api.Modules.Recepcion.Pacientes.Dtos;
using Clinica.Api.Modules.Recepcion.Pacientes.Entity;
using Clinica.Api.Modules.Seguridad.Personas.Entity;
using Riok.Mapperly.Abstractions;

namespace Clinica.Api.Modules.Recepcion.Pacientes.Mappers;

[Mapper]
public static partial class PacienteMapper
{
    // Paciente -> Response
    [MapperIgnoreSource(nameof(Paciente.PersonaId))]
    public static partial PacienteResponse ToResponse(Paciente paciente);

    // Colección -> Response
    public static partial List<PacienteResponse> ToResponseList(
        IEnumerable<Paciente> pacientes);

    // Persona -> Response anidado
    [MapperIgnoreSource(nameof(Persona.FechaCreacion))]
    [MapperIgnoreSource(nameof(Persona.FechaModificacion))]
    [MapperIgnoreSource(nameof(Persona.CreadoPor))]
    [MapperIgnoreSource(nameof(Persona.ModificadoPor))]
    [MapperIgnoreSource(nameof(Persona.Activo))]
    private static partial PacientePersonaResponse ToPersonaResponse(
        Persona persona);

    // CreatePacienteRequest -> Paciente
    public static Paciente ToEntity(CreatePacienteRequest request)
    {
        return new Paciente
        {
            Persona = ToPersona(request)
        };
    }

    // Actualiza el paciente y su persona existente
    public static void UpdateEntity(
        UpdatePacienteRequest request,
        Paciente paciente)
    {
        UpdatePersona(request, paciente.Persona);
    }

    // PacienteRequest -> Persona nueva
    [MapperIgnoreTarget(nameof(Persona.Id))]
    [MapperIgnoreTarget(nameof(Persona.Activo))]
    [MapperIgnoreTarget(nameof(Persona.FechaCreacion))]
    [MapperIgnoreTarget(nameof(Persona.FechaModificacion))]
    [MapperIgnoreTarget(nameof(Persona.CreadoPor))]
    [MapperIgnoreTarget(nameof(Persona.ModificadoPor))]
    private static partial Persona ToPersona(PacienteRequest request);

    // PacienteRequest -> Persona existente
    [MapperIgnoreTarget(nameof(Persona.Id))]
    [MapperIgnoreTarget(nameof(Persona.Activo))]
    [MapperIgnoreTarget(nameof(Persona.FechaCreacion))]
    [MapperIgnoreTarget(nameof(Persona.FechaModificacion))]
    [MapperIgnoreTarget(nameof(Persona.CreadoPor))]
    [MapperIgnoreTarget(nameof(Persona.ModificadoPor))]
    private static partial void UpdatePersona(PacienteRequest request, [MappingTarget] Persona persona);
}