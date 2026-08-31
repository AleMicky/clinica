using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoriaProducto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CategoriasProducto",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Codigo = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    CategoriaPadreId = table.Column<int>(type: "int", nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ModificadoPor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CategoriasProducto", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CategoriasProducto_CategoriasProducto_CategoriaPadreId",
                        column: x => x.CategoriaPadreId,
                        principalTable: "CategoriasProducto",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CategoriasProducto_CategoriaPadreId",
                table: "CategoriasProducto",
                column: "CategoriaPadreId");

            migrationBuilder.CreateIndex(
                name: "IX_CategoriasProducto_Codigo",
                table: "CategoriasProducto",
                column: "Codigo",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CategoriasProducto");
        }
    }
}
