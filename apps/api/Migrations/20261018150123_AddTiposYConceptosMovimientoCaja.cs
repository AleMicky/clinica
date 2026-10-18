using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTiposYConceptosMovimientoCaja : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Concepto",
                table: "MovimientosCaja");

            migrationBuilder.RenameColumn(
                name: "Tipo",
                table: "MovimientosCaja",
                newName: "TipoMovimientoCajaId");

            migrationBuilder.RenameIndex(
                name: "IX_MovimientosCaja_TurnoCajaId_Tipo",
                table: "MovimientosCaja",
                newName: "IX_MovimientosCaja_TurnoCajaId_TipoMovimientoCajaId");

            migrationBuilder.AddColumn<int>(
                name: "ConceptoMovimientoCajaId",
                table: "MovimientosCaja",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "NaturalezaAplicada",
                table: "MovimientosCaja",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "TiposMovimientoCaja",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Naturaleza = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposMovimientoCaja", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ConceptosMovimientoCaja",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TipoMovimientoCajaId = table.Column<int>(type: "int", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConceptosMovimientoCaja", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConceptosMovimientoCaja_TiposMovimientoCaja_TipoMovimientoCajaId",
                        column: x => x.TipoMovimientoCajaId,
                        principalTable: "TiposMovimientoCaja",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosCaja_ConceptoMovimientoCajaId",
                table: "MovimientosCaja",
                column: "ConceptoMovimientoCajaId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosCaja_TipoMovimientoCajaId",
                table: "MovimientosCaja",
                column: "TipoMovimientoCajaId");

            migrationBuilder.CreateIndex(
                name: "IX_ConceptosMovimientoCaja_TipoMovimientoCajaId_Codigo",
                table: "ConceptosMovimientoCaja",
                columns: new[] { "TipoMovimientoCajaId", "Codigo" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TiposMovimientoCaja_Codigo",
                table: "TiposMovimientoCaja",
                column: "Codigo",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_MovimientosCaja_ConceptosMovimientoCaja_ConceptoMovimientoCajaId",
                table: "MovimientosCaja",
                column: "ConceptoMovimientoCajaId",
                principalTable: "ConceptosMovimientoCaja",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_MovimientosCaja_TiposMovimientoCaja_TipoMovimientoCajaId",
                table: "MovimientosCaja",
                column: "TipoMovimientoCajaId",
                principalTable: "TiposMovimientoCaja",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MovimientosCaja_ConceptosMovimientoCaja_ConceptoMovimientoCajaId",
                table: "MovimientosCaja");

            migrationBuilder.DropForeignKey(
                name: "FK_MovimientosCaja_TiposMovimientoCaja_TipoMovimientoCajaId",
                table: "MovimientosCaja");

            migrationBuilder.DropTable(
                name: "ConceptosMovimientoCaja");

            migrationBuilder.DropTable(
                name: "TiposMovimientoCaja");

            migrationBuilder.DropIndex(
                name: "IX_MovimientosCaja_ConceptoMovimientoCajaId",
                table: "MovimientosCaja");

            migrationBuilder.DropIndex(
                name: "IX_MovimientosCaja_TipoMovimientoCajaId",
                table: "MovimientosCaja");

            migrationBuilder.DropColumn(
                name: "ConceptoMovimientoCajaId",
                table: "MovimientosCaja");

            migrationBuilder.DropColumn(
                name: "NaturalezaAplicada",
                table: "MovimientosCaja");

            migrationBuilder.RenameColumn(
                name: "TipoMovimientoCajaId",
                table: "MovimientosCaja",
                newName: "Tipo");

            migrationBuilder.RenameIndex(
                name: "IX_MovimientosCaja_TurnoCajaId_TipoMovimientoCajaId",
                table: "MovimientosCaja",
                newName: "IX_MovimientosCaja_TurnoCajaId_Tipo");

            migrationBuilder.AddColumn<string>(
                name: "Concepto",
                table: "MovimientosCaja",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: false,
                defaultValue: "");
        }
    }
}
