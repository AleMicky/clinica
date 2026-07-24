-- Move module tables from dbo to dedicated schemas (idempotent)
SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;

-- parametros
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = N'parametros')
    EXEC(N'CREATE SCHEMA [parametros]');
IF OBJECT_ID(N'[dbo].[CatalogoGrupos]', N'U') IS NOT NULL
    ALTER SCHEMA [parametros] TRANSFER [dbo].[CatalogoGrupos];
IF OBJECT_ID(N'[dbo].[CatalogoItems]', N'U') IS NOT NULL
    ALTER SCHEMA [parametros] TRANSFER [dbo].[CatalogoItems];
IF OBJECT_ID(N'[dbo].[Correlativos]', N'U') IS NOT NULL
    ALTER SCHEMA [parametros] TRANSFER [dbo].[Correlativos];

-- recursos_humanos
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

-- personas
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

-- atencion_medica
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

-- workflow
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

-- Mark EF migrations as applied (shared history table)
IF OBJECT_ID(N'[dbo].[__EFMigrationsHistory]', N'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = N'20260724193501_MoveTablesToModuleSchemas')
        INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
        VALUES (N'20260724193501_MoveTablesToModuleSchemas', N'10.0.9');

    IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = N'20260724193502_MoveTablesToModuleSchemas')
        INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
        VALUES (N'20260724193502_MoveTablesToModuleSchemas', N'10.0.9');

    IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = N'20260724193503_MoveTablesToModuleSchemas')
        INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
        VALUES (N'20260724193503_MoveTablesToModuleSchemas', N'10.0.9');

    IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = N'20260724193504_MoveTablesToModuleSchemas')
        INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
        VALUES (N'20260724193504_MoveTablesToModuleSchemas', N'10.0.9');

    IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory] WHERE [MigrationId] = N'20260724193505_MoveTablesToModuleSchemas')
        INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
        VALUES (N'20260724193505_MoveTablesToModuleSchemas', N'10.0.9');
END

COMMIT TRANSACTION;

SELECT s.name AS [Schema], t.name AS [Table]
FROM sys.tables t
INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE s.name IN (N'parametros', N'recursos_humanos', N'personas', N'atencion_medica', N'workflow', N'seguridad')
ORDER BY s.name, t.name;
