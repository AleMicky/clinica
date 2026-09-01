using Clinica.Api.Modules.Almacenes.ReservaStock.Enums;
using Clinica.Api.Shared.Abstractions;
using AlmacenEntity = Clinica.Api.Modules.Almacenes.Almacen.Entity.Almacen;


namespace Clinica.Api.Modules.Almacenes.ReservaStock.Entity;

public sealed class ReservaStock : AuditableEntity
{
    public string Numero { get; set; } = string.Empty;

    public int AlmacenId { get; set; }
    public AlmacenEntity Almacen { get; set; } = null!;

    public string ReferenciaTipo { get; set; } = string.Empty;
    public int? ReferenciaId { get; set; }

    public DateTime FechaReserva { get; set; }

    public DateTime? FechaLiberacion { get; set; }
    public DateTime? FechaConsumo { get; set; }

    public EstadoReservaStock Estado { get; set; } = EstadoReservaStock.Borrador;

    public string? Observacion { get; set; }

    public ICollection<ReservaStockDetalle> Detalles { get; set; } = [];
}