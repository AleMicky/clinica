using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.Caja.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveMetodoPagoActivo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Activo",
                schema: "caja",
                table: "MetodosPago");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Activo",
                schema: "caja",
                table: "MetodosPago",
                type: "bit",
                nullable: false,
                defaultValue: true);
        }
    }
}
