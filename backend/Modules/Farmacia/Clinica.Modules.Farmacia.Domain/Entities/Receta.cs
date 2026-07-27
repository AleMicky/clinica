using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Farmacia.Domain.Entities;

public class Receta : AuditableEntity
{
    public string Numero { get; set; } = string.Empty;
    public Guid PacienteId { get; set; }
    public Guid? MedicoId { get; set; }
    public Guid? AtencionId { get; set; }
    public bool EsExterna { get; set; }
    public DateTime Fecha { get; set; }
    public string Estado { get; set; } = RecetaEstados.Activa;
    public string? Observaciones { get; set; }
    public Guid? WorkflowInstanceId { get; set; }
    public ICollection<RecetaDetalle> Detalles { get; set; } = [];
}

public static class RecetaEstados
{
    public const string Activa = "ACTIVA";
    public const string Dispensada = "DISPENSADA";
    public const string Anulada = "ANULADA";
}
