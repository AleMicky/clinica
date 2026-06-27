namespace Clinica.Modules.Personas.Application.ContactosEmergencia;

public sealed record UpdateContactoEmergenciaRequest(
    Guid PersonaId,
    string Nombres,
    string? Apellidos = null,
    Guid? ParentescoId = null,
    string? Telefono = null,
    string? Celular = null,
    string? Direccion = null
);
