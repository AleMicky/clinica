namespace Clinica.Modules.Laboratorio.Application.TiposExamen;

public sealed record UpdateTipoExamenRequest(
    string Codigo,
    string Nombre,
    string Descripcion = ""
);
