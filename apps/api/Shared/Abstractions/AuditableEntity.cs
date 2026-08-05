namespace Clinica.Api.Shared.Abstractions;

public abstract class AuditableEntity : Entity
{
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public string? CreadoPor { get; set; }
    public string? ModificadoPor { get; set; }
    public bool Activo { get; set; } = true;
}