using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Cajas.Caja.Entity;

public sealed class Caja : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public ICollection<TurnoCaja.Entity.TurnoCaja> Turnos { get; set; } = [];
}