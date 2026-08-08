namespace Clinica.Api.Shared.Abstractions;

public abstract record AuditableResponse
{
    public bool Activo { get; init; }

    public DateTime FechaCreacion { get; init; }

    public DateTime? FechaModificacion { get; init; }

    public string? CreadoPor { get; init; }

    public string? ModificadoPor { get; init; }
}