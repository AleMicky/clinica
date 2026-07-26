namespace Clinica.Modules.Laboratorio.Application.Pruebas;

public sealed record PruebaResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    Guid EspecialidadId,
    string EspecialidadNombre,
    Guid TipoExamenId,
    string TipoExamenNombre,
    Guid TipoMuestraId,
    string TipoMuestraNombre,
    bool RequiereAyuno,
    int HorasAyuno,
    bool EsDerivable
);
