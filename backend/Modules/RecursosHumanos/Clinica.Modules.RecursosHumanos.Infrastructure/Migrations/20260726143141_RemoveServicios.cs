using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveServicios : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Empleados_Servicios_ServicioId",
                schema: "recursos_humanos",
                table: "Empleados");

            migrationBuilder.DropTable(
                name: "Servicios",
                schema: "recursos_humanos");

            migrationBuilder.DropIndex(
                name: "IX_Empleados_ServicioId",
                schema: "recursos_humanos",
                table: "Empleados");

            migrationBuilder.DropColumn(
                name: "ServicioId",
                schema: "recursos_humanos",
                table: "Empleados");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ServicioId",
                schema: "recursos_humanos",
                table: "Empleados",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "Servicios",
                schema: "recursos_humanos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AreaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Servicios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Servicios_Areas_AreaId",
                        column: x => x.AreaId,
                        principalSchema: "recursos_humanos",
                        principalTable: "Areas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Empleados_ServicioId",
                schema: "recursos_humanos",
                table: "Empleados",
                column: "ServicioId");

            migrationBuilder.CreateIndex(
                name: "IX_Servicios_AreaId",
                schema: "recursos_humanos",
                table: "Servicios",
                column: "AreaId");

            migrationBuilder.CreateIndex(
                name: "IX_Servicios_AreaId_Codigo",
                schema: "recursos_humanos",
                table: "Servicios",
                columns: new[] { "AreaId", "Codigo" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Empleados_Servicios_ServicioId",
                schema: "recursos_humanos",
                table: "Empleados",
                column: "ServicioId",
                principalSchema: "recursos_humanos",
                principalTable: "Servicios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
