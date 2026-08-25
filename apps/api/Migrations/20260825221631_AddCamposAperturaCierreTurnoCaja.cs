using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCamposAperturaCierreTurnoCaja : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "MontoInicial",
                table: "TurnosCaja",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "ObservacionApertura",
                table: "TurnosCaja",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ObservacionCierre",
                table: "TurnosCaja",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MontoInicial",
                table: "TurnosCaja");

            migrationBuilder.DropColumn(
                name: "ObservacionApertura",
                table: "TurnosCaja");

            migrationBuilder.DropColumn(
                name: "ObservacionCierre",
                table: "TurnosCaja");
        }
    }
}
