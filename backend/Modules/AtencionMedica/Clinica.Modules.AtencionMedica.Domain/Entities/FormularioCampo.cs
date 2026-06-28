using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.AtencionMedica.Domain.Entities;

public class FormularioCampo : AuditableEntity
{
    public Guid FormularioSeccionId { get; set; }
    public FormularioSeccion FormularioSeccion { get; set; } = null!;

    public string Codigo { get; set; } = string.Empty;
    public string Etiqueta { get; set; } = string.Empty;

    public Guid TipoCampoFormularioId { get; set; }
    public TipoCampoFormulario TipoCampoFormulario { get; set; } = null!;

    public bool EsRequerido { get; set; }
    public bool Visible { get; set; } = true;
    public int Orden { get; set; }
    public string? Placeholder { get; set; }
    public string? ValorDefecto { get; set; }
    public string? OpcionesJson { get; set; }
    public string? ValidacionesJson { get; set; }
}