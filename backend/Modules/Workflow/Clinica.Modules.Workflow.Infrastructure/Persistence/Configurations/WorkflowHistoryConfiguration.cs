using Clinica.Modules.Workflow.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Workflow.Infrastructure.Persistence.Configurations;

public sealed class WorkflowHistoryConfiguration
    : BaseEntityConfiguration<WorkflowHistory>
{
    public override void Configure(EntityTypeBuilder<WorkflowHistory> builder)
    {
        base.Configure(builder);

        builder.ToTable("WorkflowHistories");

        builder.Property(x => x.Comment).HasMaxLength(1000);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);

        builder.HasIndex(x => x.ExecutedByEmployeeId);
        builder.HasIndex(x => x.WorkflowTransitionId);

        builder.HasOne(x => x.WorkflowInstance)
            .WithMany(x => x.History)
            .HasForeignKey(x => x.WorkflowInstanceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.WorkflowTransition)
            .WithMany()
            .HasForeignKey(x => x.WorkflowTransitionId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(x => x.FromState)
            .WithMany()
            .HasForeignKey(x => x.FromStateId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ToState)
            .WithMany()
            .HasForeignKey(x => x.ToStateId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
