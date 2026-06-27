using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.RecursosHumanos.Domain.Entities;

public class Servicio : AuditableEntity
{
    public Guid DepartamentoId { get; set; }
    public Departamento Departamento { get; set; } = null!;
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
}