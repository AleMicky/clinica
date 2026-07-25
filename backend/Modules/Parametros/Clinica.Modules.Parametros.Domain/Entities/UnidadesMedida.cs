using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Parametros.Domain.Entities;

public class UnidadesMedida : AuditableEntity, ICodedEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Simbolo { get; set; } = string.Empty;
}
