
namespace Clinica.Api.Modules.Parametros.Correlativo.Entity;

public class Correlativo : Shared.Abstractions.Entity
{
    public string Codigo { get; set; } = string.Empty;
    public int Gestion { get; set; }
    public int UltimoNumero { get; set; }
    public string? Prefijo { get; set; }
    public int Longitud { get; set; } = 6;
}