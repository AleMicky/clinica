using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.Laboratorio.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPruebaPrecios : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PruebaPrecios",
                schema: "laboratorio",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PruebaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ImporteFacturado = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CostoLaboratorio = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CostoDerivacion = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    FechaInicio = table.Column<DateOnly>(type: "date", nullable: false),
                    FechaFin = table.Column<DateOnly>(type: "date", nullable: true),
                    MotivoCambio = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PruebaPrecios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PruebaPrecios_Pruebas_PruebaId",
                        column: x => x.PruebaId,
                        principalSchema: "laboratorio",
                        principalTable: "Pruebas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PruebaPrecios_PruebaId",
                schema: "laboratorio",
                table: "PruebaPrecios",
                column: "PruebaId");

            migrationBuilder.CreateIndex(
                name: "IX_PruebaPrecios_PruebaId_FechaInicio",
                schema: "laboratorio",
                table: "PruebaPrecios",
                columns: new[] { "PruebaId", "FechaInicio" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PruebaPrecios",
                schema: "laboratorio");
        }
    }
}
