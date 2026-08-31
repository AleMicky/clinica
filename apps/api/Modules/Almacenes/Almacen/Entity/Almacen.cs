using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Almacenes.Almacen.Entity;

public sealed class Almacen : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Ubicacion { get; set; }
}