namespace Clinica.Modules.RecursosHumanos.Application.Especialidades;

public sealed record EspecialidadResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    string Descripcion
);
