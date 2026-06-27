using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Migrations;

/// <inheritdoc />
public partial class RemoveEmpleados : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "Empleados");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Empleados",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                AreaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CargoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                DepartamentoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                ProfesionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                ServicioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Empleados", x => x.Id);
                table.ForeignKey(
                    name: "FK_Empleados_Areas_AreaId",
                    column: x => x.AreaId,
                    principalTable: "Areas",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_Empleados_Cargos_CargoId",
                    column: x => x.CargoId,
                    principalTable: "Cargos",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_Empleados_Departamentos_DepartamentoId",
                    column: x => x.DepartamentoId,
                    principalTable: "Departamentos",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_Empleados_Profesiones_ProfesionId",
                    column: x => x.ProfesionId,
                    principalTable: "Profesiones",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_Empleados_Servicios_ServicioId",
                    column: x => x.ServicioId,
                    principalTable: "Servicios",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "IX_Empleados_AreaId",
            table: "Empleados",
            column: "AreaId");

        migrationBuilder.CreateIndex(
            name: "IX_Empleados_CargoId",
            table: "Empleados",
            column: "CargoId");

        migrationBuilder.CreateIndex(
            name: "IX_Empleados_Codigo",
            table: "Empleados",
            column: "Codigo",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_Empleados_DepartamentoId",
            table: "Empleados",
            column: "DepartamentoId");

        migrationBuilder.CreateIndex(
            name: "IX_Empleados_ProfesionId",
            table: "Empleados",
            column: "ProfesionId");

        migrationBuilder.CreateIndex(
            name: "IX_Empleados_ServicioId",
            table: "Empleados",
            column: "ServicioId");
    }
}
