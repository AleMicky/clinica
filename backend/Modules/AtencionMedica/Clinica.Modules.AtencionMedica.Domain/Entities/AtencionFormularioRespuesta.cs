using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.AtencionMedica.Domain.Entities;

public class AtencionFormularioRespuesta : AuditableEntity
{
    public Guid AtencionId { get; set; }
    public Atencion Atencion { get; set; } = null!;
    public Guid FormularioCampoId { get; set; }
    public FormularioCampo FormularioCampo { get; set; } = null!;
    public string? ValorTexto { get; set; }
    public decimal? ValorNumero { get; set; }
    public DateTime? ValorFecha { get; set; }
    public bool? ValorBooleano { get; set; }
    public string? ValorJson { get; set; }
}