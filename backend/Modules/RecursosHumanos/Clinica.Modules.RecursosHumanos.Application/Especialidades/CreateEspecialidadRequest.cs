namespace Clinica.Modules.RecursosHumanos.Application.Especialidades;

public sealed record CreateEspecialidadRequest(
    string Codigo,
    string Nombre,
    string Descripcion = ""
);
