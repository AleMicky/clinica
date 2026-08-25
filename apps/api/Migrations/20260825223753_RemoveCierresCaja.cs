using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveCierresCaja : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CierresCaja");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CierresCaja",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ArqueoCajaId = table.Column<int>(type: "int", nullable: false),
                    TurnoCajaId = table.Column<int>(type: "int", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Diferencia = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaHora = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    MontoApertura = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Observacion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TotalCobros = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalContado = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalEgresos = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalEsperado = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalIngresos = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CierresCaja", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CierresCaja_ArqueosCaja_ArqueoCajaId",
                        column: x => x.ArqueoCajaId,
                        principalTable: "ArqueosCaja",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CierresCaja_TurnosCaja_TurnoCajaId",
                        column: x => x.TurnoCajaId,
                        principalTable: "TurnosCaja",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CierresCaja_ArqueoCajaId",
                table: "CierresCaja",
                column: "ArqueoCajaId");

            migrationBuilder.CreateIndex(
                name: "IX_CierresCaja_TurnoCajaId",
                table: "CierresCaja",
                column: "TurnoCajaId",
                unique: true);
        }
    }
}
