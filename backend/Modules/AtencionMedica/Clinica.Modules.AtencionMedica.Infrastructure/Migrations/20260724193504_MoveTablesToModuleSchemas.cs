using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.AtencionMedica.Infrastructure.Migrations;

/// <inheritdoc />
[DbContext(typeof(AtencionMedicaDbContext))]
[Migration("20260724193504_MoveTablesToModuleSchemas")]
public partial class MoveTablesToModuleSchemas : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'atencion_medica')
                EXEC(N'CREATE SCHEMA [atencion_medica]');
            IF OBJECT_ID(N'[dbo].[TiposAtencion]', N'U') IS NOT NULL
                ALTER SCHEMA [atencion_medica] TRANSFER [dbo].[TiposAtencion];
            IF OBJECT_ID(N'[dbo].[TiposCampoFormulario]', N'U') IS NOT NULL
                ALTER SCHEMA [atencion_medica] TRANSFER [dbo].[TiposCampoFormulario];
            IF OBJECT_ID(N'[dbo].[FormulariosClinicos]', N'U') IS NOT NULL
                ALTER SCHEMA [atencion_medica] TRANSFER [dbo].[FormulariosClinicos];
            IF OBJECT_ID(N'[dbo].[FormularioSecciones]', N'U') IS NOT NULL
                ALTER SCHEMA [atencion_medica] TRANSFER [dbo].[FormularioSecciones];
            IF OBJECT_ID(N'[dbo].[FormularioCampos]', N'U') IS NOT NULL
                ALTER SCHEMA [atencion_medica] TRANSFER [dbo].[FormularioCampos];
            IF OBJECT_ID(N'[dbo].[Atenciones]', N'U') IS NOT NULL
                ALTER SCHEMA [atencion_medica] TRANSFER [dbo].[Atenciones];
            IF OBJECT_ID(N'[dbo].[AtencionFormularioRespuestas]', N'U') IS NOT NULL
                ALTER SCHEMA [atencion_medica] TRANSFER [dbo].[AtencionFormularioRespuestas];
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            IF OBJECT_ID(N'[atencion_medica].[TiposAtencion]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [atencion_medica].[TiposAtencion];
            IF OBJECT_ID(N'[atencion_medica].[TiposCampoFormulario]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [atencion_medica].[TiposCampoFormulario];
            IF OBJECT_ID(N'[atencion_medica].[FormulariosClinicos]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [atencion_medica].[FormulariosClinicos];
            IF OBJECT_ID(N'[atencion_medica].[FormularioSecciones]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [atencion_medica].[FormularioSecciones];
            IF OBJECT_ID(N'[atencion_medica].[FormularioCampos]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [atencion_medica].[FormularioCampos];
            IF OBJECT_ID(N'[atencion_medica].[Atenciones]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [atencion_medica].[Atenciones];
            IF OBJECT_ID(N'[atencion_medica].[AtencionFormularioRespuestas]', N'U') IS NOT NULL
                ALTER SCHEMA [dbo] TRANSFER [atencion_medica].[AtencionFormularioRespuestas];
            """);
    }
}
