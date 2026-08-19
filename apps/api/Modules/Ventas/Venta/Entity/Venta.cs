using Clinica.Api.Modules.Parametros.Moneda.Entity;
using Clinica.Api.Modules.Recepcion.Admision.Entity;
using Clinica.Api.Modules.Recepcion.Pacientes.Entity;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Entity;
using Clinica.Api.Modules.Ventas.Venta.Enums;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Ventas.Venta.Entity;

public sealed class Venta : AuditableEntity
{
    public string Numero { get; set; } = string.Empty;

    public int AdmisionId { get; set; }
    public Admision Admision { get; set; } = null!;

    public int PacienteId { get; set; }
    public Paciente Paciente { get; set; } = null!;
    
    public int VendedorId { get; set; }
    public Empleado Vendedor { get; set; } = null!;

    public int MonedaId { get; set; }
    public Moneda Moneda { get; set; } = null!;

    public DateTime Fecha { get; set; }

    public decimal Subtotal { get; set; }
    public decimal Descuento { get; set; }
    public decimal Total { get; set; }

    public EstadoVenta Estado { get; set; }

    public ICollection<VentaDetalle> Detalles { get; set; } = [];
    public ICollection<VentaPagador> Pagadores { get; set; } = [];
}