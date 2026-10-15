using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveLotes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AjustesInventarioDetalles_Lotes_LoteId",
                table: "AjustesInventarioDetalles");

            migrationBuilder.DropForeignKey(
                name: "FK_BajasInventarioDetalles_Lotes_LoteId",
                table: "BajasInventarioDetalles");

            migrationBuilder.DropForeignKey(
                name: "FK_ConsumosInternoDetalles_Lotes_LoteId",
                table: "ConsumosInternoDetalles");

            migrationBuilder.DropForeignKey(
                name: "FK_DevolucionesProveedorDetalles_Lotes_LoteId",
                table: "DevolucionesProveedorDetalles");

            migrationBuilder.DropForeignKey(
                name: "FK_Existencias_Lotes_LoteId",
                table: "Existencias");

            migrationBuilder.DropForeignKey(
                name: "FK_InventariosFisicosDetalles_Lotes_LoteId",
                table: "InventariosFisicosDetalles");

            migrationBuilder.DropForeignKey(
                name: "FK_MovimientosInventarioDetalles_Lotes_LoteId",
                table: "MovimientosInventarioDetalles");

            migrationBuilder.DropForeignKey(
                name: "FK_RecepcionesCompraDetalles_Lotes_LoteId",
                table: "RecepcionesCompraDetalles");

            migrationBuilder.DropForeignKey(
                name: "FK_ReservasStockDetalles_Lotes_LoteId",
                table: "ReservasStockDetalles");

            migrationBuilder.DropForeignKey(
                name: "FK_TransferenciasAlmacenDetalles_Lotes_LoteId",
                table: "TransferenciasAlmacenDetalles");

            migrationBuilder.DropTable(
                name: "Lotes");

            migrationBuilder.DropIndex(
                name: "IX_TransferenciasAlmacenDetalles_LoteId",
                table: "TransferenciasAlmacenDetalles");

            migrationBuilder.DropIndex(
                name: "IX_ReservasStockDetalles_LoteId",
                table: "ReservasStockDetalles");

            migrationBuilder.DropIndex(
                name: "IX_RecepcionesCompraDetalles_LoteId",
                table: "RecepcionesCompraDetalles");

            migrationBuilder.DropIndex(
                name: "IX_MovimientosInventarioDetalles_LoteId",
                table: "MovimientosInventarioDetalles");

            migrationBuilder.DropIndex(
                name: "IX_InventariosFisicosDetalles_LoteId",
                table: "InventariosFisicosDetalles");

            migrationBuilder.DropIndex(
                name: "IX_Existencias_AlmacenId_ProductoId_LoteId",
                table: "Existencias");

            migrationBuilder.DropIndex(
                name: "IX_Existencias_LoteId",
                table: "Existencias");

            migrationBuilder.DropIndex(
                name: "IX_DevolucionesProveedorDetalles_LoteId",
                table: "DevolucionesProveedorDetalles");

            migrationBuilder.DropIndex(
                name: "IX_ConsumosInternoDetalles_LoteId",
                table: "ConsumosInternoDetalles");

            migrationBuilder.DropIndex(
                name: "IX_BajasInventarioDetalles_LoteId",
                table: "BajasInventarioDetalles");

            migrationBuilder.DropIndex(
                name: "IX_AjustesInventarioDetalles_LoteId",
                table: "AjustesInventarioDetalles");

            migrationBuilder.DropColumn(
                name: "LoteId",
                table: "TransferenciasAlmacenDetalles");

            migrationBuilder.DropColumn(
                name: "LoteId",
                table: "ReservasStockDetalles");

            migrationBuilder.DropColumn(
                name: "LoteId",
                table: "RecepcionesCompraDetalles");

            migrationBuilder.DropColumn(
                name: "ControlaLote",
                table: "Productos");

            migrationBuilder.DropColumn(
                name: "LoteId",
                table: "MovimientosInventarioDetalles");

            migrationBuilder.DropColumn(
                name: "LoteId",
                table: "InventariosFisicosDetalles");

            migrationBuilder.DropColumn(
                name: "LoteId",
                table: "Existencias");

            migrationBuilder.DropColumn(
                name: "LoteId",
                table: "DevolucionesProveedorDetalles");

            migrationBuilder.DropColumn(
                name: "LoteId",
                table: "ConsumosInternoDetalles");

            migrationBuilder.DropColumn(
                name: "LoteId",
                table: "BajasInventarioDetalles");

            migrationBuilder.DropColumn(
                name: "LoteId",
                table: "AjustesInventarioDetalles");

            migrationBuilder.AddColumn<decimal>(
                name: "PrecioVenta",
                table: "Productos",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_Existencias_AlmacenId_ProductoId",
                table: "Existencias",
                columns: new[] { "AlmacenId", "ProductoId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Existencias_AlmacenId_ProductoId",
                table: "Existencias");

            migrationBuilder.DropColumn(
                name: "PrecioVenta",
                table: "Productos");

            migrationBuilder.AddColumn<int>(
                name: "LoteId",
                table: "TransferenciasAlmacenDetalles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LoteId",
                table: "ReservasStockDetalles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LoteId",
                table: "RecepcionesCompraDetalles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ControlaLote",
                table: "Productos",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "LoteId",
                table: "MovimientosInventarioDetalles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LoteId",
                table: "InventariosFisicosDetalles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LoteId",
                table: "Existencias",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LoteId",
                table: "DevolucionesProveedorDetalles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LoteId",
                table: "ConsumosInternoDetalles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LoteId",
                table: "BajasInventarioDetalles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LoteId",
                table: "AjustesInventarioDetalles",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Lotes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductoId = table.Column<int>(type: "int", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CostoUnitario = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    CreadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaFabricacion = table.Column<DateOnly>(type: "date", nullable: true),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaVencimiento = table.Column<DateOnly>(type: "date", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    NumeroLote = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Lotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Lotes_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TransferenciasAlmacenDetalles_LoteId",
                table: "TransferenciasAlmacenDetalles",
                column: "LoteId");

            migrationBuilder.CreateIndex(
                name: "IX_ReservasStockDetalles_LoteId",
                table: "ReservasStockDetalles",
                column: "LoteId");

            migrationBuilder.CreateIndex(
                name: "IX_RecepcionesCompraDetalles_LoteId",
                table: "RecepcionesCompraDetalles",
                column: "LoteId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosInventarioDetalles_LoteId",
                table: "MovimientosInventarioDetalles",
                column: "LoteId");

            migrationBuilder.CreateIndex(
                name: "IX_InventariosFisicosDetalles_LoteId",
                table: "InventariosFisicosDetalles",
                column: "LoteId");

            migrationBuilder.CreateIndex(
                name: "IX_Existencias_AlmacenId_ProductoId_LoteId",
                table: "Existencias",
                columns: new[] { "AlmacenId", "ProductoId", "LoteId" },
                unique: true,
                filter: "[LoteId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Existencias_LoteId",
                table: "Existencias",
                column: "LoteId");

            migrationBuilder.CreateIndex(
                name: "IX_DevolucionesProveedorDetalles_LoteId",
                table: "DevolucionesProveedorDetalles",
                column: "LoteId");

            migrationBuilder.CreateIndex(
                name: "IX_ConsumosInternoDetalles_LoteId",
                table: "ConsumosInternoDetalles",
                column: "LoteId");

            migrationBuilder.CreateIndex(
                name: "IX_BajasInventarioDetalles_LoteId",
                table: "BajasInventarioDetalles",
                column: "LoteId");

            migrationBuilder.CreateIndex(
                name: "IX_AjustesInventarioDetalles_LoteId",
                table: "AjustesInventarioDetalles",
                column: "LoteId");

            migrationBuilder.CreateIndex(
                name: "IX_Lotes_ProductoId_NumeroLote",
                table: "Lotes",
                columns: new[] { "ProductoId", "NumeroLote" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AjustesInventarioDetalles_Lotes_LoteId",
                table: "AjustesInventarioDetalles",
                column: "LoteId",
                principalTable: "Lotes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_BajasInventarioDetalles_Lotes_LoteId",
                table: "BajasInventarioDetalles",
                column: "LoteId",
                principalTable: "Lotes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ConsumosInternoDetalles_Lotes_LoteId",
                table: "ConsumosInternoDetalles",
                column: "LoteId",
                principalTable: "Lotes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DevolucionesProveedorDetalles_Lotes_LoteId",
                table: "DevolucionesProveedorDetalles",
                column: "LoteId",
                principalTable: "Lotes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Existencias_Lotes_LoteId",
                table: "Existencias",
                column: "LoteId",
                principalTable: "Lotes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_InventariosFisicosDetalles_Lotes_LoteId",
                table: "InventariosFisicosDetalles",
                column: "LoteId",
                principalTable: "Lotes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MovimientosInventarioDetalles_Lotes_LoteId",
                table: "MovimientosInventarioDetalles",
                column: "LoteId",
                principalTable: "Lotes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RecepcionesCompraDetalles_Lotes_LoteId",
                table: "RecepcionesCompraDetalles",
                column: "LoteId",
                principalTable: "Lotes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ReservasStockDetalles_Lotes_LoteId",
                table: "ReservasStockDetalles",
                column: "LoteId",
                principalTable: "Lotes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TransferenciasAlmacenDetalles_Lotes_LoteId",
                table: "TransferenciasAlmacenDetalles",
                column: "LoteId",
                principalTable: "Lotes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
