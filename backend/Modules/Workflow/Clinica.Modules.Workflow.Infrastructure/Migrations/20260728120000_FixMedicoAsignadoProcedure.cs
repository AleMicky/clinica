using Clinica.Modules.Workflow.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.Workflow.Infrastructure.Migrations;

/// <inheritdoc />
[DbContext(typeof(WorkflowDbContext))]
[Migration("20260728120000_FixMedicoAsignadoProcedure")]
public partial class FixMedicoAsignadoProcedure : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            CREATE OR ALTER PROCEDURE workflow.sp_medico_asignado_atencion
                @WorkflowInstanceId UNIQUEIDENTIFIER,
                @Page INT = 1,
                @PageSize INT = 20
            AS
            BEGIN
                SET NOCOUNT ON;

                IF @Page < 1
                    SET @Page = 1;

                IF @PageSize < 1
                    SET @PageSize = 20;

                IF @PageSize > 100
                    SET @PageSize = 100;

                DECLARE @ReferenceId UNIQUEIDENTIFIER;

                SELECT
                    @ReferenceId = wi.ReferenceId
                FROM workflow.WorkflowInstances wi
                WHERE wi.Id = @WorkflowInstanceId
                  AND wi.IsDeleted = 0;

                IF @ReferenceId IS NULL
                BEGIN
                    THROW 50001, 'No se encontró la instancia Workflow.', 1;
                END;

                SELECT
                    e.Id AS EmployeeId,
                    LTRIM(RTRIM(CONCAT(
                        p.Nombres,
                        ' ',
                        p.ApellidoPaterno,
                        ' ',
                        p.ApellidoMaterno
                    ))) AS EmployeeName,
                    COUNT(*) OVER() AS TotalRecords
                FROM atencion_medica.Atenciones a
                INNER JOIN personas.Medicos m
                    ON m.Id = a.MedicoId
                   AND m.IsDeleted = 0
                INNER JOIN recursos_humanos.Empleados e
                    ON e.Id = m.EmpleadoId
                   AND e.IsDeleted = 0
                INNER JOIN personas.Personas p
                    ON p.Id = e.PersonaId
                   AND p.IsDeleted = 0
                WHERE a.Id = @ReferenceId
                  AND a.IsDeleted = 0
                  AND a.MedicoId IS NOT NULL
                ORDER BY EmployeeName
                OFFSET (@Page - 1) * @PageSize ROWS
                FETCH NEXT @PageSize ROWS ONLY;
            END;
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            CREATE OR ALTER PROCEDURE workflow.sp_medico_asignado_atencion
                @WorkflowInstanceId UNIQUEIDENTIFIER,
                @Page INT = 1,
                @PageSize INT = 20
            AS
            BEGIN
                SET NOCOUNT ON;

                IF @Page < 1
                    SET @Page = 1;

                IF @PageSize < 1
                    SET @PageSize = 20;

                IF @PageSize > 100
                    SET @PageSize = 100;

                DECLARE @ReferenceId UNIQUEIDENTIFIER;

                SELECT
                    @ReferenceId = wi.ReferenceId
                FROM workflow.WorkflowInstances wi
                WHERE wi.Id = @WorkflowInstanceId
                  AND wi.IsDeleted = 0;

                IF @ReferenceId IS NULL
                BEGIN
                    THROW 50001, 'No se encontró la instancia Workflow.', 1;
                END;

                SELECT
                    e.Id AS EmployeeId,
                    LTRIM(RTRIM(CONCAT(
                        p.Nombres,
                        ' ',
                        p.ApellidoPaterno,
                        ' ',
                        p.ApellidoMaterno
                    ))) AS EmployeeName,
                    COUNT(*) OVER() AS TotalRecords
                FROM atencion_medica.Atenciones a
                INNER JOIN recursos_humanos.Empleados e
                    ON e.Id = a.MedicoId
                INNER JOIN personas.Personas p
                    ON p.Id = e.PersonaId
                WHERE a.Id = @ReferenceId
                  AND a.IsDeleted = 0
                  AND e.IsDeleted = 0
                  AND p.IsDeleted = 0
                ORDER BY EmployeeName
                OFFSET (@Page - 1) * @PageSize ROWS
                FETCH NEXT @PageSize ROWS ONLY;
            END;
            """);
    }
}
