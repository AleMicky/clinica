using Clinica.Api.Shared.Abstractions;
using TurnoCajaEntity = Clinica.Api.Modules.Cajas.TurnoCaja.Entity.TurnoCaja;


namespace Clinica.Api.Modules.Cajas.Caja.Entity;

public sealed class Caja : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public ICollection<TurnoCajaEntity> Turnos { get; set; } = [];
}