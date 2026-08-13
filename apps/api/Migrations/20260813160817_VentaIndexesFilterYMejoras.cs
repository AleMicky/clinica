using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class VentaIndexesFilterYMejoras : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Ventas_Numero",
                table: "Ventas");

            migrationBuilder.DropIndex(
                name: "IX_VentaDetalles_VentaId_ServicioId",
                table: "VentaDetalles");

            migrationBuilder.CreateIndex(
                name: "IX_Ventas_Numero",
                table: "Ventas",
                column: "Numero",
                unique: true,
                filter: "[Activo] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_VentaDetalles_VentaId_ServicioId",
                table: "VentaDetalles",
                columns: new[] { "VentaId", "ServicioId" },
                unique: true,
                filter: "[Activo] = 1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Ventas_Numero",
                table: "Ventas");

            migrationBuilder.DropIndex(
                name: "IX_VentaDetalles_VentaId_ServicioId",
                table: "VentaDetalles");

            migrationBuilder.CreateIndex(
                name: "IX_Ventas_Numero",
                table: "Ventas",
                column: "Numero",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VentaDetalles_VentaId_ServicioId",
                table: "VentaDetalles",
                columns: new[] { "VentaId", "ServicioId" },
                unique: true);
        }
    }
}
