using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMovimientoCajaConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MonedaId",
                table: "MovimientosCaja",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "MontoMonedaBase",
                table: "MovimientosCaja",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TipoCambio",
                table: "MovimientosCaja",
                type: "decimal(18,6)",
                precision: 18,
                scale: 6,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosCaja_MonedaId",
                table: "MovimientosCaja",
                column: "MonedaId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosCaja_TurnoCajaId_MonedaId",
                table: "MovimientosCaja",
                columns: new[] { "TurnoCajaId", "MonedaId" });

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosCaja_TurnoCajaId_Tipo",
                table: "MovimientosCaja",
                columns: new[] { "TurnoCajaId", "Tipo" });

            migrationBuilder.AddForeignKey(
                name: "FK_MovimientosCaja_Monedas_MonedaId",
                table: "MovimientosCaja",
                column: "MonedaId",
                principalTable: "Monedas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MovimientosCaja_Monedas_MonedaId",
                table: "MovimientosCaja");

            migrationBuilder.DropIndex(
                name: "IX_MovimientosCaja_MonedaId",
                table: "MovimientosCaja");

            migrationBuilder.DropIndex(
                name: "IX_MovimientosCaja_TurnoCajaId_MonedaId",
                table: "MovimientosCaja");

            migrationBuilder.DropIndex(
                name: "IX_MovimientosCaja_TurnoCajaId_Tipo",
                table: "MovimientosCaja");

            migrationBuilder.DropColumn(
                name: "MonedaId",
                table: "MovimientosCaja");

            migrationBuilder.DropColumn(
                name: "MontoMonedaBase",
                table: "MovimientosCaja");

            migrationBuilder.DropColumn(
                name: "TipoCambio",
                table: "MovimientosCaja");
        }
    }
}
