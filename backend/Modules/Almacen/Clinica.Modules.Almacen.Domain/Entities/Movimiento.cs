using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Almacen.Domain.Entities;

public class Movimiento : AuditableEntity
{
    public string Numero { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
    public string Estado { get; set; } = MovimientoEstados.Borrador;
    public string? Observaciones { get; set; }
    public string? ModuloOrigen { get; set; }
    public string? EntidadOrigen { get; set; }
    public Guid? ReferenciaId { get; set; }
    public Guid? ProveedorId { get; set; }
    public Guid? WorkflowInstanceId { get; set; }
    public bool RequiereAprobacion { get; set; }
    public ICollection<MovimientoDetalle> Detalles { get; set; } = [];
}

public static class MovimientoTipos
{
    public const string Ingreso = "INGRESO";
    public const string Salida = "SALIDA";
    public const string Ajuste = "AJUSTE";
    public const string Transferencia = "TRANSFERENCIA";
    public const string Baja = "BAJA";
}

public static class MovimientoEstados
{
    public const string Borrador = "BORRADOR";
    public const string PendienteAprobacion = "PENDIENTE_APROBACION";
    public const string Aprobado = "APROBADO";
    public const string Aplicado = "APLICADO";
    public const string Rechazado = "RECHAZADO";
}
