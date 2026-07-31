using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Almacen.Domain.Entities;

public class UnidadMedida : AuditableEntity, ICodedEntity
{
    public string Codigo { get; set; } = null!;
    public string Nombre { get; set; } = null!;
    public string? Abreviatura { get; set; }
    public bool PermiteDecimales { get; set; }
}