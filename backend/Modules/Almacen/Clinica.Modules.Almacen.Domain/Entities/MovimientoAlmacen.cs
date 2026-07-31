using Clinica.Modules.Almacen.Domain.Enums;
using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Almacen.Domain.Entities;

public class MovimientoAlmacen : AuditableEntity
{
    public string Numero { get; set; } = null!;
    public DateTime Fecha { get; set; }

    public Guid TipoMovimientoAlmacenId { get; set; }
    public TipoMovimientoAlmacen TipoMovimientoAlmacen { get; set; } = null!;

    public Guid? AlmacenOrigenId { get; set; }
    public Almacen? AlmacenOrigen { get; set; }

    public Guid? AlmacenDestinoId { get; set; }
    public Almacen? AlmacenDestino { get; set; }

    public string? ModuloOrigen { get; set; }
    public string? EntidadOrigen { get; set; }
    public Guid? ReferenciaId { get; set; }

    public EstadoMovimientoAlmacen Estado { get; set; }

    public string? Observacion { get; set; }

    public ICollection<MovimientoAlmacenDetalle> Detalles { get; set; } = [];
}