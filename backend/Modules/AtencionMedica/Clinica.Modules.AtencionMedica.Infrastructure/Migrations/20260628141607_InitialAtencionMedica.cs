using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.AtencionMedica.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialAtencionMedica : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TiposAtencion",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposAtencion", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TiposCampoFormulario",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ControlFrontend = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TipoDato = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    PermiteOpciones = table.Column<bool>(type: "bit", nullable: false),
                    PermiteValorDefecto = table.Column<bool>(type: "bit", nullable: false),
                    PermiteValidaciones = table.Column<bool>(type: "bit", nullable: false),
                    PermiteMultiple = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposCampoFormulario", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FormulariosClinicos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TipoAtencionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Version = table.Column<int>(type: "int", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormulariosClinicos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormulariosClinicos_TiposAtencion_TipoAtencionId",
                        column: x => x.TipoAtencionId,
                        principalTable: "TiposAtencion",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Atenciones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NumeroTramite = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TipoAtencionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FormularioClinicoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FechaAtencion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Atenciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Atenciones_FormulariosClinicos_FormularioClinicoId",
                        column: x => x.FormularioClinicoId,
                        principalTable: "FormulariosClinicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Atenciones_Pacientes_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "Pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Atenciones_TiposAtencion_TipoAtencionId",
                        column: x => x.TipoAtencionId,
                        principalTable: "TiposAtencion",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FormularioSecciones",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FormularioClinicoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Orden = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormularioSecciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormularioSecciones_FormulariosClinicos_FormularioClinicoId",
                        column: x => x.FormularioClinicoId,
                        principalTable: "FormulariosClinicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FormularioCampos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FormularioSeccionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Etiqueta = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TipoCampoFormularioId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EsRequerido = table.Column<bool>(type: "bit", nullable: false),
                    Orden = table.Column<int>(type: "int", nullable: false),
                    Placeholder = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ValorDefecto = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    OpcionesJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ValidacionesJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormularioCampos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormularioCampos_FormularioSecciones_FormularioSeccionId",
                        column: x => x.FormularioSeccionId,
                        principalTable: "FormularioSecciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FormularioCampos_TiposCampoFormulario_TipoCampoFormularioId",
                        column: x => x.TipoCampoFormularioId,
                        principalTable: "TiposCampoFormulario",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AtencionFormularioRespuestas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AtencionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FormularioCampoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ValorTexto = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    ValorNumero = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    ValorFecha = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ValorBooleano = table.Column<bool>(type: "bit", nullable: true),
                    ValorJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AtencionFormularioRespuestas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AtencionFormularioRespuestas_Atenciones_AtencionId",
                        column: x => x.AtencionId,
                        principalTable: "Atenciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AtencionFormularioRespuestas_FormularioCampos_FormularioCampoId",
                        column: x => x.FormularioCampoId,
                        principalTable: "FormularioCampos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Atenciones_FechaAtencion",
                table: "Atenciones",
                column: "FechaAtencion");

            migrationBuilder.CreateIndex(
                name: "IX_Atenciones_FormularioClinicoId",
                table: "Atenciones",
                column: "FormularioClinicoId");

            migrationBuilder.CreateIndex(
                name: "IX_Atenciones_NumeroTramite",
                table: "Atenciones",
                column: "NumeroTramite",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Atenciones_PacienteId",
                table: "Atenciones",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_Atenciones_TipoAtencionId",
                table: "Atenciones",
                column: "TipoAtencionId");

            migrationBuilder.CreateIndex(
                name: "IX_AtencionFormularioRespuestas_AtencionId_FormularioCampoId",
                table: "AtencionFormularioRespuestas",
                columns: new[] { "AtencionId", "FormularioCampoId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AtencionFormularioRespuestas_FormularioCampoId",
                table: "AtencionFormularioRespuestas",
                column: "FormularioCampoId");

            migrationBuilder.CreateIndex(
                name: "IX_FormularioCampos_FormularioSeccionId_Codigo",
                table: "FormularioCampos",
                columns: new[] { "FormularioSeccionId", "Codigo" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FormularioCampos_TipoCampoFormularioId",
                table: "FormularioCampos",
                column: "TipoCampoFormularioId");

            migrationBuilder.CreateIndex(
                name: "IX_FormulariosClinicos_TipoAtencionId_Codigo_Version",
                table: "FormulariosClinicos",
                columns: new[] { "TipoAtencionId", "Codigo", "Version" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FormularioSecciones_FormularioClinicoId_Codigo",
                table: "FormularioSecciones",
                columns: new[] { "FormularioClinicoId", "Codigo" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TiposAtencion_Codigo",
                table: "TiposAtencion",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TiposCampoFormulario_Codigo",
                table: "TiposCampoFormulario",
                column: "Codigo",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AtencionFormularioRespuestas");

            migrationBuilder.DropTable(
                name: "Atenciones");

            migrationBuilder.DropTable(
                name: "FormularioCampos");

            migrationBuilder.DropTable(
                name: "FormularioSecciones");

            migrationBuilder.DropTable(
                name: "TiposCampoFormulario");

            migrationBuilder.DropTable(
                name: "FormulariosClinicos");

            migrationBuilder.DropTable(
                name: "TiposAtencion");
        }
    }
}
