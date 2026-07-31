using Clinica.Modules.Almacen.Domain.Enums;
using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Almacen.Domain.Entities;

public class TipoMovimientoAlmacen : AuditableEntity
{
    
    public string Codigo { get; set; } = null!;
    public string Nombre { get; set; } = null!;
    public string? Descripcion { get; set; }

    public TipoOperacionStock OperacionStock { get; set; }


    public ICollection<MovimientoAlmacen> Movimientos { get; set; } = [];
}