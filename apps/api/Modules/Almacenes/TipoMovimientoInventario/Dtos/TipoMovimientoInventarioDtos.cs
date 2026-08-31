using Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Enums;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Dtos;

public abstract record TipoMovimientoInventarioRequest
{
    public required string Codigo { get; init; }
    public required string Nombre { get; init; }
    public string? Descripcion { get; init; }
    public NaturalezaMovimiento Naturaleza { get; init; }
}

public sealed record CreateTipoMovimientoInventarioRequest : TipoMovimientoInventarioRequest;

public sealed record UpdateTipoMovimientoInventarioRequest : TipoMovimientoInventarioRequest;

public sealed record TipoMovimientoInventarioResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Codigo { get; init; }
    public string Nombre { get; init; }
    public string? Descripcion { get; init; }
    public NaturalezaMovimiento Naturaleza { get; init; }
}
