using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.AtencionMedica.Domain.Entities;

public class TipoCampoFormulario : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string ControlFrontend { get; set; } = string.Empty;
    public string TipoDato { get; set; } = string.Empty;
    public bool PermiteOpciones { get; set; }
    public bool PermiteValorDefecto { get; set; }
    public bool PermiteValidaciones { get; set; }
    public bool PermiteMultiple { get; set; }

    public ICollection<FormularioCampo> Campos { get; set; } = [];
}