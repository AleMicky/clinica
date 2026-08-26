using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Api.Migrations
{
    /// <inheritdoc />
    public partial class ChangeNotificacionUsuarioIdToInt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Notificaciones_UsuarioId_CreadoPor",
                table: "Notificaciones");

            migrationBuilder.AlterColumn<int>(
                name: "UsuarioId",
                table: "Notificaciones",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldMaxLength: 450);

            migrationBuilder.AlterColumn<string>(
                name: "Tipo",
                table: "Notificaciones",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "Notificaciones",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notificaciones_UsuarioId_FechaCreacion",
                table: "Notificaciones",
                columns: new[] { "UsuarioId", "FechaCreacion" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Notificaciones_UsuarioId_FechaCreacion",
                table: "Notificaciones");

            migrationBuilder.AlterColumn<string>(
                name: "UsuarioId",
                table: "Notificaciones",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "Tipo",
                table: "Notificaciones",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CreadoPor",
                table: "Notificaciones",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notificaciones_UsuarioId_CreadoPor",
                table: "Notificaciones",
                columns: new[] { "UsuarioId", "CreadoPor" });
        }
    }
}
