using Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Enums;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Almacenes.TipoMovimientoInventario.Entity;

public sealed class TipoMovimientoInventario : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }

    public NaturalezaMovimiento Naturaleza { get; set; } 
 
}