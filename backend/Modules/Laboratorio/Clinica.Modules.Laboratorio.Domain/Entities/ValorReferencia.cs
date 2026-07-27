using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Laboratorio.Domain.Entities;

public class ValorReferencia : AuditableEntity
{
    public Guid ParametroId { get; set; }
    public Parametro Parametro { get; set; } = null!;
    public string? Sexo { get; set; }
    public int? EdadMin { get; set; }
    public int? EdadMax { get; set; }
    public decimal? ValorMin { get; set; }
    public decimal? ValorMax { get; set; }
    public string? ValorTexto { get; set; }
    public bool Activo { get; set; } = true;
}
