using Clinica.Modules.Almacen.Domain.Enums;
using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Almacen.Domain.Entities;

public class InventarioFisico : AuditableEntity
{
    public string Numero { get; set; } = null!;

    public Guid AlmacenId { get; set; }
    public Almacen Almacen { get; set; } = null!;

    public DateTime FechaInicio { get; set; }
    public DateTime? FechaFinalizacion { get; set; }

    public EstadoInventarioFisico Estado { get; set; }

    public string? Observacion { get; set; }

    public ICollection<InventarioFisicoDetalle> Detalles { get; set; } = [];
}