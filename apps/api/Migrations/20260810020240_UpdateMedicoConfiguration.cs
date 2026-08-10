using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMedicoConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Medicos_MatriculaProfesional",
                table: "Medicos");

            migrationBuilder.AlterColumn<string>(
                name: "MatriculaProfesional",
                table: "Medicos",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(30)",
                oldMaxLength: 30);

            migrationBuilder.CreateIndex(
                name: "IX_Medicos_MatriculaProfesional",
                table: "Medicos",
                column: "MatriculaProfesional",
                unique: true,
                filter: "[MatriculaProfesional] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Medicos_MatriculaProfesional",
                table: "Medicos");

            migrationBuilder.AlterColumn<string>(
                name: "MatriculaProfesional",
                table: "Medicos",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(30)",
                oldMaxLength: 30,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Medicos_MatriculaProfesional",
                table: "Medicos",
                column: "MatriculaProfesional",
                unique: true);
        }
    }
}
