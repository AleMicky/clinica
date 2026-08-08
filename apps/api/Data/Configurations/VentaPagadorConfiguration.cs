using Clinica.Api.Modules.Ventas.Venta.Entity;
using Clinica.Api.Shared.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Api.Data.Configurations;

public sealed class VentaPagadorConfiguration
    : AuditableEntityConfiguration<VentaPagador>
{
    protected override void ConfigureEntity(
        EntityTypeBuilder<VentaPagador> builder)
    {
        builder.ToTable("VentaPagadores");

        builder.Property(x => x.Tipo)
            .IsRequired();

        builder.Property(x => x.Monto)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Estado)
            .IsRequired();

        builder.HasOne(x => x.Convenio)
            .WithMany()
            .HasForeignKey(x => x.ConvenioId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
