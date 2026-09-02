using Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Enums;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Almacenes.TransferenciaAlmacen.Dtos;

public sealed record TransferenciaAlmacenDetalleRequest
{
    public required int ProductoId { get; init; }
    public int? LoteId { get; init; }
    public required decimal CantidadSolicitada { get; init; }
}

public abstract record TransferenciaAlmacenRequest
{
    public required int AlmacenOrigenId { get; init; }
    public required int AlmacenDestinoId { get; init; }
    public required DateTime FechaSolicitud { get; init; }

    public string? Observacion { get; init; }

    public IReadOnlyCollection<TransferenciaAlmacenDetalleRequest> Detalles { get; init; } = [];
}

public sealed record CreateTransferenciaAlmacenRequest : TransferenciaAlmacenRequest;

public sealed record UpdateTransferenciaAlmacenRequest : TransferenciaAlmacenRequest;

public sealed record TransferenciaDetalleCantidadRequest
{
    public required int DetalleId { get; init; }
    public required decimal Cantidad { get; init; }
}

public sealed record AprobarTransferenciaAlmacenRequest
{
    public IReadOnlyCollection<TransferenciaDetalleCantidadRequest> Cantidades { get; init; } = [];
}

public sealed record DespacharTransferenciaAlmacenRequest
{
    public IReadOnlyCollection<TransferenciaDetalleCantidadRequest> Cantidades { get; init; } = [];
}

public sealed record RecibirTransferenciaAlmacenRequest
{
    public IReadOnlyCollection<TransferenciaDetalleCantidadRequest> Cantidades { get; init; } = [];
}

public sealed record CancelarTransferenciaAlmacenRequest
{
    public required string MotivoCancelacion { get; init; }
}

public sealed record TransferenciaAlmacenDetalleResponse
{
    public int Id { get; init; }
    public int ProductoId { get; init; }
    public string? ProductoNombre { get; init; }
    public int? LoteId { get; init; }
    public string? LoteNumero { get; init; }
    public decimal CantidadSolicitada { get; init; }
    public decimal CantidadAprobada { get; init; }
    public decimal CantidadDespachada { get; init; }
    public decimal CantidadRecibida { get; init; }
}

public sealed record TransferenciaAlmacenResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Numero { get; init; }

    public int AlmacenOrigenId { get; init; }
    public string? AlmacenOrigenNombre { get; init; }

    public int AlmacenDestinoId { get; init; }
    public string? AlmacenDestinoNombre { get; init; }

    public DateTime FechaSolicitud { get; init; }

    public DateTime? FechaAprobacion { get; init; }
    public DateTime? FechaDespacho { get; init; }
    public DateTime? FechaRecepcion { get; init; }

    public int? SolicitadoPorId { get; init; }
    public int? AprobadoPorId { get; init; }
    public int? DespachadoPorId { get; init; }
    public int? RecibidoPorId { get; init; }

    public string? Observacion { get; init; }

    public EstadoTransferenciaAlmacen Estado { get; init; }

    public IReadOnlyCollection<TransferenciaAlmacenDetalleResponse> Detalles { get; init; } = [];
}
