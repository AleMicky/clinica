using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Parametros.Banco.Entity;

public sealed class Banco : AuditableEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? NombreCorto { get; set; }

    public ICollection<CuentaBancaria> Cuentas { get; set; } = [];
}