namespace Clinica.Modules.Laboratorio.Application.Pruebas;

public sealed record UpdatePruebaRequest(
    string Codigo,
    string Nombre,
    Guid EspecialidadId,
    Guid TipoExamenId,
    Guid TipoMuestraId,
    bool RequiereAyuno = false,
    int HorasAyuno = 0,
    bool EsDerivable = false
);
