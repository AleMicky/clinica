namespace Clinica.Modules.RecursosHumanos.Application.Especialidades;

public sealed record UpdateEspecialidadRequest(
    string Codigo,
    string Nombre,
    string Descripcion = ""
);
