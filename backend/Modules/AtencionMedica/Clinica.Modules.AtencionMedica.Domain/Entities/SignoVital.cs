using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.AtencionMedica.Domain.Entities;

public class SignoVital : AuditableEntity
{
    public Guid AtencionId { get; set; }
    public Atencion Atencion { get; set; } = null!;

    public decimal? Temperatura { get; set; }
    public int? FrecuenciaCardiaca { get; set; }
    public int? FrecuenciaRespiratoria { get; set; }
    public int? PresionSistolica { get; set; }
    public int? PresionDiastolica { get; set; }
    public decimal? SaturacionOxigeno { get; set; }
    public decimal? GlucemiaCapilar { get; set; }
    public decimal? Peso { get; set; }
    public decimal? Talla { get; set; }
    public decimal? Imc { get; set; }
    public int? Glasgow { get; set; }
    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;
}