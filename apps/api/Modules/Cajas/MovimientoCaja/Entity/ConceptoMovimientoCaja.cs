using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Cajas.MovimientoCaja.Entity;

public sealed class ConceptoMovimientoCaja : AuditableEntity
{
    public int TipoMovimientoCajaId { get; set; }
    public TipoMovimientoCaja TipoMovimientoCaja { get; set; } = null!;

    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }

    public ICollection<MovimientoCaja> Movimientos { get; set; } = [];
}