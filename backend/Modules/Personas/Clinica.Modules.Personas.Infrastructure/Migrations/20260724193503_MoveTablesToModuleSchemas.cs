using Clinica.Modules.Personas.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.Personas.Infrastructure.Migrations;

/// <inheritdoc />
[DbContext(typeof(PersonasDbContext))]
[Migration("20260724193503_MoveTablesToModuleSchemas")]
public partial class MoveTablesToModuleSchemas : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'personas')
                EXEC(N'CREATE SCHEMA [personas]');
            IF OBJECT_ID(N'[dbo].[Personas]', N'U') IS NOT NULL
                ALTER SCHEMA [personas] TRANSFER [dbo].[Personas];
            IF OBJECT_ID(N'[dbo].[Pacientes]', N'U') IS NOT NULL
                ALTER SCHEMA [personas] TRANSFER [dbo].[Pacientes];
            IF OBJECT_ID(N'[dbo].[Empleados]', N'U') IS NOT NULL
                ALTER SCHEMA [personas] TRANSFER [dbo].[Empleados];
            IF OBJECT_ID(N'[dbo].[Medicos]', N'U') IS NOT NULL
                ALTER SCHEMA [personas] TRANSFER [dbo].[Medicos];
            IF OBJECT_ID(N'[dbo].[MedicoEspecialidades]', N'U') IS NOT NULL
                ALTER SCHEMA [personas] TRANSFER [dbo].[MedicoEspecialidades];
            IF OBJECT_ID(N'[dbo].[ContactosEmergencia]', N'U') IS NOT NULL
                ALTER SCHEMA [personas] TRANSFER [dbo].[ContactosEmergencia];
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            IF OBJECT_ID(N'[personas].[Personas]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [personas].[Personas];
            IF OBJECT_ID(N'[personas].[Pacientes]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [personas].[Pacientes];
            IF OBJECT_ID(N'[personas].[Empleados]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [personas].[Empleados];
            IF OBJECT_ID(N'[personas].[Medicos]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [personas].[Medicos];
            IF OBJECT_ID(N'[personas].[MedicoEspecialidades]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [personas].[MedicoEspecialidades];
            IF OBJECT_ID(N'[personas].[ContactosEmergencia]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [personas].[ContactosEmergencia];
            """);
    }
}
