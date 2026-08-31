using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMovimientoInventario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MovimientosInventario",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Numero = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TipoMovimientoInventarioId = table.Column<int>(type: "int", nullable: false),
                    AlmacenId = table.Column<int>(type: "int", nullable: false),
                    FechaMovimiento = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReferenciaTipo = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    ReferenciaId = table.Column<int>(type: "int", nullable: true),
                    Observacion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovimientosInventario", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MovimientosInventario_Almacenes_AlmacenId",
                        column: x => x.AlmacenId,
                        principalTable: "Almacenes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MovimientosInventario_TiposMovimientoInventario_TipoMovimientoInventarioId",
                        column: x => x.TipoMovimientoInventarioId,
                        principalTable: "TiposMovimientoInventario",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MovimientosInventarioDetalles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MovimientoInventarioId = table.Column<int>(type: "int", nullable: false),
                    ProductoId = table.Column<int>(type: "int", nullable: false),
                    LoteId = table.Column<int>(type: "int", nullable: true),
                    Cantidad = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CostoUnitario = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    CostoTotal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovimientosInventarioDetalles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MovimientosInventarioDetalles_Lotes_LoteId",
                        column: x => x.LoteId,
                        principalTable: "Lotes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MovimientosInventarioDetalles_MovimientosInventario_MovimientoInventarioId",
                        column: x => x.MovimientoInventarioId,
                        principalTable: "MovimientosInventario",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MovimientosInventarioDetalles_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosInventario_AlmacenId",
                table: "MovimientosInventario",
                column: "AlmacenId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosInventario_Numero",
                table: "MovimientosInventario",
                column: "Numero",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosInventario_TipoMovimientoInventarioId",
                table: "MovimientosInventario",
                column: "TipoMovimientoInventarioId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosInventarioDetalles_LoteId",
                table: "MovimientosInventarioDetalles",
                column: "LoteId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosInventarioDetalles_MovimientoInventarioId",
                table: "MovimientosInventarioDetalles",
                column: "MovimientoInventarioId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosInventarioDetalles_ProductoId",
                table: "MovimientosInventarioDetalles",
                column: "ProductoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MovimientosInventarioDetalles");

            migrationBuilder.DropTable(
                name: "MovimientosInventario");
        }
    }
}
