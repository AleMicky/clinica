using Clinica.Modules.Personas.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.Personas.Infrastructure.Migrations;

/// <inheritdoc />
[DbContext(typeof(PersonasDbContext))]
[Migration("20260724120000_RemovePacienteClinicalFields")]
public partial class RemovePacienteClinicalFields : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_Pacientes_CatalogoItems_GrupoSanguineoId",
            table: "Pacientes");

        migrationBuilder.DropIndex(
            name: "IX_Pacientes_GrupoSanguineoId",
            table: "Pacientes");

        migrationBuilder.DropColumn(
            name: "Alergias",
            table: "Pacientes");

        migrationBuilder.DropColumn(
            name: "FechaRegistro",
            table: "Pacientes");

        migrationBuilder.DropColumn(
            name: "GrupoSanguineoId",
            table: "Pacientes");

        migrationBuilder.DropColumn(
            name: "Observaciones",
            table: "Pacientes");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "Alergias",
            table: "Pacientes",
            type: "nvarchar(500)",
            maxLength: 500,
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "FechaRegistro",
            table: "Pacientes",
            type: "datetime2",
            nullable: false,
            defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

        migrationBuilder.AddColumn<Guid>(
            name: "GrupoSanguineoId",
            table: "Pacientes",
            type: "uniqueidentifier",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "Observaciones",
            table: "Pacientes",
            type: "nvarchar(1000)",
            maxLength: 1000,
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_Pacientes_GrupoSanguineoId",
            table: "Pacientes",
            column: "GrupoSanguineoId");

        migrationBuilder.AddForeignKey(
            name: "FK_Pacientes_CatalogoItems_GrupoSanguineoId",
            table: "Pacientes",
            column: "GrupoSanguineoId",
            principalTable: "CatalogoItems",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);
    }
}
