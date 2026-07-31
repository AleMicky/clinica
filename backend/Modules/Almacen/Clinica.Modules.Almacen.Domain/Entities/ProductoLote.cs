using Clinica.SharedKernel.Abstractions;
using Clinica.SharedKernel.Exceptions;

namespace Clinica.Modules.Almacen.Domain.Entities;

public class ProductoLote : AuditableEntity
{
    public Guid ProductoId { get; set; }
    public Producto Producto { get; set; } = null!;

    public Guid AlmacenId { get; set; }
    public Almacen Almacen { get; set; } = null!;

    public string NumeroLote { get; set; } = null!;

    public DateOnly? FechaFabricacion { get; set; }
    public DateOnly? FechaVencimiento { get; set; }

    public decimal CantidadInicial { get; set; }
    public decimal CantidadDisponible { get; set; }
    public decimal CantidadReservada { get; set; }

    public decimal CostoUnitario { get; set; }

    public bool Bloqueado { get; set; }
    public string? MotivoBloqueo { get; set; }

    public decimal CantidadUtilizable => CantidadDisponible - CantidadReservada;

    public void AplicarDelta(decimal delta, bool permiteStockNegativo)
    {
        if (Bloqueado && delta < 0)
            throw new BusinessException($"El lote {NumeroLote} está bloqueado.");

        var nueva = CantidadDisponible + delta;
        if (nueva < 0 && !permiteStockNegativo)
            throw new BusinessException("No se permite stock negativo en el lote.");

        CantidadDisponible = nueva;
        if (delta > 0)
            CantidadInicial = Math.Max(CantidadInicial, CantidadDisponible);
        UpdatedAt = DateTime.UtcNow;
    }
}