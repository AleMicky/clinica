using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMedicoServicioAcuerdoConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_MedicosServiciosAcuerdos_MedicoId_ServicioId",
                table: "MedicosServiciosAcuerdos");

            migrationBuilder.DropColumn(
                name: "PorcentajeMedico",
                table: "MedicosServiciosAcuerdos");

            migrationBuilder.AddColumn<decimal>(
                name: "ImporteClinica",
                table: "MedicosServiciosAcuerdos",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_MedicosServiciosAcuerdos_MedicoId_ServicioId",
                table: "MedicosServiciosAcuerdos",
                columns: new[] { "MedicoId", "ServicioId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_MedicosServiciosAcuerdos_MedicoId_ServicioId",
                table: "MedicosServiciosAcuerdos");

            migrationBuilder.DropColumn(
                name: "ImporteClinica",
                table: "MedicosServiciosAcuerdos");

            migrationBuilder.AddColumn<decimal>(
                name: "PorcentajeMedico",
                table: "MedicosServiciosAcuerdos",
                type: "decimal(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_MedicosServiciosAcuerdos_MedicoId_ServicioId",
                table: "MedicosServiciosAcuerdos",
                columns: new[] { "MedicoId", "ServicioId" },
                unique: true);
        }
    }
}
