using Clinica.Api.Modules.Almacenes.Almacen.Entity;
using Clinica.Api.Modules.Almacenes.MovimientoInventario.Entity;
using Clinica.Api.Modules.Quirofano.Cirugia.Enums;
using Clinica.Api.Modules.Recepcion.Admision.Entity;
using Clinica.Api.Modules.Recepcion.Pacientes.Entity;
using Clinica.Api.Modules.RecursosHumanos.Medico.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Quirofano.Cirugia.Entity;

public class Cirugia : AuditableEntity
{
    public string Numero { get; set; } = string.Empty; // Ej: CIR-2026-000001
    public TipoCirugia Tipo { get; set; } = TipoCirugia.Programada;
    public EstadoCirugia Estado { get; set; } = EstadoCirugia.Programada;
    public TipoAnestesia TipoAnestesia { get; set; } = TipoAnestesia.General;

    // Integración con Admisión y Paciente
    public int? AdmisionId { get; set; }
    public Admision? Admision { get; set; }

    public int PacienteId { get; set; }
    public Paciente Paciente { get; set; } = null!;

    // Equipo Quirúrgico
    public int CirujanoPrincipalId { get; set; }
    public Medico CirujanoPrincipal { get; set; } = null!;

    public int? AnestesiologoId { get; set; }
    public Medico? Anestesiologo { get; set; }

    public int? PrimerAyudanteId { get; set; }
    public Medico? PrimerAyudante { get; set; }

    public string? Instrumentista { get; set; }
    public string? Circulante { get; set; }

    // Sala y Procedimiento
    public string SalaOperaciones { get; set; } = "Quirófano 1 - Central";
    public string ProcedimientoQuirurgico { get; set; } = string.Empty;
    public string? DiagnosticoPreOperatorio { get; set; }
    public string? DiagnosticoPostOperatorio { get; set; }

    // Tiempos Quirúrgicos
    public DateTime FechaProgramada { get; set; }
    public DateTime? FechaInicio { get; set; }
    public DateTime? FechaFin { get; set; }

    // Integración con Almacenes (ALM-QUI)
    public int AlmacenId { get; set; }
    public Almacen Almacen { get; set; } = null!;

    public int? MovimientoInventarioId { get; set; }
    public MovimientoInventario? MovimientoInventario { get; set; }

    // Observaciones y justificaciones
    public string? Observaciones { get; set; }
    public string? MotivoCancelacion { get; set; }

    // Hoja de Gasto de Materiales, Fármacos e Instrumental Quirúrgico
    public ICollection<CirugiaGastoMaterial> GastosMateriales { get; set; } = new List<CirugiaGastoMaterial>();
}
