namespace Clinica.Api.Modules.Parametros.Correlativo.Dtos;

public abstract record CorrelativoRequest
{
    public required string Codigo { get; init; }
    public int? Gestion { get; init; }
    public string? Prefijo { get; init; }
    public int? Longitud { get; init; }
}

public sealed record CreateCorrelativoRequest : CorrelativoRequest;

public sealed record UpdateCorrelativoRequest : CorrelativoRequest;

public sealed record GenerarCorrelativoRequest
{
    public required string Codigo { get; init; }
    public int? Gestion { get; init; }
    public string? Prefijo { get; init; }
    public int? Longitud { get; init; }
}

public sealed record CorrelativoResponse
{
    public int Id { get; init; }
    public string Codigo { get; init; }
    public int Gestion { get; init; }
    public int UltimoNumero { get; init; }
    public string? Prefijo { get; init; }
    public int Longitud { get; init; } = 6;
}