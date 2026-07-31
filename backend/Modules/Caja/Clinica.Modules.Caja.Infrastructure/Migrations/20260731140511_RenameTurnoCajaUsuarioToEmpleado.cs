using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.Caja.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameTurnoCajaUsuarioToEmpleado : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UsuarioCierreId",
                schema: "caja",
                table: "TurnosCaja",
                newName: "EmpleadoCierreId");

            migrationBuilder.RenameColumn(
                name: "UsuarioAperturaId",
                schema: "caja",
                table: "TurnosCaja",
                newName: "EmpleadoAperturaId");

            migrationBuilder.RenameIndex(
                name: "IX_TurnosCaja_UsuarioAperturaId_Estado",
                schema: "caja",
                table: "TurnosCaja",
                newName: "IX_TurnosCaja_EmpleadoAperturaId_Estado");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "EmpleadoCierreId",
                schema: "caja",
                table: "TurnosCaja",
                newName: "UsuarioCierreId");

            migrationBuilder.RenameColumn(
                name: "EmpleadoAperturaId",
                schema: "caja",
                table: "TurnosCaja",
                newName: "UsuarioAperturaId");

            migrationBuilder.RenameIndex(
                name: "IX_TurnosCaja_EmpleadoAperturaId_Estado",
                schema: "caja",
                table: "TurnosCaja",
                newName: "IX_TurnosCaja_UsuarioAperturaId_Estado");
        }
    }
}
