using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Compras.Proveedor.Dtos;

public abstract record ProveedorRequest
{
    public required string Codigo { get; init; }
    public required string RazonSocial { get; init; }
    public string? NombreComercial { get; init; }
    public string? Nit { get; init; }
    public string? Direccion { get; init; }
    public string? Telefono { get; init; }
    public string? Celular { get; init; }
    public string? Email { get; init; }
    public string? Contacto { get; init; }
    public string? Observacion { get; init; }
}

public sealed record CreateProveedorRequest : ProveedorRequest;

public sealed record UpdateProveedorRequest : ProveedorRequest;

public sealed record ProveedorResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Codigo { get; init; } = string.Empty;
    public string RazonSocial { get; init; } = string.Empty;
    public string? NombreComercial { get; init; }
    public string? Nit { get; init; }
    public string? Direccion { get; init; }
    public string? Telefono { get; init; }
    public string? Celular { get; init; }
    public string? Email { get; init; }
    public string? Contacto { get; init; }
    public string? Observacion { get; init; }
}
