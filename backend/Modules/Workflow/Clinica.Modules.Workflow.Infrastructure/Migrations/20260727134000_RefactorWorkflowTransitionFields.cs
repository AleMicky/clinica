using Clinica.Modules.Workflow.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.Workflow.Infrastructure.Migrations;

/// <inheritdoc />
[DbContext(typeof(WorkflowDbContext))]
[Migration("20260727134000_RefactorWorkflowTransitionFields")]
public partial class RefactorWorkflowTransitionFields : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_WorkflowTransitions_WorkflowDefinitionId_FromStateId_ActionCode",
            schema: "workflow",
            table: "WorkflowTransitions");

        migrationBuilder.DropColumn(
            name: "Description",
            schema: "workflow",
            table: "WorkflowTransitions");

        migrationBuilder.DropColumn(
            name: "RequiredRole",
            schema: "workflow",
            table: "WorkflowTransitions");

        migrationBuilder.RenameColumn(
            name: "ActionName",
            schema: "workflow",
            table: "WorkflowTransitions",
            newName: "Name");

        migrationBuilder.RenameColumn(
            name: "ActionCode",
            schema: "workflow",
            table: "WorkflowTransitions",
            newName: "Code");

        migrationBuilder.CreateIndex(
            name: "IX_WorkflowTransitions_WorkflowDefinitionId_FromStateId_Code",
            schema: "workflow",
            table: "WorkflowTransitions",
            columns: new[] { "WorkflowDefinitionId", "FromStateId", "Code" },
            unique: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_WorkflowTransitions_WorkflowDefinitionId_FromStateId_Code",
            schema: "workflow",
            table: "WorkflowTransitions");

        migrationBuilder.RenameColumn(
            name: "Name",
            schema: "workflow",
            table: "WorkflowTransitions",
            newName: "ActionName");

        migrationBuilder.RenameColumn(
            name: "Code",
            schema: "workflow",
            table: "WorkflowTransitions",
            newName: "ActionCode");

        migrationBuilder.AddColumn<string>(
            name: "Description",
            schema: "workflow",
            table: "WorkflowTransitions",
            type: "nvarchar(500)",
            maxLength: 500,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<string>(
            name: "RequiredRole",
            schema: "workflow",
            table: "WorkflowTransitions",
            type: "nvarchar(100)",
            maxLength: 100,
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_WorkflowTransitions_WorkflowDefinitionId_FromStateId_ActionCode",
            schema: "workflow",
            table: "WorkflowTransitions",
            columns: new[] { "WorkflowDefinitionId", "FromStateId", "ActionCode" },
            unique: true);
    }
}
