using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.Caja.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMovimientoNumeroReferencia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NumeroReferencia",
                schema: "caja",
                table: "MovimientosCaja",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NumeroReferencia",
                schema: "caja",
                table: "MovimientosCaja");
        }
    }
}
