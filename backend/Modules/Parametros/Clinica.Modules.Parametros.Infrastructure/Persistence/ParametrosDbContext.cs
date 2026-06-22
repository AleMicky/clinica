using Clinica.Modules.Parametros.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.Parametros.Infrastructure.Persistence;

public class ParametrosDbContext : DbContext
{
    public ParametrosDbContext(DbContextOptions<ParametrosDbContext> options)
        : base(options)
    {
    }

    public DbSet<CatalogoGrupo> CatalogoGrupos => Set<CatalogoGrupo>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CatalogoGrupo>(entity =>
        {
            entity.ToTable("CatalogoGrupos");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Codigo)
                .HasMaxLength(50)
                .IsRequired();

            entity.HasIndex(e => e.Codigo)
                .IsUnique();

            entity.Property(e => e.Nombre)
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(e => e.Descripcion)
                .HasMaxLength(500);

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");

            entity.Property(e => e.CreatedBy)
                .HasMaxLength(100);

            entity.Property(e => e.UpdatedBy)
                .HasMaxLength(100);
        });
    }
}
