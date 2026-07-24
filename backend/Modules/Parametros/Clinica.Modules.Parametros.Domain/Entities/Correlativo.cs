using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Parametros.Domain.Entities;

public class Correlativo : Entity
{
    public string Codigo { get; set; } = string.Empty;
    public int Gestion { get; set; }
    public int UltimoNumero { get; set; }
    public string? Prefijo { get; set; }
    public int Longitud { get; set; } = 6;
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaActualizacion { get; set; }
}
