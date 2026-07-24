using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.Parametros.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveCorrelativoSufijo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Sufijo",
                table: "Correlativos");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Sufijo",
                table: "Correlativos",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);
        }
    }
}
