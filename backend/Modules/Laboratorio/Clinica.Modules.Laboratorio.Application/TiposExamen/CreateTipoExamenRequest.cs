namespace Clinica.Modules.Laboratorio.Application.TiposExamen;

public sealed record CreateTipoExamenRequest(
    string Codigo,
    string Nombre,
    string Descripcion = ""
);
