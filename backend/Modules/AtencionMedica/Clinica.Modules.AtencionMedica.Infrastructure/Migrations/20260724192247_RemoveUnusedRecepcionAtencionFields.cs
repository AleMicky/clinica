using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.AtencionMedica.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUnusedRecepcionAtencionFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Atenciones_Especialidades_EspecialidadId",
                table: "Atenciones");

            migrationBuilder.DropForeignKey(
                name: "FK_Atenciones_Servicios_ServicioId",
                table: "Atenciones");

            migrationBuilder.DropIndex(
                name: "IX_Atenciones_EspecialidadId",
                table: "Atenciones");

            migrationBuilder.DropIndex(
                name: "IX_Atenciones_ServicioId",
                table: "Atenciones");

            migrationBuilder.DropColumn(
                name: "EspecialidadId",
                table: "Atenciones");

            migrationBuilder.DropColumn(
                name: "MotivoConsulta",
                table: "Atenciones");

            migrationBuilder.DropColumn(
                name: "NumeroAfiliacion",
                table: "Atenciones");

            migrationBuilder.DropColumn(
                name: "ResponsableFinancieroDocumento",
                table: "Atenciones");

            migrationBuilder.DropColumn(
                name: "ResponsableFinancieroNombre",
                table: "Atenciones");

            migrationBuilder.DropColumn(
                name: "ResponsableFinancieroTelefono",
                table: "Atenciones");

            migrationBuilder.DropColumn(
                name: "SeguroNombre",
                table: "Atenciones");

            migrationBuilder.DropColumn(
                name: "ServicioId",
                table: "Atenciones");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "EspecialidadId",
                table: "Atenciones",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MotivoConsulta",
                table: "Atenciones",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NumeroAfiliacion",
                table: "Atenciones",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResponsableFinancieroDocumento",
                table: "Atenciones",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResponsableFinancieroNombre",
                table: "Atenciones",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResponsableFinancieroTelefono",
                table: "Atenciones",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SeguroNombre",
                table: "Atenciones",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ServicioId",
                table: "Atenciones",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Atenciones_EspecialidadId",
                table: "Atenciones",
                column: "EspecialidadId");

            migrationBuilder.CreateIndex(
                name: "IX_Atenciones_ServicioId",
                table: "Atenciones",
                column: "ServicioId");

            migrationBuilder.AddForeignKey(
                name: "FK_Atenciones_Especialidades_EspecialidadId",
                table: "Atenciones",
                column: "EspecialidadId",
                principalTable: "Especialidades",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Atenciones_Servicios_ServicioId",
                table: "Atenciones",
                column: "ServicioId",
                principalTable: "Servicios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
