using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.AtencionMedica.Domain.Entities;

public class ResultadoEstudio : AuditableEntity
{
    public Guid EstudioId { get; set; }
    public Estudio Estudio { get; set; } = null!;

    public string ResultadoTexto { get; set; } = string.Empty;
    public string? ArchivoUrl { get; set; }
    public DateTime FechaResultado { get; set; } = DateTime.UtcNow;
    public Guid? RegistradoPorId { get; set; }
    public string? Observaciones { get; set; }
}