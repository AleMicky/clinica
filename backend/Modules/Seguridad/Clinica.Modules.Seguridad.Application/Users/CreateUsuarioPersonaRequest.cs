using Clinica.Modules.Personas.Application.Personas;

namespace Clinica.Modules.Seguridad.Application.Users;

public sealed record CreateUsuarioPersonaRequest(
    string Modo,
    Guid? PersonaId,
    CreatePersonaRequest? Persona,
    string UserName,
    string Password,
    string? Email,
    IReadOnlyList<string> Roles
);
