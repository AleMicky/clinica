using Clinica.Modules.Parametros.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.Parametros.Infrastructure.Migrations;

/// <inheritdoc />
[DbContext(typeof(ParametrosDbContext))]
[Migration("20260724193501_MoveTablesToModuleSchemas")]
public partial class MoveTablesToModuleSchemas : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'parametros')
                EXEC(N'CREATE SCHEMA [parametros]');
            IF OBJECT_ID(N'[dbo].[CatalogoGrupos]', N'U') IS NOT NULL
                ALTER SCHEMA [parametros] TRANSFER [dbo].[CatalogoGrupos];
            IF OBJECT_ID(N'[dbo].[CatalogoItems]', N'U') IS NOT NULL
                ALTER SCHEMA [parametros] TRANSFER [dbo].[CatalogoItems];
            IF OBJECT_ID(N'[dbo].[Correlativos]', N'U') IS NOT NULL
                ALTER SCHEMA [parametros] TRANSFER [dbo].[Correlativos];
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            IF OBJECT_ID(N'[parametros].[CatalogoGrupos]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [parametros].[CatalogoGrupos];
            IF OBJECT_ID(N'[parametros].[CatalogoItems]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [parametros].[CatalogoItems];
            IF OBJECT_ID(N'[parametros].[Correlativos]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [parametros].[Correlativos];
            """);
    }
}
