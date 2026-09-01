using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddConsumoInterno : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ConsumosInterno",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Numero = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    AlmacenId = table.Column<int>(type: "int", nullable: false),
                    AreaId = table.Column<int>(type: "int", nullable: false),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReferenciaTipo = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    ReferenciaId = table.Column<int>(type: "int", nullable: true),
                    Observacion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Estado = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    MovimientoInventarioId = table.Column<int>(type: "int", nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConsumosInterno", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConsumosInterno_Almacenes_AlmacenId",
                        column: x => x.AlmacenId,
                        principalTable: "Almacenes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ConsumosInterno_Areas_AreaId",
                        column: x => x.AreaId,
                        principalTable: "Areas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ConsumosInterno_MovimientosInventario_MovimientoInventarioId",
                        column: x => x.MovimientoInventarioId,
                        principalTable: "MovimientosInventario",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ConsumosInternoDetalles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ConsumoInternoId = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_ConsumosInternoDetalles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConsumosInternoDetalles_ConsumosInterno_ConsumoInternoId",
                        column: x => x.ConsumoInternoId,
                        principalTable: "ConsumosInterno",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ConsumosInternoDetalles_Lotes_LoteId",
                        column: x => x.LoteId,
                        principalTable: "Lotes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ConsumosInternoDetalles_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ConsumosInterno_AlmacenId",
                table: "ConsumosInterno",
                column: "AlmacenId");

            migrationBuilder.CreateIndex(
                name: "IX_ConsumosInterno_AreaId",
                table: "ConsumosInterno",
                column: "AreaId");

            migrationBuilder.CreateIndex(
                name: "IX_ConsumosInterno_MovimientoInventarioId",
                table: "ConsumosInterno",
                column: "MovimientoInventarioId");

            migrationBuilder.CreateIndex(
                name: "IX_ConsumosInterno_Numero",
                table: "ConsumosInterno",
                column: "Numero",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ConsumosInternoDetalles_ConsumoInternoId",
                table: "ConsumosInternoDetalles",
                column: "ConsumoInternoId");

            migrationBuilder.CreateIndex(
                name: "IX_ConsumosInternoDetalles_LoteId",
                table: "ConsumosInternoDetalles",
                column: "LoteId");

            migrationBuilder.CreateIndex(
                name: "IX_ConsumosInternoDetalles_ProductoId",
                table: "ConsumosInternoDetalles",
                column: "ProductoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ConsumosInternoDetalles");

            migrationBuilder.DropTable(
                name: "ConsumosInterno");
        }
    }
}
