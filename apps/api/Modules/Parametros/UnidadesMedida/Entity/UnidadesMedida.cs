using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Parametros.UnidadesMedida.Entity;

public sealed class UnidadesMedida : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Simbolo { get; set; } = string.Empty;
}