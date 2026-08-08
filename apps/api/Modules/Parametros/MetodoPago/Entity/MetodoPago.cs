using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Parametros.MetodoPago.Entity;

public sealed class MetodoPago : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public bool RequiereReferencia { get; set; }
}