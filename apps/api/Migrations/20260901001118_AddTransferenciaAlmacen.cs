using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTransferenciaAlmacen : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TransferenciasAlmacen",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Numero = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    AlmacenOrigenId = table.Column<int>(type: "int", nullable: false),
                    AlmacenDestinoId = table.Column<int>(type: "int", nullable: false),
                    FechaSolicitud = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaAprobacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaDespacho = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaRecepcion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SolicitadoPorId = table.Column<int>(type: "int", nullable: true),
                    AprobadoPorId = table.Column<int>(type: "int", nullable: true),
                    DespachadoPorId = table.Column<int>(type: "int", nullable: true),
                    RecibidoPorId = table.Column<int>(type: "int", nullable: true),
                    Observacion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Estado = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransferenciasAlmacen", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransferenciasAlmacen_Almacenes_AlmacenDestinoId",
                        column: x => x.AlmacenDestinoId,
                        principalTable: "Almacenes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TransferenciasAlmacen_Almacenes_AlmacenOrigenId",
                        column: x => x.AlmacenOrigenId,
                        principalTable: "Almacenes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TransferenciasAlmacenDetalles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TransferenciaAlmacenId = table.Column<int>(type: "int", nullable: false),
                    ProductoId = table.Column<int>(type: "int", nullable: false),
                    LoteId = table.Column<int>(type: "int", nullable: true),
                    CantidadSolicitada = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CantidadAprobada = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CantidadDespachada = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CantidadRecibida = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransferenciasAlmacenDetalles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransferenciasAlmacenDetalles_Lotes_LoteId",
                        column: x => x.LoteId,
                        principalTable: "Lotes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TransferenciasAlmacenDetalles_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TransferenciasAlmacenDetalles_TransferenciasAlmacen_TransferenciaAlmacenId",
                        column: x => x.TransferenciaAlmacenId,
                        principalTable: "TransferenciasAlmacen",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TransferenciasAlmacen_AlmacenDestinoId",
                table: "TransferenciasAlmacen",
                column: "AlmacenDestinoId");

            migrationBuilder.CreateIndex(
                name: "IX_TransferenciasAlmacen_AlmacenOrigenId",
                table: "TransferenciasAlmacen",
                column: "AlmacenOrigenId");

            migrationBuilder.CreateIndex(
                name: "IX_TransferenciasAlmacen_Numero",
                table: "TransferenciasAlmacen",
                column: "Numero",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TransferenciasAlmacenDetalles_LoteId",
                table: "TransferenciasAlmacenDetalles",
                column: "LoteId");

            migrationBuilder.CreateIndex(
                name: "IX_TransferenciasAlmacenDetalles_ProductoId",
                table: "TransferenciasAlmacenDetalles",
                column: "ProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_TransferenciasAlmacenDetalles_TransferenciaAlmacenId",
                table: "TransferenciasAlmacenDetalles",
                column: "TransferenciaAlmacenId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TransferenciasAlmacenDetalles");

            migrationBuilder.DropTable(
                name: "TransferenciasAlmacen");
        }
    }
}
