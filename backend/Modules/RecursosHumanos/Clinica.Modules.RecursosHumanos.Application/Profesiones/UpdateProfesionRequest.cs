namespace Clinica.Modules.RecursosHumanos.Application.Profesiones;

public sealed record UpdateProfesionRequest(
    string Codigo,
    string Nombre,
    string Descripcion = ""
);
