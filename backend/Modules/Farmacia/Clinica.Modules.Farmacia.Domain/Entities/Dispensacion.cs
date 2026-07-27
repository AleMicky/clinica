using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Farmacia.Domain.Entities;

public class Dispensacion : AuditableEntity
{
    public string Numero { get; set; } = string.Empty;
    public Guid? RecetaId { get; set; }
    public Receta? Receta { get; set; }
    public Guid PacienteId { get; set; }
    public DateTime Fecha { get; set; }
    public string Estado { get; set; } = DispensacionEstados.Borrador;
    public Guid? CuentaId { get; set; }
    public Guid? WorkflowInstanceId { get; set; }
    public string? Observaciones { get; set; }
    public ICollection<DispensacionDetalle> Detalles { get; set; } = [];
}

public static class DispensacionEstados
{
    public const string Borrador = "BORRADOR";
    public const string PendientePago = "PENDIENTE_PAGO";
    public const string Dispensada = "DISPENSADA";
    public const string Finalizado = "FINALIZADO";
    public const string Anulado = "ANULADO";
}
