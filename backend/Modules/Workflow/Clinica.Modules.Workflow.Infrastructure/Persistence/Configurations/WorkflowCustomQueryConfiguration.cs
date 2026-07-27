using Clinica.Modules.Workflow.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Workflow.Infrastructure.Persistence.Configurations;

public sealed class WorkflowCustomQueryConfiguration
    : BaseEntityConfiguration<WorkflowCustomQuery>
{
    public override void Configure(EntityTypeBuilder<WorkflowCustomQuery> builder)
    {
        base.Configure(builder);

        builder.ToTable("WorkflowCustomQueries");

        builder.Property(x => x.Code).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(500);
        builder.Property(x => x.ProcedureName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);

        builder.HasIndex(x => x.Code).IsUnique();
    }
}
