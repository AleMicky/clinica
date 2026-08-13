using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class CorrelativoConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Correlativos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Gestion = table.Column<int>(type: "int", nullable: false),
                    UltimoNumero = table.Column<int>(type: "int", nullable: false),
                    Prefijo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Longitud = table.Column<int>(type: "int", nullable: false, defaultValue: 6)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Correlativos", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Correlativos_Codigo_Gestion",
                table: "Correlativos",
                columns: new[] { "Codigo", "Gestion" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Correlativos");
        }
    }
}
