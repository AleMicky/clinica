using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Almacen.Domain.Entities;

public class MedicamentoDetalle : AuditableEntity
{
    public Guid ProductoId { get; set; }
    public Producto Producto { get; set; } = null!;

    public string? NombreGenerico { get; set; }
    public string? NombreComercial { get; set; }
    public string? Concentracion { get; set; }
    public string? Presentacion { get; set; }

    public Guid? FormaFarmaceuticaId { get; set; }
    public FormaFarmaceutica? FormaFarmaceutica { get; set; }

    public bool RequiereReceta { get; set; }
    public bool EsControlado { get; set; }
}