namespace Clinica.Modules.Laboratorio.Application.TiposExamen;

public sealed record TipoExamenResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    string Descripcion
);
