using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Migrations;

/// <inheritdoc />
public partial class MoveEmpleadosToRecursosHumanos : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'recursos_humanos')
                EXEC(N'CREATE SCHEMA [recursos_humanos]');

            IF OBJECT_ID(N'[recursos_humanos].[Empleados]', N'U') IS NULL
            BEGIN
                IF OBJECT_ID(N'[personas].[Empleados]', N'U') IS NOT NULL
                    ALTER SCHEMA [recursos_humanos] TRANSFER [personas].[Empleados];
                ELSE IF OBJECT_ID(N'[dbo].[Empleados]', N'U') IS NOT NULL
                    ALTER SCHEMA [recursos_humanos] TRANSFER [dbo].[Empleados];
            END
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            IF OBJECT_ID(N'[recursos_humanos].[Empleados]', N'U') IS NOT NULL
                AND OBJECT_ID(N'[personas].[Empleados]', N'U') IS NULL
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'personas')
                    EXEC(N'CREATE SCHEMA [personas]');
                ALTER SCHEMA [personas] TRANSFER [recursos_humanos].[Empleados];
            END
            """);
    }
}
