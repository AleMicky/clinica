using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAjusteInventarioYReservaStock : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AjustesInventario",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Numero = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    AlmacenId = table.Column<int>(type: "int", nullable: false),
                    Tipo = table.Column<int>(type: "int", nullable: false),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Motivo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Observacion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Estado = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    MovimientoInventarioId = table.Column<int>(type: "int", nullable: true),
                    FechaConfirmacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaAnulacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MotivoAnulacion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AjustesInventario", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AjustesInventario_Almacenes_AlmacenId",
                        column: x => x.AlmacenId,
                        principalTable: "Almacenes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AjustesInventario_MovimientosInventario_MovimientoInventarioId",
                        column: x => x.MovimientoInventarioId,
                        principalTable: "MovimientosInventario",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ReservasStock",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Numero = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    AlmacenId = table.Column<int>(type: "int", nullable: false),
                    ReferenciaTipo = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ReferenciaId = table.Column<int>(type: "int", nullable: true),
                    FechaReserva = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaLiberacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaConsumo = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Estado = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    Observacion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReservasStock", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReservasStock_Almacenes_AlmacenId",
                        column: x => x.AlmacenId,
                        principalTable: "Almacenes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AjustesInventarioDetalles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AjusteInventarioId = table.Column<int>(type: "int", nullable: false),
                    ProductoId = table.Column<int>(type: "int", nullable: false),
                    LoteId = table.Column<int>(type: "int", nullable: true),
                    Cantidad = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AjustesInventarioDetalles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AjustesInventarioDetalles_AjustesInventario_AjusteInventarioId",
                        column: x => x.AjusteInventarioId,
                        principalTable: "AjustesInventario",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AjustesInventarioDetalles_Lotes_LoteId",
                        column: x => x.LoteId,
                        principalTable: "Lotes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AjustesInventarioDetalles_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ReservasStockDetalles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReservaStockId = table.Column<int>(type: "int", nullable: false),
                    ProductoId = table.Column<int>(type: "int", nullable: false),
                    LoteId = table.Column<int>(type: "int", nullable: true),
                    CantidadReservada = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CantidadConsumida = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false, defaultValue: 0m),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReservasStockDetalles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReservasStockDetalles_Lotes_LoteId",
                        column: x => x.LoteId,
                        principalTable: "Lotes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ReservasStockDetalles_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ReservasStockDetalles_ReservasStock_ReservaStockId",
                        column: x => x.ReservaStockId,
                        principalTable: "ReservasStock",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AjustesInventario_AlmacenId",
                table: "AjustesInventario",
                column: "AlmacenId");

            migrationBuilder.CreateIndex(
                name: "IX_AjustesInventario_MovimientoInventarioId",
                table: "AjustesInventario",
                column: "MovimientoInventarioId");

            migrationBuilder.CreateIndex(
                name: "IX_AjustesInventario_Numero",
                table: "AjustesInventario",
                column: "Numero",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AjustesInventarioDetalles_AjusteInventarioId",
                table: "AjustesInventarioDetalles",
                column: "AjusteInventarioId");

            migrationBuilder.CreateIndex(
                name: "IX_AjustesInventarioDetalles_LoteId",
                table: "AjustesInventarioDetalles",
                column: "LoteId");

            migrationBuilder.CreateIndex(
                name: "IX_AjustesInventarioDetalles_ProductoId",
                table: "AjustesInventarioDetalles",
                column: "ProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_ReservasStock_AlmacenId",
                table: "ReservasStock",
                column: "AlmacenId");

            migrationBuilder.CreateIndex(
                name: "IX_ReservasStock_Numero",
                table: "ReservasStock",
                column: "Numero",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReservasStockDetalles_LoteId",
                table: "ReservasStockDetalles",
                column: "LoteId");

            migrationBuilder.CreateIndex(
                name: "IX_ReservasStockDetalles_ProductoId",
                table: "ReservasStockDetalles",
                column: "ProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_ReservasStockDetalles_ReservaStockId",
                table: "ReservasStockDetalles",
                column: "ReservaStockId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AjustesInventarioDetalles");

            migrationBuilder.DropTable(
                name: "ReservasStockDetalles");

            migrationBuilder.DropTable(
                name: "AjustesInventario");

            migrationBuilder.DropTable(
                name: "ReservasStock");
        }
    }
}
