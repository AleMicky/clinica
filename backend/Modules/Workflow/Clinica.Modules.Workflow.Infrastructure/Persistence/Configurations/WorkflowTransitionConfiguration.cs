using Clinica.Modules.Workflow.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Workflow.Infrastructure.Persistence.Configurations;

public sealed class WorkflowTransitionConfiguration
    : BaseEntityConfiguration<WorkflowTransition>
{
    public override void Configure(EntityTypeBuilder<WorkflowTransition> builder)
    {
        base.Configure(builder);

        builder.ToTable("WorkflowTransitions");

        builder.Property(x => x.ActionCode).HasMaxLength(100).IsRequired();
        builder.Property(x => x.ActionName).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(500);
        builder.Property(x => x.RequiredRole).HasMaxLength(100);
        builder.Property(x => x.IsActive).HasDefaultValue(true);
        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);

        builder.HasIndex(x => new { x.WorkflowDefinitionId, x.FromStateId, x.ActionCode }).IsUnique();

        builder.HasOne(x => x.WorkflowDefinition)
            .WithMany(x => x.Transitions)
            .HasForeignKey(x => x.WorkflowDefinitionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.FromState)
            .WithMany(x => x.OutgoingTransitions)
            .HasForeignKey(x => x.FromStateId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ToState)
            .WithMany(x => x.IncomingTransitions)
            .HasForeignKey(x => x.ToStateId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
