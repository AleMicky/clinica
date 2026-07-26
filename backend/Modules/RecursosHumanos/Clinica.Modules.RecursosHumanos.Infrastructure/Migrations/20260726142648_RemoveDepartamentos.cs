using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveDepartamentos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Empleados_Departamentos_DepartamentoId",
                schema: "recursos_humanos",
                table: "Empleados");

            migrationBuilder.DropForeignKey(
                name: "FK_Servicios_Departamentos_DepartamentoId",
                schema: "recursos_humanos",
                table: "Servicios");

            migrationBuilder.Sql(
                """
                UPDATE s
                SET s.DepartamentoId = d.AreaId
                FROM [recursos_humanos].[Servicios] s
                INNER JOIN [recursos_humanos].[Departamentos] d ON d.Id = s.DepartamentoId;
                """);

            migrationBuilder.DropIndex(
                name: "IX_Empleados_DepartamentoId",
                schema: "recursos_humanos",
                table: "Empleados");

            migrationBuilder.DropColumn(
                name: "DepartamentoId",
                schema: "recursos_humanos",
                table: "Empleados");

            migrationBuilder.DropTable(
                name: "Departamentos",
                schema: "recursos_humanos");

            migrationBuilder.RenameColumn(
                name: "DepartamentoId",
                schema: "recursos_humanos",
                table: "Servicios",
                newName: "AreaId");

            migrationBuilder.RenameIndex(
                name: "IX_Servicios_DepartamentoId_Codigo",
                schema: "recursos_humanos",
                table: "Servicios",
                newName: "IX_Servicios_AreaId_Codigo");

            migrationBuilder.RenameIndex(
                name: "IX_Servicios_DepartamentoId",
                schema: "recursos_humanos",
                table: "Servicios",
                newName: "IX_Servicios_AreaId");

            migrationBuilder.AddForeignKey(
                name: "FK_Servicios_Areas_AreaId",
                schema: "recursos_humanos",
                table: "Servicios",
                column: "AreaId",
                principalSchema: "recursos_humanos",
                principalTable: "Areas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Servicios_Areas_AreaId",
                schema: "recursos_humanos",
                table: "Servicios");

            migrationBuilder.RenameColumn(
                name: "AreaId",
                schema: "recursos_humanos",
                table: "Servicios",
                newName: "DepartamentoId");

            migrationBuilder.RenameIndex(
                name: "IX_Servicios_AreaId_Codigo",
                schema: "recursos_humanos",
                table: "Servicios",
                newName: "IX_Servicios_DepartamentoId_Codigo");

            migrationBuilder.RenameIndex(
                name: "IX_Servicios_AreaId",
                schema: "recursos_humanos",
                table: "Servicios",
                newName: "IX_Servicios_DepartamentoId");

            migrationBuilder.AddColumn<Guid>(
                name: "DepartamentoId",
                schema: "recursos_humanos",
                table: "Empleados",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "Departamentos",
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
                    table.PrimaryKey("PK_Departamentos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Departamentos_Areas_AreaId",
                        column: x => x.AreaId,
                        principalSchema: "recursos_humanos",
                        principalTable: "Areas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Empleados_DepartamentoId",
                schema: "recursos_humanos",
                table: "Empleados",
                column: "DepartamentoId");

            migrationBuilder.CreateIndex(
                name: "IX_Departamentos_AreaId",
                schema: "recursos_humanos",
                table: "Departamentos",
                column: "AreaId");

            migrationBuilder.CreateIndex(
                name: "IX_Departamentos_Codigo",
                schema: "recursos_humanos",
                table: "Departamentos",
                column: "Codigo",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Empleados_Departamentos_DepartamentoId",
                schema: "recursos_humanos",
                table: "Empleados",
                column: "DepartamentoId",
                principalSchema: "recursos_humanos",
                principalTable: "Departamentos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Servicios_Departamentos_DepartamentoId",
                schema: "recursos_humanos",
                table: "Servicios",
                column: "DepartamentoId",
                principalSchema: "recursos_humanos",
                principalTable: "Departamentos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
