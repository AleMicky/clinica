using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddQuirofanoModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Quirofano_Cirugias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Numero = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Tipo = table.Column<int>(type: "int", nullable: false),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    TipoAnestesia = table.Column<int>(type: "int", nullable: false),
                    AdmisionId = table.Column<int>(type: "int", nullable: true),
                    PacienteId = table.Column<int>(type: "int", nullable: false),
                    CirujanoPrincipalId = table.Column<int>(type: "int", nullable: false),
                    AnestesiologoId = table.Column<int>(type: "int", nullable: true),
                    PrimerAyudanteId = table.Column<int>(type: "int", nullable: true),
                    Instrumentista = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Circulante = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    SalaOperaciones = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ProcedimientoQuirurgico = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    DiagnosticoPreOperatorio = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    DiagnosticoPostOperatorio = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    FechaProgramada = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaInicio = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaFin = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AlmacenId = table.Column<int>(type: "int", nullable: false),
                    MovimientoInventarioId = table.Column<int>(type: "int", nullable: true),
                    Observaciones = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MotivoCancelacion = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreadoPor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Quirofano_Cirugias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Quirofano_Cirugias_Admisiones_AdmisionId",
                        column: x => x.AdmisionId,
                        principalTable: "Admisiones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Quirofano_Cirugias_Almacenes_AlmacenId",
                        column: x => x.AlmacenId,
                        principalTable: "Almacenes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Quirofano_Cirugias_Medicos_AnestesiologoId",
                        column: x => x.AnestesiologoId,
                        principalTable: "Medicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Quirofano_Cirugias_Medicos_CirujanoPrincipalId",
                        column: x => x.CirujanoPrincipalId,
                        principalTable: "Medicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Quirofano_Cirugias_Medicos_PrimerAyudanteId",
                        column: x => x.PrimerAyudanteId,
                        principalTable: "Medicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Quirofano_Cirugias_MovimientosInventario_MovimientoInventarioId",
                        column: x => x.MovimientoInventarioId,
                        principalTable: "MovimientosInventario",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Quirofano_Cirugias_Pacientes_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "Pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Quirofano_CirugiasGastosMateriales",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CirugiaId = table.Column<int>(type: "int", nullable: false),
                    ProductoId = table.Column<int>(type: "int", nullable: false),
                    PartidaInventarioId = table.Column<int>(type: "int", nullable: true),
                    Cantidad = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CostoUnitario = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    PrecioUnitario = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    MomentoQuirurgico = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Observaciones = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreadoPor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Quirofano_CirugiasGastosMateriales", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Quirofano_CirugiasGastosMateriales_PartidasInventario_PartidaInventarioId",
                        column: x => x.PartidaInventarioId,
                        principalTable: "PartidasInventario",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Quirofano_CirugiasGastosMateriales_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Quirofano_CirugiasGastosMateriales_Quirofano_Cirugias_CirugiaId",
                        column: x => x.CirugiaId,
                        principalTable: "Quirofano_Cirugias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Quirofano_Cirugias_AdmisionId",
                table: "Quirofano_Cirugias",
                column: "AdmisionId");

            migrationBuilder.CreateIndex(
                name: "IX_Quirofano_Cirugias_AlmacenId",
                table: "Quirofano_Cirugias",
                column: "AlmacenId");

            migrationBuilder.CreateIndex(
                name: "IX_Quirofano_Cirugias_AnestesiologoId",
                table: "Quirofano_Cirugias",
                column: "AnestesiologoId");

            migrationBuilder.CreateIndex(
                name: "IX_Quirofano_Cirugias_CirujanoPrincipalId",
                table: "Quirofano_Cirugias",
                column: "CirujanoPrincipalId");

            migrationBuilder.CreateIndex(
                name: "IX_Quirofano_Cirugias_MovimientoInventarioId",
                table: "Quirofano_Cirugias",
                column: "MovimientoInventarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Quirofano_Cirugias_Numero",
                table: "Quirofano_Cirugias",
                column: "Numero",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Quirofano_Cirugias_PacienteId",
                table: "Quirofano_Cirugias",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_Quirofano_Cirugias_PrimerAyudanteId",
                table: "Quirofano_Cirugias",
                column: "PrimerAyudanteId");

            migrationBuilder.CreateIndex(
                name: "IX_Quirofano_CirugiasGastosMateriales_CirugiaId",
                table: "Quirofano_CirugiasGastosMateriales",
                column: "CirugiaId");

            migrationBuilder.CreateIndex(
                name: "IX_Quirofano_CirugiasGastosMateriales_PartidaInventarioId",
                table: "Quirofano_CirugiasGastosMateriales",
                column: "PartidaInventarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Quirofano_CirugiasGastosMateriales_ProductoId",
                table: "Quirofano_CirugiasGastosMateriales",
                column: "ProductoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Quirofano_CirugiasGastosMateriales");

            migrationBuilder.DropTable(
                name: "Quirofano_Cirugias");
        }
    }
}
