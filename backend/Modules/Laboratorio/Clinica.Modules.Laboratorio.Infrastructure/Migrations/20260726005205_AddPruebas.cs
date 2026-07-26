using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.Laboratorio.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPruebas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Pruebas",
                schema: "laboratorio",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EspecialidadId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TipoExamenId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TipoMuestraId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RequiereAyuno = table.Column<bool>(type: "bit", nullable: false),
                    HorasAyuno = table.Column<int>(type: "int", nullable: false),
                    EsDerivable = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pruebas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Pruebas_CatalogoItems_TipoMuestraId",
                        column: x => x.TipoMuestraId,
                        principalSchema: "parametros",
                        principalTable: "CatalogoItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Pruebas_Especialidades_EspecialidadId",
                        column: x => x.EspecialidadId,
                        principalSchema: "laboratorio",
                        principalTable: "Especialidades",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Pruebas_TiposExamen_TipoExamenId",
                        column: x => x.TipoExamenId,
                        principalSchema: "laboratorio",
                        principalTable: "TiposExamen",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Pruebas_Codigo",
                schema: "laboratorio",
                table: "Pruebas",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Pruebas_EspecialidadId",
                schema: "laboratorio",
                table: "Pruebas",
                column: "EspecialidadId");

            migrationBuilder.CreateIndex(
                name: "IX_Pruebas_TipoExamenId",
                schema: "laboratorio",
                table: "Pruebas",
                column: "TipoExamenId");

            migrationBuilder.CreateIndex(
                name: "IX_Pruebas_TipoMuestraId",
                schema: "laboratorio",
                table: "Pruebas",
                column: "TipoMuestraId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Pruebas",
                schema: "laboratorio");
        }
    }
}
