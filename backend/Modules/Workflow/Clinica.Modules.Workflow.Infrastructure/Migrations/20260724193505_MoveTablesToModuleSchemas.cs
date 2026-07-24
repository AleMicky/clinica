using Clinica.Modules.Workflow.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.Workflow.Infrastructure.Migrations;

/// <inheritdoc />
[DbContext(typeof(WorkflowDbContext))]
[Migration("20260724193505_MoveTablesToModuleSchemas")]
public partial class MoveTablesToModuleSchemas : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'workflow')
                EXEC(N'CREATE SCHEMA [workflow]');
            IF OBJECT_ID(N'[dbo].[WorkflowDefinitions]', N'U') IS NOT NULL
                ALTER SCHEMA [workflow] TRANSFER [dbo].[WorkflowDefinitions];
            IF OBJECT_ID(N'[dbo].[WorkflowStates]', N'U') IS NOT NULL
                ALTER SCHEMA [workflow] TRANSFER [dbo].[WorkflowStates];
            IF OBJECT_ID(N'[dbo].[WorkflowTransitions]', N'U') IS NOT NULL
                ALTER SCHEMA [workflow] TRANSFER [dbo].[WorkflowTransitions];
            IF OBJECT_ID(N'[dbo].[WorkflowInstances]', N'U') IS NOT NULL
                ALTER SCHEMA [workflow] TRANSFER [dbo].[WorkflowInstances];
            IF OBJECT_ID(N'[dbo].[WorkflowHistories]', N'U') IS NOT NULL
                ALTER SCHEMA [workflow] TRANSFER [dbo].[WorkflowHistories];
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            IF OBJECT_ID(N'[workflow].[WorkflowDefinitions]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [workflow].[WorkflowDefinitions];
            IF OBJECT_ID(N'[workflow].[WorkflowStates]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [workflow].[WorkflowStates];
            IF OBJECT_ID(N'[workflow].[WorkflowTransitions]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [workflow].[WorkflowTransitions];
            IF OBJECT_ID(N'[workflow].[WorkflowInstances]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [workflow].[WorkflowInstances];
            IF OBJECT_ID(N'[workflow].[WorkflowHistories]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [workflow].[WorkflowHistories];
            """);
    }
}
