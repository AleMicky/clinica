using Clinica.Modules.Workflow.Domain.Entities;
using Clinica.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Clinica.Modules.Workflow.Infrastructure.Persistence.Configurations;

public sealed class WorkflowAssignmentEmployeeConfiguration
    : BaseEntityConfiguration<WorkflowAssignmentEmployee>
{
    public override void Configure(EntityTypeBuilder<WorkflowAssignmentEmployee> builder)
    {
        base.Configure(builder);

        builder.ToTable("WorkflowAssignmentEmployees");

        builder.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        builder.Property(x => x.CreatedBy).HasMaxLength(100);
        builder.Property(x => x.UpdatedBy).HasMaxLength(100);

        builder.HasIndex(x => new { x.WorkflowTransitionAssignmentId, x.EmployeeId }).IsUnique();
        builder.HasIndex(x => x.EmployeeId);

        builder.HasOne(x => x.Assignment)
            .WithMany(x => x.Employees)
            .HasForeignKey(x => x.WorkflowTransitionAssignmentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
