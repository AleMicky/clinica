using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.Seguridad.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPersonaIdToApplicationUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PersonaId",
                schema: "seguridad",
                table: "usuarios",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_usuarios_PersonaId",
                schema: "seguridad",
                table: "usuarios",
                column: "PersonaId",
                unique: true,
                filter: "[PersonaId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_usuarios_PersonaId",
                schema: "seguridad",
                table: "usuarios");

            migrationBuilder.DropColumn(
                name: "PersonaId",
                schema: "seguridad",
                table: "usuarios");
        }
    }
}
