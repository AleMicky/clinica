using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Servicios.Servicios.Entity;

public class Servicio : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }

    public int CategoriaServicioId { get; set; }
    public CategoriaServicio.Entity.CategoriaServicio CategoriaServicio { get; set; } = null!;
}