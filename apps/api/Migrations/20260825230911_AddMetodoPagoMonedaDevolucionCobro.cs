using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMetodoPagoMonedaDevolucionCobro : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MetodoPagoId",
                table: "DevolucionesCobro",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MonedaId",
                table: "DevolucionesCobro",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_DevolucionesCobro_MetodoPagoId",
                table: "DevolucionesCobro",
                column: "MetodoPagoId");

            migrationBuilder.CreateIndex(
                name: "IX_DevolucionesCobro_MonedaId",
                table: "DevolucionesCobro",
                column: "MonedaId");

            migrationBuilder.AddForeignKey(
                name: "FK_DevolucionesCobro_MetodosPago_MetodoPagoId",
                table: "DevolucionesCobro",
                column: "MetodoPagoId",
                principalTable: "MetodosPago",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DevolucionesCobro_Monedas_MonedaId",
                table: "DevolucionesCobro",
                column: "MonedaId",
                principalTable: "Monedas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DevolucionesCobro_MetodosPago_MetodoPagoId",
                table: "DevolucionesCobro");

            migrationBuilder.DropForeignKey(
                name: "FK_DevolucionesCobro_Monedas_MonedaId",
                table: "DevolucionesCobro");

            migrationBuilder.DropIndex(
                name: "IX_DevolucionesCobro_MetodoPagoId",
                table: "DevolucionesCobro");

            migrationBuilder.DropIndex(
                name: "IX_DevolucionesCobro_MonedaId",
                table: "DevolucionesCobro");

            migrationBuilder.DropColumn(
                name: "MetodoPagoId",
                table: "DevolucionesCobro");

            migrationBuilder.DropColumn(
                name: "MonedaId",
                table: "DevolucionesCobro");
        }
    }
}
