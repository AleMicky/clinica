using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddFarmaciaDispensacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Farmacia_Dispensaciones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Numero = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Tipo = table.Column<int>(type: "int", nullable: false),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AlmacenId = table.Column<int>(type: "int", nullable: false),
                    PacienteId = table.Column<int>(type: "int", nullable: true),
                    ClienteNombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ClienteDocumento = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    MedicoId = table.Column<int>(type: "int", nullable: true),
                    AdmisionId = table.Column<int>(type: "int", nullable: true),
                    Subtotal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Descuento = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    FechaCobro = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UsuarioCobro = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    MetodoPago = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ComprobanteCobro = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FechaEntrega = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UsuarioEntrega = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    MovimientoInventarioId = table.Column<int>(type: "int", nullable: true),
                    MotivoAnulacion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreadoPor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Farmacia_Dispensaciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Farmacia_Dispensaciones_Admisiones_AdmisionId",
                        column: x => x.AdmisionId,
                        principalTable: "Admisiones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Farmacia_Dispensaciones_Almacenes_AlmacenId",
                        column: x => x.AlmacenId,
                        principalTable: "Almacenes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Farmacia_Dispensaciones_Medicos_MedicoId",
                        column: x => x.MedicoId,
                        principalTable: "Medicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Farmacia_Dispensaciones_MovimientosInventario_MovimientoInventarioId",
                        column: x => x.MovimientoInventarioId,
                        principalTable: "MovimientosInventario",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Farmacia_Dispensaciones_Pacientes_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "Pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Farmacia_DispensacionesDetalles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DispensacionId = table.Column<int>(type: "int", nullable: false),
                    ProductoId = table.Column<int>(type: "int", nullable: false),
                    PartidaInventarioId = table.Column<int>(type: "int", nullable: true),
                    Lote = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FechaVencimiento = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Cantidad = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    PrecioUnitario = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    Descuento = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Total = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Indicaciones = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreadoPor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Farmacia_DispensacionesDetalles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Farmacia_DispensacionesDetalles_Farmacia_Dispensaciones_DispensacionId",
                        column: x => x.DispensacionId,
                        principalTable: "Farmacia_Dispensaciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Farmacia_DispensacionesDetalles_PartidasInventario_PartidaInventarioId",
                        column: x => x.PartidaInventarioId,
                        principalTable: "PartidasInventario",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Farmacia_DispensacionesDetalles_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Farmacia_Dispensaciones_AdmisionId",
                table: "Farmacia_Dispensaciones",
                column: "AdmisionId");

            migrationBuilder.CreateIndex(
                name: "IX_Farmacia_Dispensaciones_AlmacenId",
                table: "Farmacia_Dispensaciones",
                column: "AlmacenId");

            migrationBuilder.CreateIndex(
                name: "IX_Farmacia_Dispensaciones_MedicoId",
                table: "Farmacia_Dispensaciones",
                column: "MedicoId");

            migrationBuilder.CreateIndex(
                name: "IX_Farmacia_Dispensaciones_MovimientoInventarioId",
                table: "Farmacia_Dispensaciones",
                column: "MovimientoInventarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Farmacia_Dispensaciones_Numero",
                table: "Farmacia_Dispensaciones",
                column: "Numero",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Farmacia_Dispensaciones_PacienteId",
                table: "Farmacia_Dispensaciones",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_Farmacia_DispensacionesDetalles_DispensacionId",
                table: "Farmacia_DispensacionesDetalles",
                column: "DispensacionId");

            migrationBuilder.CreateIndex(
                name: "IX_Farmacia_DispensacionesDetalles_PartidaInventarioId",
                table: "Farmacia_DispensacionesDetalles",
                column: "PartidaInventarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Farmacia_DispensacionesDetalles_ProductoId",
                table: "Farmacia_DispensacionesDetalles",
                column: "ProductoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Farmacia_DispensacionesDetalles");

            migrationBuilder.DropTable(
                name: "Farmacia_Dispensaciones");
        }
    }
}
