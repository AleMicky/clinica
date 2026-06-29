using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.AtencionMedica.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNumeracionAtencionAndEtapaFlujo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EtapaFlujo",
                table: "FormularioSecciones",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "NumeracionesAtencion",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TipoAtencionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Gestion = table.Column<int>(type: "int", nullable: false),
                    UltimoCorrelativo = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NumeracionesAtencion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NumeracionesAtencion_TiposAtencion_TipoAtencionId",
                        column: x => x.TipoAtencionId,
                        principalTable: "TiposAtencion",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NumeracionesAtencion_TipoAtencionId_Gestion",
                table: "NumeracionesAtencion",
                columns: new[] { "TipoAtencionId", "Gestion" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NumeracionesAtencion");

            migrationBuilder.DropColumn(
                name: "EtapaFlujo",
                table: "FormularioSecciones");
        }
    }
}
