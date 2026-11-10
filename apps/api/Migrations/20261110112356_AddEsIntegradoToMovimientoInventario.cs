using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEsIntegradoToMovimientoInventario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EsIntegrado",
                table: "MovimientosInventario",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.Sql(@"
                UPDATE MovimientosInventario
                SET EsIntegrado = 1
                WHERE UPPER(LTRIM(RTRIM(ISNULL(ReferenciaTipo, '')))) IN (
                    'DEVOLUCION_PROVEEDOR',
                    'RECEPCION_COMPRA',
                    'CONSUMO_INTERNO',
                    'TRANSFERENCIA_ALMACEN',
                    'BAJA_INVENTARIO',
                    'AJUSTE_INVENTARIO',
                    'DISPENSACION',
                    'INVENTARIO_FISICO',
                    'INVENTARIOFISICO',
                    'INTEGRACION',
                    'CIRUGIA',
                    'QUIROFANO'
                );");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EsIntegrado",
                table: "MovimientosInventario");
        }
    }
}
