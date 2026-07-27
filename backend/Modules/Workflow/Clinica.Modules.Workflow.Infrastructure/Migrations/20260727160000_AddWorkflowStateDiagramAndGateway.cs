using Clinica.Modules.Workflow.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.Workflow.Infrastructure.Migrations;

/// <inheritdoc />
[DbContext(typeof(WorkflowDbContext))]
[Migration("20260727160000_AddWorkflowStateDiagramAndGateway")]
public partial class AddWorkflowStateDiagramAndGateway : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<double>(
            name: "DiagramX",
            schema: "workflow",
            table: "WorkflowStates",
            type: "float",
            nullable: true);

        migrationBuilder.AddColumn<double>(
            name: "DiagramY",
            schema: "workflow",
            table: "WorkflowStates",
            type: "float",
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "IsGateway",
            schema: "workflow",
            table: "WorkflowStates",
            type: "bit",
            nullable: false,
            defaultValue: false);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "DiagramX",
            schema: "workflow",
            table: "WorkflowStates");

        migrationBuilder.DropColumn(
            name: "DiagramY",
            schema: "workflow",
            table: "WorkflowStates");

        migrationBuilder.DropColumn(
            name: "IsGateway",
            schema: "workflow",
            table: "WorkflowStates");
    }
}
