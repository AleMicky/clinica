using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class AlterAuditColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreadoPorId",
                table: "CatalogosItems");

            migrationBuilder.DropColumn(
                name: "ModificadoPorId",
                table: "CatalogosItems");

            migrationBuilder.DropColumn(
                name: "CreadoPorId",
                table: "CatalogoGrupo");

            migrationBuilder.DropColumn(
                name: "ModificadoPorId",
                table: "CatalogoGrupo");

            migrationBuilder.AddColumn<string>(
                name: "CreadoPor",
                table: "CatalogosItems",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModificadoPor",
                table: "CatalogosItems",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreadoPor",
                table: "CatalogoGrupo",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ModificadoPor",
                table: "CatalogoGrupo",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreadoPor",
                table: "CatalogosItems");

            migrationBuilder.DropColumn(
                name: "ModificadoPor",
                table: "CatalogosItems");

            migrationBuilder.DropColumn(
                name: "CreadoPor",
                table: "CatalogoGrupo");

            migrationBuilder.DropColumn(
                name: "ModificadoPor",
                table: "CatalogoGrupo");

            migrationBuilder.AddColumn<int>(
                name: "CreadoPorId",
                table: "CatalogosItems",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ModificadoPorId",
                table: "CatalogosItems",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CreadoPorId",
                table: "CatalogoGrupo",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ModificadoPorId",
                table: "CatalogoGrupo",
                type: "int",
                nullable: true);
        }
    }
}
