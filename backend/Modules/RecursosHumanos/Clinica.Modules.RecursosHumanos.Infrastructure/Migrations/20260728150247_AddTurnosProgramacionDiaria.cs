using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTurnosProgramacionDiaria : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Turnos",
                schema: "recursos_humanos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    HoraInicio = table.Column<TimeOnly>(type: "time", nullable: false),
                    HoraFin = table.Column<TimeOnly>(type: "time", nullable: false),
                    CruceDia = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    PermiteMultiplesMedicosTurno = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Turnos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProgramacionDiaria",
                schema: "recursos_humanos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmpleadoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Fecha = table.Column<DateOnly>(type: "date", nullable: false),
                    TurnoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AreaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CargoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EspecialidadId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EsMedicoTurno = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    AceptaConsultas = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    AceptaSinCita = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    MaxPacientes = table.Column<int>(type: "int", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Observacion = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    PermiteMultiplesMedicosTurno = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProgramacionDiaria", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProgramacionDiaria_Areas_AreaId",
                        column: x => x.AreaId,
                        principalSchema: "recursos_humanos",
                        principalTable: "Areas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProgramacionDiaria_Cargos_CargoId",
                        column: x => x.CargoId,
                        principalSchema: "recursos_humanos",
                        principalTable: "Cargos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProgramacionDiaria_Empleados_EmpleadoId",
                        column: x => x.EmpleadoId,
                        principalSchema: "recursos_humanos",
                        principalTable: "Empleados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProgramacionDiaria_Especialidades_EspecialidadId",
                        column: x => x.EspecialidadId,
                        principalSchema: "recursos_humanos",
                        principalTable: "Especialidades",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProgramacionDiaria_Turnos_TurnoId",
                        column: x => x.TurnoId,
                        principalSchema: "recursos_humanos",
                        principalTable: "Turnos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

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
                name: "IX_ProgramacionDiaria_EmpleadoId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                column: "EmpleadoId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgramacionDiaria_EspecialidadId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                column: "EspecialidadId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgramacionDiaria_Fecha",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                column: "Fecha");

            migrationBuilder.CreateIndex(
                name: "IX_ProgramacionDiaria_Fecha_AreaId_EsMedicoTurno",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                columns: new[] { "Fecha", "AreaId", "EsMedicoTurno" });

            migrationBuilder.CreateIndex(
                name: "IX_ProgramacionDiaria_Fecha_EmpleadoId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                columns: new[] { "Fecha", "EmpleadoId" });

            migrationBuilder.CreateIndex(
                name: "IX_ProgramacionDiaria_TurnoId",
                schema: "recursos_humanos",
                table: "ProgramacionDiaria",
                column: "TurnoId");

            migrationBuilder.CreateIndex(
                name: "IX_Turnos_Activo",
                schema: "recursos_humanos",
                table: "Turnos",
                column: "Activo");

            migrationBuilder.CreateIndex(
                name: "IX_Turnos_Codigo",
                schema: "recursos_humanos",
                table: "Turnos",
                column: "Codigo",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProgramacionDiaria",
                schema: "recursos_humanos");

            migrationBuilder.DropTable(
                name: "Turnos",
                schema: "recursos_humanos");
        }
    }
}
