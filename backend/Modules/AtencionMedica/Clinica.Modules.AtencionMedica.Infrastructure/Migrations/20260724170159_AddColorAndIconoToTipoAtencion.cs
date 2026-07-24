using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.AtencionMedica.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddColorAndIconoToTipoAtencion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Color",
                table: "TiposAtencion",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "#1677ff");

            migrationBuilder.AddColumn<string>(
                name: "Icono",
                table: "TiposAtencion",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Color",
                table: "TiposAtencion");

            migrationBuilder.DropColumn(
                name: "Icono",
                table: "TiposAtencion");
        }
    }
}
