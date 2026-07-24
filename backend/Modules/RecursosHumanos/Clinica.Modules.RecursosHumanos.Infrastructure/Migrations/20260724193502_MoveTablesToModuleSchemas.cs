using Clinica.Modules.RecursosHumanos.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Migrations;

/// <inheritdoc />
[DbContext(typeof(RecursosHumanosDbContext))]
[Migration("20260724193502_MoveTablesToModuleSchemas")]
public partial class MoveTablesToModuleSchemas : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'recursos_humanos')
                EXEC(N'CREATE SCHEMA [recursos_humanos]');
            IF OBJECT_ID(N'[dbo].[Areas]', N'U') IS NOT NULL
                ALTER SCHEMA [recursos_humanos] TRANSFER [dbo].[Areas];
            IF OBJECT_ID(N'[dbo].[Cargos]', N'U') IS NOT NULL
                ALTER SCHEMA [recursos_humanos] TRANSFER [dbo].[Cargos];
            IF OBJECT_ID(N'[dbo].[Departamentos]', N'U') IS NOT NULL
                ALTER SCHEMA [recursos_humanos] TRANSFER [dbo].[Departamentos];
            IF OBJECT_ID(N'[dbo].[Especialidades]', N'U') IS NOT NULL
                ALTER SCHEMA [recursos_humanos] TRANSFER [dbo].[Especialidades];
            IF OBJECT_ID(N'[dbo].[Profesiones]', N'U') IS NOT NULL
                ALTER SCHEMA [recursos_humanos] TRANSFER [dbo].[Profesiones];
            IF OBJECT_ID(N'[dbo].[Servicios]', N'U') IS NOT NULL
                ALTER SCHEMA [recursos_humanos] TRANSFER [dbo].[Servicios];
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            IF OBJECT_ID(N'[recursos_humanos].[Areas]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [recursos_humanos].[Areas];
            IF OBJECT_ID(N'[recursos_humanos].[Cargos]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [recursos_humanos].[Cargos];
            IF OBJECT_ID(N'[recursos_humanos].[Departamentos]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [recursos_humanos].[Departamentos];
            IF OBJECT_ID(N'[recursos_humanos].[Especialidades]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [recursos_humanos].[Especialidades];
            IF OBJECT_ID(N'[recursos_humanos].[Profesiones]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [recursos_humanos].[Profesiones];
            IF OBJECT_ID(N'[recursos_humanos].[Servicios]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [recursos_humanos].[Servicios];
            """);
    }
}
