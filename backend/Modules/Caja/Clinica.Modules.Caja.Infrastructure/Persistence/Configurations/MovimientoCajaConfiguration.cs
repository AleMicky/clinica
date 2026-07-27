using Clinica.Modules.Caja.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Caja.Infrastructure.Persistence.Configurations;

public sealed class MovimientoCajaConfiguration : BaseEntityConfiguration<MovimientoCaja>
{
    public override void Configure(EntityTypeBuilder<MovimientoCaja> builder)
    {
        base.Configure(builder);

        builder.ToTable("MovimientosCaja");

        builder.Property(x => x.Numero).HasMaxLength(50).IsRequired();
        builder.HasIndex(x => x.Numero).IsUnique();
        builder.HasIndex(x => x.TurnoCajaId);

        builder.Property(x => x.TipoMovimiento).HasMaxLength(30).IsRequired();
        builder.Property(x => x.Importe).HasPrecision(18, 2);
        builder.Property(x => x.ModuloOrigen).HasMaxLength(100);
        builder.Property(x => x.Descripcion).HasMaxLength(2000);
        builder.Property(x => x.Estado).HasMaxLength(30).IsRequired();

        builder.HasOne(x => x.TurnoCaja)
            .WithMany(x => x.Movimientos)
            .HasForeignKey(x => x.TurnoCajaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ConceptoCaja)
            .WithMany()
            .HasForeignKey(x => x.ConceptoCajaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.MetodoPago)
            .WithMany()
            .HasForeignKey(x => x.MetodoPagoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Pago)
            .WithMany(x => x.Movimientos)
            .HasForeignKey(x => x.PagoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);
    }
}
