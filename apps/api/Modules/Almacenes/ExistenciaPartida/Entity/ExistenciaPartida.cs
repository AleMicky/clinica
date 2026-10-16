using Clinica.Api.Shared.Abstractions;

using ExistenciaEntity =
    Clinica.Api.Modules.Almacenes.Existencia.Entity.Existencia;

using PartidaEntity =
    Clinica.Api.Modules.Almacenes.PartidaInventario.Entity.PartidaInventario;

namespace Clinica.Api.Modules.Almacenes.ExistenciaPartida.Entity;

public sealed class ExistenciaPartida : AuditableEntity
{
    public int ExistenciaId { get; set; }
    public ExistenciaEntity Existencia { get; set; } = null!;

    public int PartidaInventarioId { get; set; }
    public PartidaEntity PartidaInventario { get; set; } = null!;

    public decimal Cantidad { get; set; } = 0;
    public decimal CantidadReservada { get; set; } = 0;

    public decimal CantidadDisponible =>
        Cantidad - CantidadReservada;
}