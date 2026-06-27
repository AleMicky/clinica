using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.Personas.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialPersonas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Personas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombres = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ApellidoPaterno = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ApellidoMaterno = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FechaNacimiento = table.Column<DateOnly>(type: "date", nullable: false),
                    Telefono = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Direccion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    TipoDocumentoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NumeroDocumento = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ExtensionDocumentoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ComplementoDocumento = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    SexoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EstadoCivilId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Personas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Personas_CatalogoItems_EstadoCivilId",
                        column: x => x.EstadoCivilId,
                        principalTable: "CatalogoItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Personas_CatalogoItems_ExtensionDocumentoId",
                        column: x => x.ExtensionDocumentoId,
                        principalTable: "CatalogoItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Personas_CatalogoItems_SexoId",
                        column: x => x.SexoId,
                        principalTable: "CatalogoItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Personas_CatalogoItems_TipoDocumentoId",
                        column: x => x.TipoDocumentoId,
                        principalTable: "CatalogoItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ContactosEmergencia",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PersonaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nombres = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Apellidos = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ParentescoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Telefono = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Celular = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Direccion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactosEmergencia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ContactosEmergencia_CatalogoItems_ParentescoId",
                        column: x => x.ParentescoId,
                        principalTable: "CatalogoItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ContactosEmergencia_Personas_PersonaId",
                        column: x => x.PersonaId,
                        principalTable: "Personas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Empleados",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PersonaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CodigoEmpleado = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    FechaIngreso = table.Column<DateOnly>(type: "date", nullable: true),
                    AreaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DepartamentoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ServicioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProfesionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CargoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Empleados", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Empleados_Areas_AreaId",
                        column: x => x.AreaId,
                        principalTable: "Areas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Empleados_Cargos_CargoId",
                        column: x => x.CargoId,
                        principalTable: "Cargos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Empleados_Departamentos_DepartamentoId",
                        column: x => x.DepartamentoId,
                        principalTable: "Departamentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Empleados_Personas_PersonaId",
                        column: x => x.PersonaId,
                        principalTable: "Personas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Empleados_Profesiones_ProfesionId",
                        column: x => x.ProfesionId,
                        principalTable: "Profesiones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Empleados_Servicios_ServicioId",
                        column: x => x.ServicioId,
                        principalTable: "Servicios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Pacientes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PersonaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NumeroHistoriaClinica = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    GrupoSanguineoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Alergias = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Observaciones = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    FechaRegistro = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pacientes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Pacientes_CatalogoItems_GrupoSanguineoId",
                        column: x => x.GrupoSanguineoId,
                        principalTable: "CatalogoItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Pacientes_Personas_PersonaId",
                        column: x => x.PersonaId,
                        principalTable: "Personas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Medicos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmpleadoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EspecialidadId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MatriculaProfesional = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RegistroColegioMedico = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Medicos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Medicos_Empleados_EmpleadoId",
                        column: x => x.EmpleadoId,
                        principalTable: "Empleados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Medicos_Especialidades_EspecialidadId",
                        column: x => x.EspecialidadId,
                        principalTable: "Especialidades",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ContactosEmergencia_ParentescoId",
                table: "ContactosEmergencia",
                column: "ParentescoId");

            migrationBuilder.CreateIndex(
                name: "IX_ContactosEmergencia_PersonaId",
                table: "ContactosEmergencia",
                column: "PersonaId");

            migrationBuilder.CreateIndex(
                name: "IX_Empleados_AreaId",
                table: "Empleados",
                column: "AreaId");

            migrationBuilder.CreateIndex(
                name: "IX_Empleados_CargoId",
                table: "Empleados",
                column: "CargoId");

            migrationBuilder.CreateIndex(
                name: "IX_Empleados_CodigoEmpleado",
                table: "Empleados",
                column: "CodigoEmpleado",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Empleados_DepartamentoId",
                table: "Empleados",
                column: "DepartamentoId");

            migrationBuilder.CreateIndex(
                name: "IX_Empleados_PersonaId",
                table: "Empleados",
                column: "PersonaId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Empleados_ProfesionId",
                table: "Empleados",
                column: "ProfesionId");

            migrationBuilder.CreateIndex(
                name: "IX_Empleados_ServicioId",
                table: "Empleados",
                column: "ServicioId");

            migrationBuilder.CreateIndex(
                name: "IX_Medicos_EmpleadoId",
                table: "Medicos",
                column: "EmpleadoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Medicos_EspecialidadId",
                table: "Medicos",
                column: "EspecialidadId");

            migrationBuilder.CreateIndex(
                name: "IX_Medicos_MatriculaProfesional",
                table: "Medicos",
                column: "MatriculaProfesional",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Pacientes_GrupoSanguineoId",
                table: "Pacientes",
                column: "GrupoSanguineoId");

            migrationBuilder.CreateIndex(
                name: "IX_Pacientes_NumeroHistoriaClinica",
                table: "Pacientes",
                column: "NumeroHistoriaClinica",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Pacientes_PersonaId",
                table: "Pacientes",
                column: "PersonaId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Personas_EstadoCivilId",
                table: "Personas",
                column: "EstadoCivilId");

            migrationBuilder.CreateIndex(
                name: "IX_Personas_ExtensionDocumentoId",
                table: "Personas",
                column: "ExtensionDocumentoId");

            migrationBuilder.CreateIndex(
                name: "IX_Personas_SexoId",
                table: "Personas",
                column: "SexoId");

            migrationBuilder.CreateIndex(
                name: "IX_Personas_TipoDocumentoId_NumeroDocumento",
                table: "Personas",
                columns: new[] { "TipoDocumentoId", "NumeroDocumento" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContactosEmergencia");

            migrationBuilder.DropTable(
                name: "Medicos");

            migrationBuilder.DropTable(
                name: "Pacientes");

            migrationBuilder.DropTable(
                name: "Empleados");

            migrationBuilder.DropTable(
                name: "Personas");
        }
    }
}
