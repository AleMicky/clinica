namespace Clinica.Modules.Personas.Application.ContactosEmergencia;

public sealed record ContactoEmergenciaResponse(
    Guid Id,
    Guid PersonaId,
    string Nombres,
    string? Apellidos,
    Guid? ParentescoId,
    string? ParentescoNombre,
    string? Telefono,
    string? Celular,
    string? Direccion
);
