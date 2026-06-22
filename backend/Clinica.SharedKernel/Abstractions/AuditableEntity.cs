namespace Clinica.SharedKernel.Abstractions;

public abstract class AuditableEntity : Entity
{
    public DateTime CreatedAt { get; set; }

    public string? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? UpdatedBy { get; set; }
}
