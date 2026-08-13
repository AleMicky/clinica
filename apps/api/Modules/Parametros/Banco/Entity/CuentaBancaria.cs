using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Parametros.Banco.Entity;

public sealed class CuentaBancaria : AuditableEntity
{
    public int BancoId { get; set; }
    public Banco Banco { get; set; } = null!;

    public string NumeroCuenta { get; set; } = string.Empty;
    public string? NombreCuenta { get; set; }

    public int MonedaId { get; set; }
    public Moneda.Entity.Moneda Moneda { get; set; } = null!;

    public string? TipoCuenta { get; set; }
}