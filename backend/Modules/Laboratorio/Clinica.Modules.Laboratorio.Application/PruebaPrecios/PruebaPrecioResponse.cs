namespace Clinica.Modules.Laboratorio.Application.PruebaPrecios;

public sealed record PruebaPrecioResponse(
    Guid Id,
    Guid PruebaId,
    decimal ImporteFacturado,
    decimal CostoLaboratorio,
    decimal CostoDerivacion,
    DateOnly FechaInicio,
    DateOnly? FechaFin,
    string MotivoCambio
);
