using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Caja.Domain.Entities;

public class ConceptoCaja : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string TipoMovimiento { get; set; } = TipoMovimientoCaja.Ingreso;
    public bool Activo { get; set; } = true;
}

public static class TipoMovimientoCaja
{
    public const string Ingreso = "INGRESO";
    public const string Egreso = "EGRESO";
}
