using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAdmisionConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RecepcionistaId",
                table: "Admisiones",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Admisiones_RecepcionistaId",
                table: "Admisiones",
                column: "RecepcionistaId");

            migrationBuilder.AddForeignKey(
                name: "FK_Admisiones_Empleados_RecepcionistaId",
                table: "Admisiones",
                column: "RecepcionistaId",
                principalTable: "Empleados",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Admisiones_Empleados_RecepcionistaId",
                table: "Admisiones");

            migrationBuilder.DropIndex(
                name: "IX_Admisiones_RecepcionistaId",
                table: "Admisiones");

            migrationBuilder.DropColumn(
                name: "RecepcionistaId",
                table: "Admisiones");
        }
    }
}
