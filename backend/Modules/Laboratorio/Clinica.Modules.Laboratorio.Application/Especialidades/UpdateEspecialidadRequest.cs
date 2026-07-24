namespace Clinica.Modules.Laboratorio.Application.Especialidades;

public sealed record UpdateEspecialidadRequest(
    string Codigo,
    string Nombre,
    string Descripcion = "",
    int Orden = 0
);
