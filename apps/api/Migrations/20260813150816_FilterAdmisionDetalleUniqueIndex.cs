using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class FilterAdmisionDetalleUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AdmisionDetalles_AdmisionId_ServicioId",
                table: "AdmisionDetalles");

            migrationBuilder.CreateIndex(
                name: "IX_AdmisionDetalles_AdmisionId_ServicioId",
                table: "AdmisionDetalles",
                columns: new[] { "AdmisionId", "ServicioId" },
                unique: true,
                filter: "[Activo] = 1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AdmisionDetalles_AdmisionId_ServicioId",
                table: "AdmisionDetalles");

            migrationBuilder.CreateIndex(
                name: "IX_AdmisionDetalles_AdmisionId_ServicioId",
                table: "AdmisionDetalles",
                columns: new[] { "AdmisionId", "ServicioId" },
                unique: true);
        }
    }
}
