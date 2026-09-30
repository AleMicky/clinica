using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Almacenes.Marca.Entity;

public sealed class Marca : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
}