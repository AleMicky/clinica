using Clinica.Modules.Workflow.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Workflow.Infrastructure.Persistence.Configurations;

public sealed class WorkflowInstanceConfiguration
    : BaseEntityConfiguration<WorkflowInstance>
{
    public override void Configure(EntityTypeBuilder<WorkflowInstance> builder)
    {
        base.Configure(builder);

        builder.ToTable("WorkflowInstances");

        builder.Property(x => x.ReferenceModule).HasMaxLength(100).IsRequired();
        builder.Property(x => x.ReferenceEntity).HasMaxLength(100).IsRequired();
        builder.Property(x => x.StartedByUserName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);

        builder.HasIndex(x => new { x.ReferenceModule, x.ReferenceEntity, x.ReferenceId }).IsUnique();
        builder.HasIndex(x => new { x.WorkflowDefinitionId, x.Correlative }).IsUnique();

        builder.HasOne(x => x.WorkflowDefinition)
            .WithMany(x => x.Instances)
            .HasForeignKey(x => x.WorkflowDefinitionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.CurrentState)
            .WithMany()
            .HasForeignKey(x => x.CurrentStateId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
