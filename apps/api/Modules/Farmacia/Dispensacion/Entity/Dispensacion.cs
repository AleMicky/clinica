using Clinica.Api.Modules.Almacenes.Almacen.Entity;
using Clinica.Api.Modules.Almacenes.MovimientoInventario.Entity;
using Clinica.Api.Modules.Farmacia.Dispensacion.Enums;
using Clinica.Api.Modules.Recepcion.Admision.Entity;
using Clinica.Api.Modules.Recepcion.Pacientes.Entity;
using Clinica.Api.Modules.RecursosHumanos.Medico.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Farmacia.Dispensacion.Entity;

public class Dispensacion : AuditableEntity
{
    public string Numero { get; set; } = string.Empty; // Ej: DISP-2026-000001
    public TipoDispensacion Tipo { get; set; } = TipoDispensacion.VentaAmbulatoria;
    public EstadoDispensacion Estado { get; set; } = EstadoDispensacion.PendientePago;
    public DateTime Fecha { get; set; } = DateTime.UtcNow;

    public int AlmacenId { get; set; }
    public Almacen Almacen { get; set; } = null!;

    // Paciente registrado o cliente mostrador
    public int? PacienteId { get; set; }
    public Paciente? Paciente { get; set; }
    public string? ClienteNombre { get; set; }
    public string? ClienteDocumento { get; set; }

    // Médico que prescribió la receta (opcional)
    public int? MedicoId { get; set; }
    public Medico? Medico { get; set; }

    // Admisión hospitalaria (si está internado)
    public int? AdmisionId { get; set; }
    public Admision? Admision { get; set; }

    // Totales económicos
    public decimal Subtotal { get; set; }
    public decimal Descuento { get; set; }
    public decimal Total { get; set; }

    public string? Observaciones { get; set; }

    // Datos de Cobro en Cajas
    public DateTime? FechaCobro { get; set; }
    public string? UsuarioCobro { get; set; }
    public string? MetodoPago { get; set; }
    public string? ComprobanteCobro { get; set; }

    // Datos de Entrega y Descuento en Almacén
    public DateTime? FechaEntrega { get; set; }
    public string? UsuarioEntrega { get; set; }
    public int? MovimientoInventarioId { get; set; }
    public MovimientoInventario? MovimientoInventario { get; set; }

    // Motivo de anulación
    public string? MotivoAnulacion { get; set; }

    public ICollection<DispensacionDetalle> Detalles { get; set; } = new List<DispensacionDetalle>();
}
