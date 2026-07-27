using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Caja.Domain.Entities;

public class Cuenta : AuditableEntity
{
    public string Numero { get; set; } = string.Empty;
    public Guid PacienteId { get; set; }
    public string ModuloOrigen { get; set; } = string.Empty;
    public string EntidadOrigen { get; set; } = string.Empty;
    public Guid ReferenciaId { get; set; }
    public Guid? WorkflowInstanceId { get; set; }
    public string Estado { get; set; } = CuentaEstados.Abierta;
    public decimal TotalCargos { get; set; }
    public decimal TotalPagado { get; set; }
    public decimal Saldo { get; set; }
    public string? Observaciones { get; set; }

    public ICollection<Cargo> Cargos { get; set; } = [];
    public ICollection<Pago> Pagos { get; set; } = [];
}

public static class CuentaEstados
{
    public const string Abierta = "ABIERTA";
    public const string Parcial = "PARCIAL";
    public const string Pagada = "PAGADA";
    public const string Anulada = "ANULADA";
}
