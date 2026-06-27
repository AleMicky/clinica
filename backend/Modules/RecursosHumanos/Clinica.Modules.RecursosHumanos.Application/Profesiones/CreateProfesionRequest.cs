namespace Clinica.Modules.RecursosHumanos.Application.Profesiones;

public sealed record CreateProfesionRequest(
    string Codigo,
    string Nombre,
    string Descripcion = ""
);
