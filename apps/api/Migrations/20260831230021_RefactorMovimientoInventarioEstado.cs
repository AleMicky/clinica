using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class RefactorMovimientoInventarioEstado : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CostoTotal",
                table: "MovimientosInventarioDetalles");

            migrationBuilder.AddColumn<int>(
                name: "Estado",
                table: "MovimientosInventario",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaAnulacion",
                table: "MovimientosInventario",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaConfirmacion",
                table: "MovimientosInventario",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MotivoAnulacion",
                table: "MovimientosInventario",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Estado",
                table: "MovimientosInventario");

            migrationBuilder.DropColumn(
                name: "FechaAnulacion",
                table: "MovimientosInventario");

            migrationBuilder.DropColumn(
                name: "FechaConfirmacion",
                table: "MovimientosInventario");

            migrationBuilder.DropColumn(
                name: "MotivoAnulacion",
                table: "MovimientosInventario");

            migrationBuilder.AddColumn<decimal>(
                name: "CostoTotal",
                table: "MovimientosInventarioDetalles",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);
        }
    }
}
