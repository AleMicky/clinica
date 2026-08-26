namespace Clinica.Api.Modules.Cajas.ArqueoCaja.Dtos;

public sealed record ResumenCierreTurnoCajaResponse
{
    public int TurnoCajaId { get; init; }

    public int ArqueoCajaId { get; init; }

    public DateTime FechaHoraApertura { get; init; }

    public DateTime FechaHoraArqueo { get; init; }

    public decimal MontoInicial { get; init; }

    public decimal TotalEsperado { get; init; }

    public decimal TotalContado { get; init; }

    public decimal Diferencia { get; init; }

    public string? ObservacionArqueo { get; init; }

    public IReadOnlyCollection<ArqueoCajaDetalleResponse> Detalles { get; init; } = [];
}