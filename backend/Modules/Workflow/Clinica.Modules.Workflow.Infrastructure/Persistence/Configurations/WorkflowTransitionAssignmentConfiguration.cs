using Clinica.Modules.Workflow.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Workflow.Infrastructure.Persistence.Configurations;

public sealed class WorkflowTransitionAssignmentConfiguration
    : BaseEntityConfiguration<WorkflowTransitionAssignment>
{
    public override void Configure(EntityTypeBuilder<WorkflowTransitionAssignment> builder)
    {
        base.Configure(builder);

        builder.ToTable("WorkflowTransitionAssignments");

        builder.Property(x => x.Type).HasConversion<int>().IsRequired();
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);

        builder.HasIndex(x => x.WorkflowTransitionId).IsUnique();
        builder.HasIndex(x => x.AreaId);
        builder.HasIndex(x => x.WorkflowCustomQueryId);

        builder.HasOne(x => x.WorkflowCustomQuery)
            .WithMany()
            .HasForeignKey(x => x.WorkflowCustomQueryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
