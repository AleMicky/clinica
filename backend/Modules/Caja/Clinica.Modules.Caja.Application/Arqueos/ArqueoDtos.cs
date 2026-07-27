namespace Clinica.Modules.Caja.Application.Arqueos;

public sealed record CerrarArqueoCajaRequest(
    decimal MontoContado,
    string? Observaciones = null);

public sealed record ArqueoCajaResponse(
    Guid Id,
    Guid TurnoCajaId,
    DateTime Fecha,
    decimal MontoInicial,
    decimal IngresosEfectivo,
    decimal EgresosEfectivo,
    decimal MontoEsperado,
    decimal MontoContado,
    decimal Diferencia,
    string? Observaciones,
    Guid RealizadoPor);
