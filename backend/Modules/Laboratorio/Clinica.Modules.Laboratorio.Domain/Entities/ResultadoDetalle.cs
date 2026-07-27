using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Laboratorio.Domain.Entities;

public class ResultadoDetalle : AuditableEntity
{
    public Guid ResultadoId { get; set; }
    public Resultado Resultado { get; set; } = null!;
    public Guid ParametroId { get; set; }
    public Parametro Parametro { get; set; } = null!;
    public Guid SolicitudDetalleId { get; set; }
    public SolicitudDetalle SolicitudDetalle { get; set; } = null!;
    public decimal? ValorNumerico { get; set; }
    public string? ValorTexto { get; set; }
    public bool FueraDeRango { get; set; }
    public string? Observaciones { get; set; }
}
