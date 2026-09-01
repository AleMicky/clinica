using Clinica.Api.Modules.Almacenes.InventarioFisico.Enums;
using Clinica.Api.Shared.Abstractions;
using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;
 
namespace Clinica.Api.Modules.Almacenes.InventarioFisico.Entity;

public sealed class InventarioFisico : AuditableEntity
{
    public string Numero { get; set; } = string.Empty;

    public int AlmacenId { get; set; }
    public AlmacenEntity Almacen { get; set; } = null!;

    public DateTime FechaInicio { get; set; }
    public DateTime? FechaCierre { get; set; }

    public EstadoInventarioFisico Estado { get; set; } = EstadoInventarioFisico.Borrador;

    public string? Observacion { get; set; }

    public int? MovimientoAjustePositivoId { get; set; }
    public int? MovimientoAjusteNegativoId { get; set; }

    public ICollection<InventarioFisicoDetalle> Detalles { get; set; } = [];
}