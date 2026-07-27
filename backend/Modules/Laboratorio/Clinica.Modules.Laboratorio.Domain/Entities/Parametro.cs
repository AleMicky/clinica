using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Laboratorio.Domain.Entities;

public class Parametro : AuditableEntity, ICodedEntity
{
    public Guid PruebaId { get; set; }
    public Prueba Prueba { get; set; } = null!;
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public Guid? UnidadMedidaId { get; set; }
    public string TipoDato { get; set; } = "NUMERICO";
    public int Orden { get; set; }
    public bool Activo { get; set; } = true;
    public ICollection<ValorReferencia> ValoresReferencia { get; set; } = [];
}
