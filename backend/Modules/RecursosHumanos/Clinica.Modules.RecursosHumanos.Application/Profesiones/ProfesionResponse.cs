namespace Clinica.Modules.RecursosHumanos.Application.Profesiones;

public sealed record ProfesionResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    string Descripcion
);
