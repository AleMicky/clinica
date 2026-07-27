using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.Laboratorio.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSolicitudOperativa : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "HorasAyuno",
                schema: "laboratorio",
                table: "Pruebas",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.Sql("""
                UPDATE laboratorio.Pruebas
                SET HorasAyuno = NULL
                WHERE RequiereAyuno = 0;
                """);

            migrationBuilder.CreateTable(
                name: "LaboratoriosExternos",
                schema: "laboratorio",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Contacto = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Telefono = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LaboratoriosExternos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Parametros",
                schema: "laboratorio",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PruebaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    UnidadMedidaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TipoDato = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Orden = table.Column<int>(type: "int", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Parametros", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Parametros_Pruebas_PruebaId",
                        column: x => x.PruebaId,
                        principalSchema: "laboratorio",
                        principalTable: "Pruebas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Solicitudes",
                schema: "laboratorio",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Numero = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Origen = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    AtencionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MedicoSolicitanteId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    MedicoExternoNombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Estado = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    WorkflowInstanceId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Observaciones = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    FechaSolicitud = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Solicitudes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ValoresReferencia",
                schema: "laboratorio",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParametroId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Sexo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    EdadMin = table.Column<int>(type: "int", nullable: true),
                    EdadMax = table.Column<int>(type: "int", nullable: true),
                    ValorMin = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    ValorMax = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    ValorTexto = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ValoresReferencia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ValoresReferencia_Parametros_ParametroId",
                        column: x => x.ParametroId,
                        principalSchema: "laboratorio",
                        principalTable: "Parametros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Muestras",
                schema: "laboratorio",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SolicitudId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TipoMuestraId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FechaToma = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TomadoPorEmpleadoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Estado = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Muestras", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Muestras_CatalogoItems_TipoMuestraId",
                        column: x => x.TipoMuestraId,
                        principalSchema: "parametros",
                        principalTable: "CatalogoItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Muestras_Solicitudes_SolicitudId",
                        column: x => x.SolicitudId,
                        principalSchema: "laboratorio",
                        principalTable: "Solicitudes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SolicitudDetalles",
                schema: "laboratorio",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SolicitudId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PruebaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PrecioUnitario = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Cantidad = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    EsDerivada = table.Column<bool>(type: "bit", nullable: false),
                    LaboratorioExternoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Observaciones = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SolicitudDetalles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SolicitudDetalles_LaboratoriosExternos_LaboratorioExternoId",
                        column: x => x.LaboratorioExternoId,
                        principalSchema: "laboratorio",
                        principalTable: "LaboratoriosExternos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SolicitudDetalles_Pruebas_PruebaId",
                        column: x => x.PruebaId,
                        principalSchema: "laboratorio",
                        principalTable: "Pruebas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SolicitudDetalles_Solicitudes_SolicitudId",
                        column: x => x.SolicitudId,
                        principalSchema: "laboratorio",
                        principalTable: "Solicitudes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SolicitudPagos",
                schema: "laboratorio",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SolicitudId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CuentaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MontoTotal = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    FechaEnvio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SolicitudPagos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SolicitudPagos_Solicitudes_SolicitudId",
                        column: x => x.SolicitudId,
                        principalSchema: "laboratorio",
                        principalTable: "Solicitudes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Resultados",
                schema: "laboratorio",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SolicitudId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MuestraId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Estado = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ValidadoPorEmpleadoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FechaValidacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Observaciones = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Resultados", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Resultados_Muestras_MuestraId",
                        column: x => x.MuestraId,
                        principalSchema: "laboratorio",
                        principalTable: "Muestras",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Resultados_Solicitudes_SolicitudId",
                        column: x => x.SolicitudId,
                        principalSchema: "laboratorio",
                        principalTable: "Solicitudes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MuestraDetalles",
                schema: "laboratorio",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MuestraId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SolicitudDetalleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MuestraDetalles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MuestraDetalles_Muestras_MuestraId",
                        column: x => x.MuestraId,
                        principalSchema: "laboratorio",
                        principalTable: "Muestras",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MuestraDetalles_SolicitudDetalles_SolicitudDetalleId",
                        column: x => x.SolicitudDetalleId,
                        principalSchema: "laboratorio",
                        principalTable: "SolicitudDetalles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ResultadoDetalles",
                schema: "laboratorio",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResultadoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ParametroId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SolicitudDetalleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ValorNumerico = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    ValorTexto = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    FueraDeRango = table.Column<bool>(type: "bit", nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResultadoDetalles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ResultadoDetalles_Parametros_ParametroId",
                        column: x => x.ParametroId,
                        principalSchema: "laboratorio",
                        principalTable: "Parametros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ResultadoDetalles_Resultados_ResultadoId",
                        column: x => x.ResultadoId,
                        principalSchema: "laboratorio",
                        principalTable: "Resultados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ResultadoDetalles_SolicitudDetalles_SolicitudDetalleId",
                        column: x => x.SolicitudDetalleId,
                        principalSchema: "laboratorio",
                        principalTable: "SolicitudDetalles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LaboratoriosExternos_Codigo",
                schema: "laboratorio",
                table: "LaboratoriosExternos",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MuestraDetalles_MuestraId",
                schema: "laboratorio",
                table: "MuestraDetalles",
                column: "MuestraId");

            migrationBuilder.CreateIndex(
                name: "IX_MuestraDetalles_SolicitudDetalleId",
                schema: "laboratorio",
                table: "MuestraDetalles",
                column: "SolicitudDetalleId");

            migrationBuilder.CreateIndex(
                name: "IX_Muestras_Codigo",
                schema: "laboratorio",
                table: "Muestras",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Muestras_SolicitudId",
                schema: "laboratorio",
                table: "Muestras",
                column: "SolicitudId");

            migrationBuilder.CreateIndex(
                name: "IX_Muestras_TipoMuestraId",
                schema: "laboratorio",
                table: "Muestras",
                column: "TipoMuestraId");

            migrationBuilder.CreateIndex(
                name: "IX_Parametros_PruebaId",
                schema: "laboratorio",
                table: "Parametros",
                column: "PruebaId");

            migrationBuilder.CreateIndex(
                name: "IX_Parametros_PruebaId_Codigo",
                schema: "laboratorio",
                table: "Parametros",
                columns: new[] { "PruebaId", "Codigo" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Parametros_UnidadMedidaId",
                schema: "laboratorio",
                table: "Parametros",
                column: "UnidadMedidaId");

            migrationBuilder.CreateIndex(
                name: "IX_ResultadoDetalles_ParametroId",
                schema: "laboratorio",
                table: "ResultadoDetalles",
                column: "ParametroId");

            migrationBuilder.CreateIndex(
                name: "IX_ResultadoDetalles_ResultadoId",
                schema: "laboratorio",
                table: "ResultadoDetalles",
                column: "ResultadoId");

            migrationBuilder.CreateIndex(
                name: "IX_ResultadoDetalles_SolicitudDetalleId",
                schema: "laboratorio",
                table: "ResultadoDetalles",
                column: "SolicitudDetalleId");

            migrationBuilder.CreateIndex(
                name: "IX_Resultados_MuestraId",
                schema: "laboratorio",
                table: "Resultados",
                column: "MuestraId");

            migrationBuilder.CreateIndex(
                name: "IX_Resultados_SolicitudId",
                schema: "laboratorio",
                table: "Resultados",
                column: "SolicitudId");

            migrationBuilder.CreateIndex(
                name: "IX_SolicitudDetalles_LaboratorioExternoId",
                schema: "laboratorio",
                table: "SolicitudDetalles",
                column: "LaboratorioExternoId");

            migrationBuilder.CreateIndex(
                name: "IX_SolicitudDetalles_PruebaId",
                schema: "laboratorio",
                table: "SolicitudDetalles",
                column: "PruebaId");

            migrationBuilder.CreateIndex(
                name: "IX_SolicitudDetalles_SolicitudId",
                schema: "laboratorio",
                table: "SolicitudDetalles",
                column: "SolicitudId");

            migrationBuilder.CreateIndex(
                name: "IX_Solicitudes_AtencionId",
                schema: "laboratorio",
                table: "Solicitudes",
                column: "AtencionId");

            migrationBuilder.CreateIndex(
                name: "IX_Solicitudes_Estado",
                schema: "laboratorio",
                table: "Solicitudes",
                column: "Estado");

            migrationBuilder.CreateIndex(
                name: "IX_Solicitudes_FechaSolicitud",
                schema: "laboratorio",
                table: "Solicitudes",
                column: "FechaSolicitud");

            migrationBuilder.CreateIndex(
                name: "IX_Solicitudes_Numero",
                schema: "laboratorio",
                table: "Solicitudes",
                column: "Numero",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Solicitudes_PacienteId",
                schema: "laboratorio",
                table: "Solicitudes",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_SolicitudPagos_CuentaId",
                schema: "laboratorio",
                table: "SolicitudPagos",
                column: "CuentaId");

            migrationBuilder.CreateIndex(
                name: "IX_SolicitudPagos_SolicitudId",
                schema: "laboratorio",
                table: "SolicitudPagos",
                column: "SolicitudId");

            migrationBuilder.CreateIndex(
                name: "IX_ValoresReferencia_ParametroId",
                schema: "laboratorio",
                table: "ValoresReferencia",
                column: "ParametroId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MuestraDetalles",
                schema: "laboratorio");

            migrationBuilder.DropTable(
                name: "ResultadoDetalles",
                schema: "laboratorio");

            migrationBuilder.DropTable(
                name: "SolicitudPagos",
                schema: "laboratorio");

            migrationBuilder.DropTable(
                name: "ValoresReferencia",
                schema: "laboratorio");

            migrationBuilder.DropTable(
                name: "Resultados",
                schema: "laboratorio");

            migrationBuilder.DropTable(
                name: "SolicitudDetalles",
                schema: "laboratorio");

            migrationBuilder.DropTable(
                name: "Parametros",
                schema: "laboratorio");

            migrationBuilder.DropTable(
                name: "Muestras",
                schema: "laboratorio");

            migrationBuilder.DropTable(
                name: "LaboratoriosExternos",
                schema: "laboratorio");

            migrationBuilder.DropTable(
                name: "Solicitudes",
                schema: "laboratorio");

            migrationBuilder.AlterColumn<int>(
                name: "HorasAyuno",
                schema: "laboratorio",
                table: "Pruebas",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
