using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.AtencionMedica.Domain.Entities;

public class Estudio : AuditableEntity
{
    public Guid AtencionId { get; set; }
    public Atencion Atencion { get; set; } = null!;

    public Guid TipoEstudioId { get; set; }
    public CatalogoItem TipoEstudio { get; set; } = null!;
    
    public string Nombre { get; set; } = string.Empty;
    public string? Justificacion { get; set; }

    public string Estado { get; set; } = "SOLICITADO";
    public DateTime FechaSolicitud { get; set; } = DateTime.UtcNow;
    public ResultadoEstudio? Resultado { get; set; }
}