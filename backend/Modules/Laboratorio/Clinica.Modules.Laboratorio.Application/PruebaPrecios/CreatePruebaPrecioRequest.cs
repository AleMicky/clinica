namespace Clinica.Modules.Laboratorio.Application.PruebaPrecios;

public sealed record CreatePruebaPrecioRequest(
    Guid PruebaId,
    decimal ImporteFacturado,
    decimal CostoLaboratorio,
    decimal CostoDerivacion,
    DateOnly FechaInicio,
    DateOnly? FechaFin = null,
    string MotivoCambio = ""
);
