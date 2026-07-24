namespace Clinica.Modules.Laboratorio.Application.Especialidades;

public sealed record EspecialidadResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    string Descripcion,
    int Orden
);
