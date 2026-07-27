using Clinica.Modules.Workflow.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.Workflow.Infrastructure.Migrations;

/// <inheritdoc />
[DbContext(typeof(WorkflowDbContext))]
[Migration("20260727140000_AlignWorkflowEmployeeAssignmentModel")]
public partial class AlignWorkflowEmployeeAssignmentModel : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_WorkflowInstances_WorkflowDefinitionId_Correlative",
            schema: "workflow",
            table: "WorkflowInstances");

        migrationBuilder.DropColumn(
            name: "Correlative",
            schema: "workflow",
            table: "WorkflowInstances");

        migrationBuilder.DropColumn(
            name: "StartedByUserName",
            schema: "workflow",
            table: "WorkflowInstances");

        migrationBuilder.RenameColumn(
            name: "StartedByUserId",
            schema: "workflow",
            table: "WorkflowInstances",
            newName: "StartedByEmployeeId");

        migrationBuilder.DropColumn(
            name: "ActionCode",
            schema: "workflow",
            table: "WorkflowHistories");

        migrationBuilder.DropColumn(
            name: "ActionName",
            schema: "workflow",
            table: "WorkflowHistories");

        migrationBuilder.DropColumn(
            name: "PerformedByRole",
            schema: "workflow",
            table: "WorkflowHistories");

        migrationBuilder.DropColumn(
            name: "PerformedByUserName",
            schema: "workflow",
            table: "WorkflowHistories");

        migrationBuilder.RenameColumn(
            name: "PerformedByUserId",
            schema: "workflow",
            table: "WorkflowHistories",
            newName: "ExecutedByEmployeeId");

        migrationBuilder.AddColumn<Guid>(
            name: "WorkflowTransitionId",
            schema: "workflow",
            table: "WorkflowHistories",
            type: "uniqueidentifier",
            nullable: true);

        migrationBuilder.CreateTable(
            name: "WorkflowCustomQueries",
            schema: "workflow",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Code = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                ProcedureName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_WorkflowCustomQueries", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "WorkflowTransitionAssignments",
            schema: "workflow",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                WorkflowTransitionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Type = table.Column<int>(type: "int", nullable: false),
                AreaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                WorkflowCustomQueryId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_WorkflowTransitionAssignments", x => x.Id);
                table.ForeignKey(
                    name: "FK_WorkflowTransitionAssignments_WorkflowCustomQueries_WorkflowCustomQueryId",
                    column: x => x.WorkflowCustomQueryId,
                    principalSchema: "workflow",
                    principalTable: "WorkflowCustomQueries",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_WorkflowTransitionAssignments_WorkflowTransitions_WorkflowTransitionId",
                    column: x => x.WorkflowTransitionId,
                    principalSchema: "workflow",
                    principalTable: "WorkflowTransitions",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "WorkflowAssignmentEmployees",
            schema: "workflow",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                WorkflowTransitionAssignmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                EmployeeId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_WorkflowAssignmentEmployees", x => x.Id);
                table.ForeignKey(
                    name: "FK_WorkflowAssignmentEmployees_WorkflowTransitionAssignments_WorkflowTransitionAssignmentId",
                    column: x => x.WorkflowTransitionAssignmentId,
                    principalSchema: "workflow",
                    principalTable: "WorkflowTransitionAssignments",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_WorkflowInstances_StartedByEmployeeId",
            schema: "workflow",
            table: "WorkflowInstances",
            column: "StartedByEmployeeId");

        migrationBuilder.CreateIndex(
            name: "IX_WorkflowHistories_ExecutedByEmployeeId",
            schema: "workflow",
            table: "WorkflowHistories",
            column: "ExecutedByEmployeeId");

        migrationBuilder.CreateIndex(
            name: "IX_WorkflowHistories_WorkflowTransitionId",
            schema: "workflow",
            table: "WorkflowHistories",
            column: "WorkflowTransitionId");

        migrationBuilder.CreateIndex(
            name: "IX_WorkflowCustomQueries_Code",
            schema: "workflow",
            table: "WorkflowCustomQueries",
            column: "Code",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_WorkflowTransitionAssignments_AreaId",
            schema: "workflow",
            table: "WorkflowTransitionAssignments",
            column: "AreaId");

        migrationBuilder.CreateIndex(
            name: "IX_WorkflowTransitionAssignments_WorkflowCustomQueryId",
            schema: "workflow",
            table: "WorkflowTransitionAssignments",
            column: "WorkflowCustomQueryId");

        migrationBuilder.CreateIndex(
            name: "IX_WorkflowTransitionAssignments_WorkflowTransitionId",
            schema: "workflow",
            table: "WorkflowTransitionAssignments",
            column: "WorkflowTransitionId",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_WorkflowAssignmentEmployees_EmployeeId",
            schema: "workflow",
            table: "WorkflowAssignmentEmployees",
            column: "EmployeeId");

        migrationBuilder.CreateIndex(
            name: "IX_WorkflowAssignmentEmployees_WorkflowTransitionAssignmentId_EmployeeId",
            schema: "workflow",
            table: "WorkflowAssignmentEmployees",
            columns: new[] { "WorkflowTransitionAssignmentId", "EmployeeId" },
            unique: true);

        migrationBuilder.AddForeignKey(
            name: "FK_WorkflowHistories_WorkflowTransitions_WorkflowTransitionId",
            schema: "workflow",
            table: "WorkflowHistories",
            column: "WorkflowTransitionId",
            principalSchema: "workflow",
            principalTable: "WorkflowTransitions",
            principalColumn: "Id",
            onDelete: ReferentialAction.SetNull);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_WorkflowHistories_WorkflowTransitions_WorkflowTransitionId",
            schema: "workflow",
            table: "WorkflowHistories");

        migrationBuilder.DropTable(
            name: "WorkflowAssignmentEmployees",
            schema: "workflow");

        migrationBuilder.DropTable(
            name: "WorkflowTransitionAssignments",
            schema: "workflow");

        migrationBuilder.DropTable(
            name: "WorkflowCustomQueries",
            schema: "workflow");

        migrationBuilder.DropIndex(
            name: "IX_WorkflowInstances_StartedByEmployeeId",
            schema: "workflow",
            table: "WorkflowInstances");

        migrationBuilder.DropIndex(
            name: "IX_WorkflowHistories_ExecutedByEmployeeId",
            schema: "workflow",
            table: "WorkflowHistories");

        migrationBuilder.DropIndex(
            name: "IX_WorkflowHistories_WorkflowTransitionId",
            schema: "workflow",
            table: "WorkflowHistories");

        migrationBuilder.DropColumn(
            name: "WorkflowTransitionId",
            schema: "workflow",
            table: "WorkflowHistories");

        migrationBuilder.RenameColumn(
            name: "StartedByEmployeeId",
            schema: "workflow",
            table: "WorkflowInstances",
            newName: "StartedByUserId");

        migrationBuilder.RenameColumn(
            name: "ExecutedByEmployeeId",
            schema: "workflow",
            table: "WorkflowHistories",
            newName: "PerformedByUserId");

        migrationBuilder.AddColumn<int>(
            name: "Correlative",
            schema: "workflow",
            table: "WorkflowInstances",
            type: "int",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<string>(
            name: "StartedByUserName",
            schema: "workflow",
            table: "WorkflowInstances",
            type: "nvarchar(200)",
            maxLength: 200,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<string>(
            name: "ActionCode",
            schema: "workflow",
            table: "WorkflowHistories",
            type: "nvarchar(100)",
            maxLength: 100,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<string>(
            name: "ActionName",
            schema: "workflow",
            table: "WorkflowHistories",
            type: "nvarchar(200)",
            maxLength: 200,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<string>(
            name: "PerformedByRole",
            schema: "workflow",
            table: "WorkflowHistories",
            type: "nvarchar(100)",
            maxLength: 100,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "PerformedByUserName",
            schema: "workflow",
            table: "WorkflowHistories",
            type: "nvarchar(200)",
            maxLength: 200,
            nullable: false,
            defaultValue: "");

        migrationBuilder.CreateIndex(
            name: "IX_WorkflowInstances_WorkflowDefinitionId_Correlative",
            schema: "workflow",
            table: "WorkflowInstances",
            columns: new[] { "WorkflowDefinitionId", "Correlative" },
            unique: true);
    }
}
