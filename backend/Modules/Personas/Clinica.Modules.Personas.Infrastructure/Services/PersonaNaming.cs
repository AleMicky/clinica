using Clinica.Modules.Personas.Domain.Entities;

namespace Clinica.Modules.Personas.Infrastructure.Services;

internal static class PersonaNaming
{
    public static string NombreCompleto(Persona persona) =>
        $"{persona.Nombres} {persona.ApellidoPaterno} {persona.ApellidoMaterno}".Trim();
}
