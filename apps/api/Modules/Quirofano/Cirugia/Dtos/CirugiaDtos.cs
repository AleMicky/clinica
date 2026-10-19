using Clinica.Api.Modules.Quirofano.Cirugia.Enums;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Quirofano.Cirugia.Dtos;

public sealed record CirugiaGastoMaterialRequest
{
    public required int ProductoId { get; init; }
    public int? PartidaInventarioId { get; init; }
    public required decimal Cantidad { get; init; }
    public decimal? PrecioUnitario { get; init; }
    public string? MomentoQuirurgico { get; init; }
    public string? Observaciones { get; init; }
}

public sealed record CreateCirugiaRequest
{
    public TipoCirugia Tipo { get; init; } = TipoCirugia.Programada;
    public TipoAnestesia TipoAnestesia { get; init; } = TipoAnestesia.General;
    public int? AdmisionId { get; init; }
    public required int PacienteId { get; init; }
    public required int CirujanoPrincipalId { get; init; }
    public int? AnestesiologoId { get; init; }
    public int? PrimerAyudanteId { get; init; }
    public string? Instrumentista { get; init; }
    public string? Circulante { get; init; }
    public required string SalaOperaciones { get; init; }
    public required string ProcedimientoQuirurgico { get; init; }
    public string? DiagnosticoPreOperatorio { get; init; }
    public required DateTime FechaProgramada { get; init; }
    public int? AlmacenId { get; init; } // Default to ALM-QUI
    public string? Observaciones { get; init; }
    public List<CirugiaGastoMaterialRequest> GastosMaterialesIniciales { get; init; } = [];
}

public sealed record UpdateCirugiaRequest
{
    public TipoCirugia Tipo { get; init; }
    public TipoAnestesia TipoAnestesia { get; init; }
    public int? AdmisionId { get; init; }
    public int PacienteId { get; init; }
    public int CirujanoPrincipalId { get; init; }
    public int? AnestesiologoId { get; init; }
    public int? PrimerAyudanteId { get; init; }
    public string? Instrumentista { get; init; }
    public string? Circulante { get; init; }
    public string SalaOperaciones { get; init; } = string.Empty;
    public string ProcedimientoQuirurgico { get; init; } = string.Empty;
    public string? DiagnosticoPreOperatorio { get; init; }
    public DateTime FechaProgramada { get; init; }
    public string? Observaciones { get; init; }
}

public sealed record IniciarCirugiaRequest
{
    public DateTime? FechaInicio { get; init; }
    public string? Observaciones { get; init; }
}

public sealed record RegistrarGastoMaterialCirugiaRequest
{
    public required List<CirugiaGastoMaterialRequest> Gastos { get; init; } = [];
}

public sealed record FinalizarCirugiaRequest
{
    public DateTime? FechaFin { get; init; }
    public string? DiagnosticoPostOperatorio { get; init; }
    public string? Observaciones { get; init; }
    public List<CirugiaGastoMaterialRequest>? GastosFinales { get; init; }
}

public sealed record CancelarCirugiaRequest
{
    public required string MotivoCancelacion { get; init; }
}

public sealed record CirugiaGastoMaterialResponse
{
    public int Id { get; init; }
    public int ProductoId { get; init; }
    public string ProductoCodigo { get; init; } = string.Empty;
    public string ProductoNombre { get; init; } = string.Empty;
    public int? PartidaInventarioId { get; init; }
    public string? Lote { get; init; }
    public DateTime? FechaVencimiento { get; init; }
    public decimal Cantidad { get; init; }
    public decimal CostoUnitario { get; init; }
    public decimal PrecioUnitario { get; init; }
    public decimal Subtotal { get; init; }
    public string? MomentoQuirurgico { get; init; }
    public string? Observaciones { get; init; }
}

public sealed record CirugiaResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Numero { get; init; } = string.Empty;
    public TipoCirugia Tipo { get; init; }
    public string TipoTexto { get; init; } = string.Empty;
    public EstadoCirugia Estado { get; init; }
    public string EstadoTexto { get; init; } = string.Empty;
    public TipoAnestesia TipoAnestesia { get; init; }
    public string TipoAnestesiaTexto { get; init; } = string.Empty;

    public int? AdmisionId { get; init; }
    public string? AdmisionNumero { get; init; }

    public int PacienteId { get; init; }
    public string PacienteNombreCompleto { get; init; } = string.Empty;
    public string PacienteDocumento { get; init; } = string.Empty;
    public string PacienteHistoriaClinica { get; init; } = string.Empty;

    public int CirujanoPrincipalId { get; init; }
    public string CirujanoNombreCompleto { get; init; } = string.Empty;
    public string CirujanoEspecialidad { get; init; } = string.Empty;

    public int? AnestesiologoId { get; init; }
    public string? AnestesiologoNombreCompleto { get; init; }

    public int? PrimerAyudanteId { get; init; }
    public string? PrimerAyudanteNombreCompleto { get; init; }

    public string? Instrumentista { get; init; }
    public string? Circulante { get; init; }

    public string SalaOperaciones { get; init; } = string.Empty;
    public string ProcedimientoQuirurgico { get; init; } = string.Empty;
    public string? DiagnosticoPreOperatorio { get; init; }
    public string? DiagnosticoPostOperatorio { get; init; }

    public DateTime FechaProgramada { get; init; }
    public DateTime? FechaInicio { get; init; }
    public DateTime? FechaFin { get; init; }

    public int AlmacenId { get; init; }
    public string AlmacenNombre { get; init; } = string.Empty;
    public int? MovimientoInventarioId { get; init; }

    public string? Observaciones { get; init; }
    public string? MotivoCancelacion { get; init; }

    public decimal TotalCostoMateriales { get; init; }
    public decimal TotalPrecioMateriales { get; init; }

    public List<CirugiaGastoMaterialResponse> GastosMateriales { get; init; } = [];
}

public sealed record CirugiaMetricsResponse
{
    public int TotalCirugias { get; init; }
    public int TotalProgramadas { get; init; }
    public int TotalEnCurso { get; init; }
    public int TotalFinalizadas { get; init; }
    public int TotalCanceladas { get; init; }
    public decimal MontoTotalMaterialesConsumidos { get; init; }
}

public sealed record MaterialQuirofanoStockResponse
{
    public int ProductoId { get; init; }
    public string Codigo { get; init; } = string.Empty;
    public string Nombre { get; init; } = string.Empty;
    public string? Categoria { get; init; }
    public string? UnidadMedida { get; init; }
    public decimal StockDisponible { get; init; }
    public decimal CostoReferencial { get; init; }
    public decimal PrecioReferencial { get; init; }
    public List<LoteMaterialStockResponse> Lotes { get; init; } = [];
}

public sealed record LoteMaterialStockResponse
{
    public int PartidaInventarioId { get; init; }
    public string Lote { get; init; } = string.Empty;
    public DateTime? FechaVencimiento { get; init; }
    public decimal CantidadDisponible { get; init; }
}
