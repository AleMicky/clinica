using Clinica.Api.Modules.Servicios.Servicios.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Servicios.CategoriaServicio.Entity;

public sealed class CategoriaServicio : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    
    public ICollection<Servicio> Servicios { get; set; } = [];
}