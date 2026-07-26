using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.RecursosHumanos.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RefactorAreasHierarchy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF NOT EXISTS (
                    SELECT 1
                    FROM [recursos_humanos].[TiposArea]
                    WHERE [Codigo] = N'ARE'
                )
                BEGIN
                    INSERT INTO [recursos_humanos].[TiposArea]
                        ([Id], [Codigo], [Nombre], [Descripcion], [Orden], [CreatedAt], [IsDeleted])
                    VALUES
                        (NEWID(), N'ORG', N'Organización', NULL, 1, GETUTCDATE(), 0),
                        (NEWID(), N'DIR', N'Dirección', NULL, 2, GETUTCDATE(), 0),
                        (NEWID(), N'ARE', N'Área', NULL, 3, GETUTCDATE(), 0),
                        (NEWID(), N'DEP', N'Departamento', NULL, 4, GETUTCDATE(), 0),
                        (NEWID(), N'SER', N'Servicio', NULL, 5, GETUTCDATE(), 0);
                END
                """);

            migrationBuilder.AddColumn<Guid>(
                name: "TipoAreaId",
                schema: "recursos_humanos",
                table: "Areas",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "AreaPadreId",
                schema: "recursos_humanos",
                table: "Areas",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ResponsableEmpleadoId",
                schema: "recursos_humanos",
                table: "Areas",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE a
                SET a.[TipoAreaId] = t.[Id]
                FROM [recursos_humanos].[Areas] a
                CROSS JOIN [recursos_humanos].[TiposArea] t
                WHERE t.[Codigo] = N'ARE'
                  AND a.[TipoAreaId] IS NULL;
                """);

            migrationBuilder.AlterColumn<Guid>(
                name: "TipoAreaId",
                schema: "recursos_humanos",
                table: "Areas",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Areas_TipoAreaId",
                schema: "recursos_humanos",
                table: "Areas",
                column: "TipoAreaId");

            migrationBuilder.CreateIndex(
                name: "IX_Areas_AreaPadreId",
                schema: "recursos_humanos",
                table: "Areas",
                column: "AreaPadreId");

            migrationBuilder.CreateIndex(
                name: "IX_Areas_ResponsableEmpleadoId",
                schema: "recursos_humanos",
                table: "Areas",
                column: "ResponsableEmpleadoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Areas_TiposArea_TipoAreaId",
                schema: "recursos_humanos",
                table: "Areas",
                column: "TipoAreaId",
                principalSchema: "recursos_humanos",
                principalTable: "TiposArea",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Areas_Areas_AreaPadreId",
                schema: "recursos_humanos",
                table: "Areas",
                column: "AreaPadreId",
                principalSchema: "recursos_humanos",
                principalTable: "Areas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Areas_Empleados_ResponsableEmpleadoId",
                schema: "recursos_humanos",
                table: "Areas",
                column: "ResponsableEmpleadoId",
                principalSchema: "recursos_humanos",
                principalTable: "Empleados",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Areas_TiposArea_TipoAreaId",
                schema: "recursos_humanos",
                table: "Areas");

            migrationBuilder.DropForeignKey(
                name: "FK_Areas_Areas_AreaPadreId",
                schema: "recursos_humanos",
                table: "Areas");

            migrationBuilder.DropForeignKey(
                name: "FK_Areas_Empleados_ResponsableEmpleadoId",
                schema: "recursos_humanos",
                table: "Areas");

            migrationBuilder.DropIndex(
                name: "IX_Areas_TipoAreaId",
                schema: "recursos_humanos",
                table: "Areas");

            migrationBuilder.DropIndex(
                name: "IX_Areas_AreaPadreId",
                schema: "recursos_humanos",
                table: "Areas");

            migrationBuilder.DropIndex(
                name: "IX_Areas_ResponsableEmpleadoId",
                schema: "recursos_humanos",
                table: "Areas");

            migrationBuilder.DropColumn(
                name: "TipoAreaId",
                schema: "recursos_humanos",
                table: "Areas");

            migrationBuilder.DropColumn(
                name: "AreaPadreId",
                schema: "recursos_humanos",
                table: "Areas");

            migrationBuilder.DropColumn(
                name: "ResponsableEmpleadoId",
                schema: "recursos_humanos",
                table: "Areas");
        }
    }
}
