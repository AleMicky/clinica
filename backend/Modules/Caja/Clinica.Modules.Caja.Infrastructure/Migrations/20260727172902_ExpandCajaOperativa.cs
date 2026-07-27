using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.Caja.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ExpandCajaOperativa : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "MetodoPago",
                schema: "caja",
                table: "Pagos",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<string>(
                name: "Estado",
                schema: "caja",
                table: "Pagos",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "CONFIRMADO");

            migrationBuilder.AddColumn<string>(
                name: "Numero",
                schema: "caja",
                table: "Pagos",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "PacienteId",
                schema: "caja",
                table: "Pagos",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "TurnoCajaId",
                schema: "caja",
                table: "Pagos",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE p
                SET p.PacienteId = c.PacienteId,
                    p.Numero = CONCAT('LEG-', SUBSTRING(REPLACE(CONVERT(varchar(36), p.Id), '-', ''), 1, 12))
                FROM caja.Pagos p
                INNER JOIN caja.Cuentas c ON c.Id = p.CuentaId
                WHERE p.PacienteId = '00000000-0000-0000-0000-000000000000'
                   OR p.Numero = '';
                """);

            migrationBuilder.CreateTable(
                name: "AplicacionesPago",
                schema: "caja",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PagoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CuentaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ImporteAplicado = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AplicacionesPago", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AplicacionesPago_Cuentas_CuentaId",
                        column: x => x.CuentaId,
                        principalSchema: "caja",
                        principalTable: "Cuentas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AplicacionesPago_Pagos_PagoId",
                        column: x => x.PagoId,
                        principalSchema: "caja",
                        principalTable: "Pagos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Cajas",
                schema: "caja",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cajas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ConceptosCaja",
                schema: "caja",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TipoMovimiento = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConceptosCaja", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MetodosPago",
                schema: "caja",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    RequiereReferencia = table.Column<bool>(type: "bit", nullable: false),
                    EsEfectivo = table.Column<bool>(type: "bit", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MetodosPago", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Recibos",
                schema: "caja",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Numero = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PagoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PacienteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FechaEmision = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Importe = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
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
                    table.PrimaryKey("PK_Recibos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Recibos_Pagos_PagoId",
                        column: x => x.PagoId,
                        principalSchema: "caja",
                        principalTable: "Pagos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TurnosCaja",
                schema: "caja",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CajaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UsuarioAperturaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UsuarioCierreId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FechaApertura = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaCierre = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MontoInicial = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    MontoEsperado = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    MontoContado = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Diferencia = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Estado = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ObservacionApertura = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ObservacionCierre = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TurnosCaja", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TurnosCaja_Cajas_CajaId",
                        column: x => x.CajaId,
                        principalSchema: "caja",
                        principalTable: "Cajas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PagosDetalle",
                schema: "caja",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PagoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MetodoPagoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Importe = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    NumeroReferencia = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Observaciones = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PagosDetalle", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PagosDetalle_MetodosPago_MetodoPagoId",
                        column: x => x.MetodoPagoId,
                        principalSchema: "caja",
                        principalTable: "MetodosPago",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PagosDetalle_Pagos_PagoId",
                        column: x => x.PagoId,
                        principalSchema: "caja",
                        principalTable: "Pagos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ArqueosCaja",
                schema: "caja",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TurnoCajaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MontoInicial = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    IngresosEfectivo = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    EgresosEfectivo = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    MontoEsperado = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    MontoContado = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Diferencia = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Observaciones = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    RealizadoPor = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArqueosCaja", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ArqueosCaja_TurnosCaja_TurnoCajaId",
                        column: x => x.TurnoCajaId,
                        principalSchema: "caja",
                        principalTable: "TurnosCaja",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MovimientosCaja",
                schema: "caja",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Numero = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TurnoCajaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConceptoCajaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TipoMovimiento = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Importe = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    MetodoPagoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PagoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ModuloOrigen = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ReferenciaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Descripcion = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Estado = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovimientosCaja", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MovimientosCaja_ConceptosCaja_ConceptoCajaId",
                        column: x => x.ConceptoCajaId,
                        principalSchema: "caja",
                        principalTable: "ConceptosCaja",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MovimientosCaja_MetodosPago_MetodoPagoId",
                        column: x => x.MetodoPagoId,
                        principalSchema: "caja",
                        principalTable: "MetodosPago",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MovimientosCaja_Pagos_PagoId",
                        column: x => x.PagoId,
                        principalSchema: "caja",
                        principalTable: "Pagos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MovimientosCaja_TurnosCaja_TurnoCajaId",
                        column: x => x.TurnoCajaId,
                        principalSchema: "caja",
                        principalTable: "TurnosCaja",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_Numero",
                schema: "caja",
                table: "Pagos",
                column: "Numero",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_PacienteId",
                schema: "caja",
                table: "Pagos",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_Pagos_TurnoCajaId",
                schema: "caja",
                table: "Pagos",
                column: "TurnoCajaId");

            migrationBuilder.CreateIndex(
                name: "IX_AplicacionesPago_CuentaId",
                schema: "caja",
                table: "AplicacionesPago",
                column: "CuentaId");

            migrationBuilder.CreateIndex(
                name: "IX_AplicacionesPago_PagoId",
                schema: "caja",
                table: "AplicacionesPago",
                column: "PagoId");

            migrationBuilder.CreateIndex(
                name: "IX_ArqueosCaja_TurnoCajaId",
                schema: "caja",
                table: "ArqueosCaja",
                column: "TurnoCajaId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cajas_Codigo",
                schema: "caja",
                table: "Cajas",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ConceptosCaja_Codigo",
                schema: "caja",
                table: "ConceptosCaja",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MetodosPago_Codigo",
                schema: "caja",
                table: "MetodosPago",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosCaja_ConceptoCajaId",
                schema: "caja",
                table: "MovimientosCaja",
                column: "ConceptoCajaId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosCaja_MetodoPagoId",
                schema: "caja",
                table: "MovimientosCaja",
                column: "MetodoPagoId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosCaja_Numero",
                schema: "caja",
                table: "MovimientosCaja",
                column: "Numero",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosCaja_PagoId",
                schema: "caja",
                table: "MovimientosCaja",
                column: "PagoId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosCaja_TurnoCajaId",
                schema: "caja",
                table: "MovimientosCaja",
                column: "TurnoCajaId");

            migrationBuilder.CreateIndex(
                name: "IX_PagosDetalle_MetodoPagoId",
                schema: "caja",
                table: "PagosDetalle",
                column: "MetodoPagoId");

            migrationBuilder.CreateIndex(
                name: "IX_PagosDetalle_PagoId",
                schema: "caja",
                table: "PagosDetalle",
                column: "PagoId");

            migrationBuilder.CreateIndex(
                name: "IX_Recibos_Numero",
                schema: "caja",
                table: "Recibos",
                column: "Numero",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Recibos_PagoId",
                schema: "caja",
                table: "Recibos",
                column: "PagoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TurnosCaja_CajaId_Estado",
                schema: "caja",
                table: "TurnosCaja",
                columns: new[] { "CajaId", "Estado" });

            migrationBuilder.CreateIndex(
                name: "IX_TurnosCaja_UsuarioAperturaId_Estado",
                schema: "caja",
                table: "TurnosCaja",
                columns: new[] { "UsuarioAperturaId", "Estado" });

            migrationBuilder.AddForeignKey(
                name: "FK_Pagos_TurnosCaja_TurnoCajaId",
                schema: "caja",
                table: "Pagos",
                column: "TurnoCajaId",
                principalSchema: "caja",
                principalTable: "TurnosCaja",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pagos_TurnosCaja_TurnoCajaId",
                schema: "caja",
                table: "Pagos");

            migrationBuilder.DropTable(
                name: "AplicacionesPago",
                schema: "caja");

            migrationBuilder.DropTable(
                name: "ArqueosCaja",
                schema: "caja");

            migrationBuilder.DropTable(
                name: "MovimientosCaja",
                schema: "caja");

            migrationBuilder.DropTable(
                name: "PagosDetalle",
                schema: "caja");

            migrationBuilder.DropTable(
                name: "Recibos",
                schema: "caja");

            migrationBuilder.DropTable(
                name: "ConceptosCaja",
                schema: "caja");

            migrationBuilder.DropTable(
                name: "TurnosCaja",
                schema: "caja");

            migrationBuilder.DropTable(
                name: "MetodosPago",
                schema: "caja");

            migrationBuilder.DropTable(
                name: "Cajas",
                schema: "caja");

            migrationBuilder.DropIndex(
                name: "IX_Pagos_Numero",
                schema: "caja",
                table: "Pagos");

            migrationBuilder.DropIndex(
                name: "IX_Pagos_PacienteId",
                schema: "caja",
                table: "Pagos");

            migrationBuilder.DropIndex(
                name: "IX_Pagos_TurnoCajaId",
                schema: "caja",
                table: "Pagos");

            migrationBuilder.DropColumn(
                name: "Estado",
                schema: "caja",
                table: "Pagos");

            migrationBuilder.DropColumn(
                name: "Numero",
                schema: "caja",
                table: "Pagos");

            migrationBuilder.DropColumn(
                name: "PacienteId",
                schema: "caja",
                table: "Pagos");

            migrationBuilder.DropColumn(
                name: "TurnoCajaId",
                schema: "caja",
                table: "Pagos");

            migrationBuilder.AlterColumn<string>(
                name: "MetodoPago",
                schema: "caja",
                table: "Pagos",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);
        }
    }
}
