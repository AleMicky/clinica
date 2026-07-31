using Clinica.SharedKernel.Abstractions;
using Clinica.SharedKernel.Exceptions;

namespace Clinica.Modules.Almacen.Domain.Entities;

public class ProductoStock : AuditableEntity
{
    public Guid ProductoId { get; set; }
    public Producto Producto { get; set; } = null!;

    public Guid AlmacenId { get; set; }
    public Almacen Almacen { get; set; } = null!;

    public decimal CantidadDisponible { get; set; }
    public decimal CantidadReservada { get; set; }

    public decimal StockMinimo { get; set; }
    public decimal StockMaximo { get; set; }

    public decimal CantidadUtilizable => CantidadDisponible - CantidadReservada;

    public void AplicarDelta(decimal delta, bool permiteStockNegativo)
    {
        var nueva = CantidadDisponible + delta;
        if (nueva < 0 && !permiteStockNegativo)
            throw new BusinessException("No se permite stock negativo.");

        CantidadDisponible = nueva;
        UpdatedAt = DateTime.UtcNow;
    }
}