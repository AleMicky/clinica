using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.Laboratorio.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveLaboratoriosExternos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SolicitudDetalles_LaboratoriosExternos_LaboratorioExternoId",
                schema: "laboratorio",
                table: "SolicitudDetalles");

            migrationBuilder.DropTable(
                name: "LaboratoriosExternos",
                schema: "laboratorio");

            migrationBuilder.DropIndex(
                name: "IX_SolicitudDetalles_LaboratorioExternoId",
                schema: "laboratorio",
                table: "SolicitudDetalles");

            migrationBuilder.DropColumn(
                name: "LaboratorioExternoId",
                schema: "laboratorio",
                table: "SolicitudDetalles");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "LaboratorioExternoId",
                schema: "laboratorio",
                table: "SolicitudDetalles",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "LaboratoriosExternos",
                schema: "laboratorio",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Contacto = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Telefono = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LaboratoriosExternos", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SolicitudDetalles_LaboratorioExternoId",
                schema: "laboratorio",
                table: "SolicitudDetalles",
                column: "LaboratorioExternoId");

            migrationBuilder.CreateIndex(
                name: "IX_LaboratoriosExternos_Codigo",
                schema: "laboratorio",
                table: "LaboratoriosExternos",
                column: "Codigo",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_SolicitudDetalles_LaboratoriosExternos_LaboratorioExternoId",
                schema: "laboratorio",
                table: "SolicitudDetalles",
                column: "LaboratorioExternoId",
                principalSchema: "laboratorio",
                principalTable: "LaboratoriosExternos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
