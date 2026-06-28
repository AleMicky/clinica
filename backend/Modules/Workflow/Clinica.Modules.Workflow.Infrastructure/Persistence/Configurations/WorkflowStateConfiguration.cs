using Clinica.Modules.Workflow.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Workflow.Infrastructure.Persistence.Configurations;

public sealed class WorkflowStateConfiguration
    : BaseEntityConfiguration<WorkflowState>
{
    public override void Configure(EntityTypeBuilder<WorkflowState> builder)
    {
        base.Configure(builder);

        builder.ToTable("WorkflowStates");

        builder.Property(x => x.Code).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(500);
        builder.Property(x => x.Color).HasMaxLength(20).IsRequired();
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);

        builder.HasIndex(x => new { x.WorkflowDefinitionId, x.Code }).IsUnique();

        builder.HasOne(x => x.WorkflowDefinition)
            .WithMany(x => x.States)
            .HasForeignKey(x => x.WorkflowDefinitionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
