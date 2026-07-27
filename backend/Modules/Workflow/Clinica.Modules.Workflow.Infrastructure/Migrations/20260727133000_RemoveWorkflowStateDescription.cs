using Clinica.Modules.Workflow.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.Workflow.Infrastructure.Migrations;

/// <inheritdoc />
[DbContext(typeof(WorkflowDbContext))]
[Migration("20260727133000_RemoveWorkflowStateDescription")]
public partial class RemoveWorkflowStateDescription : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "Description",
            schema: "workflow",
            table: "WorkflowStates");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "Description",
            schema: "workflow",
            table: "WorkflowStates",
            type: "nvarchar(500)",
            maxLength: 500,
            nullable: false,
            defaultValue: "");
    }
}
