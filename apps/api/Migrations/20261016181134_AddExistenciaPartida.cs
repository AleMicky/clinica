using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddExistenciaPartida : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExistenciasPartidas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExistenciaId = table.Column<int>(type: "int", nullable: false),
                    PartidaInventarioId = table.Column<int>(type: "int", nullable: false),
                    Cantidad = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CantidadReservada = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExistenciasPartidas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExistenciasPartidas_Existencias_ExistenciaId",
                        column: x => x.ExistenciaId,
                        principalTable: "Existencias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ExistenciasPartidas_PartidasInventario_PartidaInventarioId",
                        column: x => x.PartidaInventarioId,
                        principalTable: "PartidasInventario",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExistenciasPartidas_ExistenciaId_PartidaInventarioId",
                table: "ExistenciasPartidas",
                columns: new[] { "ExistenciaId", "PartidaInventarioId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExistenciasPartidas_PartidaInventarioId",
                table: "ExistenciasPartidas",
                column: "PartidaInventarioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExistenciasPartidas");
        }
    }
}
