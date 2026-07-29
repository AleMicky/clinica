using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RefactorProgramacionJerarquica : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GrupoProgramacion",
                schema: "recursos_humanos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    AreaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GrupoProgramacion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GrupoProgramacion_Areas_AreaId",
                        column: x => x.AreaId,
                        principalSchema: "recursos_humanos",
                        principalTable: "Areas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Programacion",
                schema: "recursos_humanos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    FechaInicio = table.Column<DateOnly>(type: "date", nullable: false),
                    FechaFin = table.Column<DateOnly>(type: "date", nullable: false),
                    GrupoProgramacionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Estado = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    Observacion = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Programacion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Programacion_GrupoProgramacion_GrupoProgramacionId",
                        column: x => x.GrupoProgramacionId,
                        principalSchema: "recursos_humanos",
                        principalTable: "GrupoProgramacion",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "GrupoProgramacionEmpleado",
                schema: "recursos_humanos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GrupoProgramacionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmpleadoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GrupoProgramacionEmpleado", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GrupoProgramacionEmpleado_Empleados_EmpleadoId",
                        column: x => x.EmpleadoId,
                        principalSchema: "recursos_humanos",
                        principalTable: "Empleados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GrupoProgramacionEmpleado_GrupoProgramacion_GrupoProgramacionId",
                        column: x => x.GrupoProgramacionId,
                        principalSchema: "recursos_humanos",
                        principalTable: "GrupoProgramacion",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GrupoProgramacion_AreaId",
                schema: "recursos_humanos",
                table: "GrupoProgramacion",
                column: "AreaId");

            migrationBuilder.CreateIndex(
                name: "IX_GrupoProgramacion_Codigo",
                schema: "recursos_humanos",
                table: "GrupoProgramacion",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Programacion_GrupoProgramacionId",
                schema: "recursos_humanos",
                table: "Programacion",
                column: "GrupoProgramacionId");

            migrationBuilder.CreateIndex(
                name: "IX_Programacion_FechaInicio_FechaFin",
                schema: "recursos_humanos",
                table: "Programacion",
                columns: new[] { "FechaInicio", "FechaFin" });

            migrationBuilder.CreateIndex(
                name: "IX_GrupoProgramacionEmpleado_EmpleadoId",
                schema: "recursos_humanos",
                table: "GrupoProgramacionEmpleado",
                column: "EmpleadoId");

            migrationBuilder.CreateIndex(
                name: "IX_GrupoProgramacionEmpleado_GrupoProgramacionId_EmpleadoId",
                schema: "recursos_humanos",
                table: "GrupoProgramacionEmpleado",
                columns: new[] { "GrupoProgramacionId", "EmpleadoId" },
                unique: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ProgramacionId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TipoAsignacion",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                type: "int",
                nullable: false,
                defaultValue: 1);

            MigrateExistingProgramacionDiariaData(migrationBuilder);

            migrationBuilder.AlterColumn<Guid>(
                name: "ProgramacionId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.DropForeignKey(
                name: "FK_ProgramacionDiaria_Areas_AreaId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria");

            migrationBuilder.DropForeignKey(
                name: "FK_ProgramacionDiaria_Cargos_CargoId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria");

            migrationBuilder.DropForeignKey(
                name: "FK_ProgramacionDiaria_Especialidades_EspecialidadId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria");

            migrationBuilder.DropIndex(
                name: "IX_ProgramacionDiaria_AreaId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria");

            migrationBuilder.DropIndex(
                name: "IX_ProgramacionDiaria_CargoId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria");

            migrationBuilder.DropIndex(
                name: "IX_ProgramacionDiaria_EspecialidadId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria");

            migrationBuilder.DropIndex(
                name: "IX_ProgramacionDiaria_Fecha_AreaId_EsMedicoTurno",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria");

            migrationBuilder.DropColumn(
                name: "AreaId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria");

            migrationBuilder.DropColumn(
                name: "CargoId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria");

            migrationBuilder.DropColumn(
                name: "EspecialidadId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria");

            migrationBuilder.DropColumn(
                name: "Estado",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria");

            migrationBuilder.DropColumn(
                name: "EsMedicoTurno",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria");

            migrationBuilder.DropColumn(
                name: "AceptaConsultas",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria");

            migrationBuilder.DropColumn(
                name: "AceptaSinCita",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria");

            migrationBuilder.DropColumn(
                name: "MaxPacientes",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria");

            migrationBuilder.DropColumn(
                name: "PermiteMultiplesMedicosTurno",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria");

            migrationBuilder.AlterColumn<Guid>(
                name: "TurnoId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.CreateIndex(
                name: "IX_ProgramacionDiaria_ProgramacionId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                column: "ProgramacionId");

            migrationBuilder.AddForeignKey(
                name: "FK_ProgramacionDiaria_Programacion_ProgramacionId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                column: "ProgramacionId",
                principalSchema: "recursos_humanos",
                principalTable: "Programacion",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProgramacionDiaria_Programacion_ProgramacionId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria");

            migrationBuilder.DropIndex(
                name: "IX_ProgramacionDiaria_ProgramacionId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria");

            migrationBuilder.AddColumn<Guid>(
                name: "AreaId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: Guid.Empty);

            migrationBuilder.AddColumn<Guid>(
                name: "CargoId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: Guid.Empty);

            migrationBuilder.AddColumn<Guid>(
                name: "EspecialidadId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Estado",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "ACTIVO");

            migrationBuilder.AddColumn<bool>(
                name: "EsMedicoTurno",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AceptaConsultas",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "AceptaSinCita",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MaxPacientes",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "PermiteMultiplesMedicosTurno",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<Guid>(
                name: "TurnoId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: Guid.Empty,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.DropColumn(
                name: "ProgramacionId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria");

            migrationBuilder.DropColumn(
                name: "TipoAsignacion",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria");

            migrationBuilder.CreateIndex(
                name: "IX_ProgramacionDiaria_AreaId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                column: "AreaId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgramacionDiaria_CargoId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                column: "CargoId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgramacionDiaria_EspecialidadId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                column: "EspecialidadId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgramacionDiaria_Fecha_AreaId_EsMedicoTurno",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                columns: new[] { "Fecha", "AreaId", "EsMedicoTurno" });

            migrationBuilder.AddForeignKey(
                name: "FK_ProgramacionDiaria_Areas_AreaId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                column: "AreaId",
                principalSchema: "recursos_humanos",
                principalTable: "Areas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProgramacionDiaria_Cargos_CargoId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                column: "CargoId",
                principalSchema: "recursos_humanos",
                principalTable: "Cargos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProgramacionDiaria_Especialidades_EspecialidadId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                column: "EspecialidadId",
                principalSchema: "recursos_humanos",
                principalTable: "Especialidades",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.DropTable(
                name: "GrupoProgramacionEmpleado",
                schema: "recursos_humanos");

            migrationBuilder.DropTable(
                name: "Programacion",
                schema: "recursos_humanos");

            migrationBuilder.DropTable(
                name: "GrupoProgramacion",
                schema: "recursos_humanos");
        }

        private static void MigrateExistingProgramacionDiariaData(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF EXISTS (SELECT 1 FROM [recursos_humanos].[ProgramacionDiaria])
                BEGIN
                    INSERT INTO [recursos_humanos].[GrupoProgramacion] (
                        [Id], [Codigo], [Nombre], [AreaId], [CreatedAt], [IsDeleted])
                    SELECT
                        NEWID(),
                        CONCAT('GRP-', a.[Codigo]),
                        CONCAT('Grupo ', a.[Nombre]),
                        pd.[AreaId],
                        GETUTCDATE(),
                        0
                    FROM (
                        SELECT DISTINCT [AreaId]
                        FROM [recursos_humanos].[ProgramacionDiaria]
                    ) pd
                    INNER JOIN [recursos_humanos].[Areas] a ON a.[Id] = pd.[AreaId];

                    INSERT INTO [recursos_humanos].[GrupoProgramacionEmpleado] (
                        [Id], [GrupoProgramacionId], [EmpleadoId], [CreatedAt], [IsDeleted])
                    SELECT
                        NEWID(),
                        g.[Id],
                        pd.[EmpleadoId],
                        GETUTCDATE(),
                        0
                    FROM (
                        SELECT DISTINCT [AreaId], [EmpleadoId]
                        FROM [recursos_humanos].[ProgramacionDiaria]
                    ) pd
                    INNER JOIN [recursos_humanos].[GrupoProgramacion] g ON g.[AreaId] = pd.[AreaId];

                    INSERT INTO [recursos_humanos].[Programacion] (
                        [Id], [Nombre], [FechaInicio], [FechaFin], [GrupoProgramacionId], [Estado], [CreatedAt], [IsDeleted])
                    SELECT
                        NEWID(),
                        CONCAT('Programación ', FORMAT(r.[MinFecha], 'yyyy-MM'), ' - ', a.[Nombre]),
                        r.[MinFecha],
                        r.[MaxFecha],
                        g.[Id],
                        2,
                        GETUTCDATE(),
                        0
                    FROM (
                        SELECT
                            pd.[AreaId],
                            MIN(pd.[Fecha]) AS [MinFecha],
                            MAX(pd.[Fecha]) AS [MaxFecha]
                        FROM [recursos_humanos].[ProgramacionDiaria] pd
                        GROUP BY pd.[AreaId], YEAR(pd.[Fecha]), MONTH(pd.[Fecha])
                    ) r
                    INNER JOIN [recursos_humanos].[GrupoProgramacion] g ON g.[AreaId] = r.[AreaId]
                    INNER JOIN [recursos_humanos].[Areas] a ON a.[Id] = r.[AreaId];

                    UPDATE pd
                    SET
                        pd.[ProgramacionId] = p.[Id],
                        pd.[TipoAsignacion] = 1
                    FROM [recursos_humanos].[ProgramacionDiaria] pd
                    INNER JOIN [recursos_humanos].[GrupoProgramacion] g ON g.[AreaId] = pd.[AreaId]
                    INNER JOIN [recursos_humanos].[Programacion] p ON p.[GrupoProgramacionId] = g.[Id]
                        AND pd.[Fecha] >= p.[FechaInicio]
                        AND pd.[Fecha] <= p.[FechaFin];
                END
                """);
        }
    }
}
