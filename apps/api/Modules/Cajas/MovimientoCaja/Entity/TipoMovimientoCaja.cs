using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Cajas.MovimientoCaja.Entity;

public sealed class TipoMovimientoCaja : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string Naturaleza { get; set; } = string.Empty;

    public ICollection<ConceptoMovimientoCaja> Conceptos { get; set; } = [];
    public ICollection<MovimientoCaja> Movimientos { get; set; } = [];
}