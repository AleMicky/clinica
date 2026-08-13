using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class RenameCategoriasTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Servicios_Categorias_CategoriaServicioId",
                table: "Servicios");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Categorias",
                table: "Categorias");

            migrationBuilder.RenameTable(
                name: "Categorias",
                newName: "CategoriasServicio");

            migrationBuilder.RenameIndex(
                name: "IX_Categorias_Codigo",
                table: "CategoriasServicio",
                newName: "IX_CategoriasServicio_Codigo");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CategoriasServicio",
                table: "CategoriasServicio",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Servicios_CategoriasServicio_CategoriaServicioId",
                table: "Servicios",
                column: "CategoriaServicioId",
                principalTable: "CategoriasServicio",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Servicios_CategoriasServicio_CategoriaServicioId",
                table: "Servicios");

            migrationBuilder.DropPrimaryKey(
                name: "PK_CategoriasServicio",
                table: "CategoriasServicio");

            migrationBuilder.RenameTable(
                name: "CategoriasServicio",
                newName: "Categorias");

            migrationBuilder.RenameIndex(
                name: "IX_CategoriasServicio_Codigo",
                table: "Categorias",
                newName: "IX_Categorias_Codigo");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Categorias",
                table: "Categorias",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Servicios_Categorias_CategoriaServicioId",
                table: "Servicios",
                column: "CategoriaServicioId",
                principalTable: "Categorias",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
