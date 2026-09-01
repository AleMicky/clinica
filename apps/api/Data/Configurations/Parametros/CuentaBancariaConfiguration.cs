using Clinica.Api.Modules.Parametros.Banco.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations.Parametros;

public sealed class CuentaBancariaConfiguration
    : AuditableEntityConfiguration<CuentaBancaria>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<CuentaBancaria> builder)
    {
        builder.ToTable("CuentasBancarias");

        builder.Property(x => x.NumeroCuenta)
            .HasMaxLength(40)
            .IsRequired();

        builder.Property(x => x.NombreCuenta)
            .HasMaxLength(150);

        builder.Property(x => x.TipoCuenta)
            .HasMaxLength(30);

        builder.HasIndex(x => x.NumeroCuenta)
            .IsUnique();

        builder.HasOne(x => x.Banco)
            .WithMany(x => x.Cuentas)
            .HasForeignKey(x => x.BancoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Moneda)
            .WithMany()
            .HasForeignKey(x => x.MonedaId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
