using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Parametros.Moneda.Entity;

public sealed class Moneda : AuditableEntity
{
    public string Codigo { get; set; } = null!;
    public string Nombre { get; set; } = null!;
    public string Simbolo { get; set; } = null!;
    public int Decimales { get; set; } = 2;
    public bool EsBase { get; set; }
}