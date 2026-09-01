using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddInventarioFisico : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "InventariosFisicos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Numero = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    AlmacenId = table.Column<int>(type: "int", nullable: false),
                    FechaInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaCierre = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Estado = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    Observacion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MovimientoAjustePositivoId = table.Column<int>(type: "int", nullable: true),
                    MovimientoAjusteNegativoId = table.Column<int>(type: "int", nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventariosFisicos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventariosFisicos_Almacenes_AlmacenId",
                        column: x => x.AlmacenId,
                        principalTable: "Almacenes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InventariosFisicos_MovimientosInventario_MovimientoAjusteNegativoId",
                        column: x => x.MovimientoAjusteNegativoId,
                        principalTable: "MovimientosInventario",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InventariosFisicos_MovimientosInventario_MovimientoAjustePositivoId",
                        column: x => x.MovimientoAjustePositivoId,
                        principalTable: "MovimientosInventario",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InventariosFisicosDetalles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InventarioFisicoId = table.Column<int>(type: "int", nullable: false),
                    ProductoId = table.Column<int>(type: "int", nullable: false),
                    LoteId = table.Column<int>(type: "int", nullable: true),
                    CantidadSistema = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CantidadContada = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventariosFisicosDetalles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventariosFisicosDetalles_InventariosFisicos_InventarioFisicoId",
                        column: x => x.InventarioFisicoId,
                        principalTable: "InventariosFisicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InventariosFisicosDetalles_Lotes_LoteId",
                        column: x => x.LoteId,
                        principalTable: "Lotes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InventariosFisicosDetalles_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InventariosFisicos_AlmacenId",
                table: "InventariosFisicos",
                column: "AlmacenId");

            migrationBuilder.CreateIndex(
                name: "IX_InventariosFisicos_MovimientoAjusteNegativoId",
                table: "InventariosFisicos",
                column: "MovimientoAjusteNegativoId");

            migrationBuilder.CreateIndex(
                name: "IX_InventariosFisicos_MovimientoAjustePositivoId",
                table: "InventariosFisicos",
                column: "MovimientoAjustePositivoId");

            migrationBuilder.CreateIndex(
                name: "IX_InventariosFisicos_Numero",
                table: "InventariosFisicos",
                column: "Numero",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InventariosFisicosDetalles_InventarioFisicoId",
                table: "InventariosFisicosDetalles",
                column: "InventarioFisicoId");

            migrationBuilder.CreateIndex(
                name: "IX_InventariosFisicosDetalles_LoteId",
                table: "InventariosFisicosDetalles",
                column: "LoteId");

            migrationBuilder.CreateIndex(
                name: "IX_InventariosFisicosDetalles_ProductoId",
                table: "InventariosFisicosDetalles",
                column: "ProductoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InventariosFisicosDetalles");

            migrationBuilder.DropTable(
                name: "InventariosFisicos");
        }
    }
}
