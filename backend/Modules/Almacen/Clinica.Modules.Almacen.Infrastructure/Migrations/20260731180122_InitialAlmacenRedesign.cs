using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Clinica.Modules.Almacen.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialAlmacenRedesign : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "almacen");

            migrationBuilder.CreateTable(
                name: "CategoriasProducto",
                schema: "almacen",
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
                    table.PrimaryKey("PK_CategoriasProducto", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FormasFarmaceuticas",
                schema: "almacen",
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
                    table.PrimaryKey("PK_FormasFarmaceuticas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TiposAlmacen",
                schema: "almacen",
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
                    table.PrimaryKey("PK_TiposAlmacen", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TiposMovimientoAlmacen",
                schema: "almacen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    OperacionStock = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TiposMovimientoAlmacen", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UnidadesMedida",
                schema: "almacen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Abreviatura = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    PermiteDecimales = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UnidadesMedida", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Almacenes",
                schema: "almacen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TipoAlmacenId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ResponsableEmpleadoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PermiteVenta = table.Column<bool>(type: "bit", nullable: false),
                    PermiteDispensacion = table.Column<bool>(type: "bit", nullable: false),
                    PermiteStockNegativo = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Almacenes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Almacenes_TiposAlmacen_TipoAlmacenId",
                        column: x => x.TipoAlmacenId,
                        principalSchema: "almacen",
                        principalTable: "TiposAlmacen",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Productos",
                schema: "almacen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Nombre = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CodigoBarras = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CategoriaProductoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UnidadMedidaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EsMedicamento = table.Column<bool>(type: "bit", nullable: false),
                    ManejaLote = table.Column<bool>(type: "bit", nullable: false),
                    ManejaVencimiento = table.Column<bool>(type: "bit", nullable: false),
                    ManejaSerie = table.Column<bool>(type: "bit", nullable: false),
                    StockMinimo = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false, defaultValue: 0m),
                    StockMaximo = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false, defaultValue: 0m),
                    Activo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Productos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Productos_CategoriasProducto_CategoriaProductoId",
                        column: x => x.CategoriaProductoId,
                        principalSchema: "almacen",
                        principalTable: "CategoriasProducto",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Productos_UnidadesMedida_UnidadMedidaId",
                        column: x => x.UnidadMedidaId,
                        principalSchema: "almacen",
                        principalTable: "UnidadesMedida",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InventariosFisicos",
                schema: "almacen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Numero = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AlmacenId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FechaInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaFinalizacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    Observacion = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventariosFisicos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventariosFisicos_Almacenes_AlmacenId",
                        column: x => x.AlmacenId,
                        principalSchema: "almacen",
                        principalTable: "Almacenes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MovimientosAlmacen",
                schema: "almacen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Numero = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TipoMovimientoAlmacenId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AlmacenOrigenId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AlmacenDestinoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ModuloOrigen = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    EntidadOrigen = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ReferenciaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    Observacion = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovimientosAlmacen", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MovimientosAlmacen_Almacenes_AlmacenDestinoId",
                        column: x => x.AlmacenDestinoId,
                        principalSchema: "almacen",
                        principalTable: "Almacenes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MovimientosAlmacen_Almacenes_AlmacenOrigenId",
                        column: x => x.AlmacenOrigenId,
                        principalSchema: "almacen",
                        principalTable: "Almacenes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MovimientosAlmacen_TiposMovimientoAlmacen_TipoMovimientoAlmacenId",
                        column: x => x.TipoMovimientoAlmacenId,
                        principalSchema: "almacen",
                        principalTable: "TiposMovimientoAlmacen",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SolicitudesAlmacen",
                schema: "almacen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Numero = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FechaSolicitud = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AreaSolicitanteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmpleadoSolicitanteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AlmacenId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    Observacion = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SolicitudesAlmacen", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SolicitudesAlmacen_Almacenes_AlmacenId",
                        column: x => x.AlmacenId,
                        principalSchema: "almacen",
                        principalTable: "Almacenes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TransferenciasAlmacen",
                schema: "almacen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Numero = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FechaSolicitud = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AlmacenOrigenId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AlmacenDestinoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmpleadoSolicitanteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmpleadoAprobadorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EmpleadoDespachoId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    EmpleadoRecepcionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    FechaEnvio = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FechaRecepcion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Estado = table.Column<int>(type: "int", nullable: false),
                    Observacion = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransferenciasAlmacen", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransferenciasAlmacen_Almacenes_AlmacenDestinoId",
                        column: x => x.AlmacenDestinoId,
                        principalSchema: "almacen",
                        principalTable: "Almacenes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TransferenciasAlmacen_Almacenes_AlmacenOrigenId",
                        column: x => x.AlmacenOrigenId,
                        principalSchema: "almacen",
                        principalTable: "Almacenes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MedicamentosDetalle",
                schema: "almacen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NombreGenerico = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    NombreComercial = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Concentracion = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Presentacion = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FormaFarmaceuticaId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    RequiereReceta = table.Column<bool>(type: "bit", nullable: false),
                    EsControlado = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicamentosDetalle", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MedicamentosDetalle_FormasFarmaceuticas_FormaFarmaceuticaId",
                        column: x => x.FormaFarmaceuticaId,
                        principalSchema: "almacen",
                        principalTable: "FormasFarmaceuticas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MedicamentosDetalle_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalSchema: "almacen",
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductosLote",
                schema: "almacen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AlmacenId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NumeroLote = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FechaFabricacion = table.Column<DateOnly>(type: "date", nullable: true),
                    FechaVencimiento = table.Column<DateOnly>(type: "date", nullable: true),
                    CantidadInicial = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    CantidadDisponible = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    CantidadReservada = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    CostoUnitario = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    Bloqueado = table.Column<bool>(type: "bit", nullable: false),
                    MotivoBloqueo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductosLote", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductosLote_Almacenes_AlmacenId",
                        column: x => x.AlmacenId,
                        principalSchema: "almacen",
                        principalTable: "Almacenes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductosLote_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalSchema: "almacen",
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProductosStock",
                schema: "almacen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AlmacenId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CantidadDisponible = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    CantidadReservada = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    StockMinimo = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    StockMaximo = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductosStock", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductosStock_Almacenes_AlmacenId",
                        column: x => x.AlmacenId,
                        principalSchema: "almacen",
                        principalTable: "Almacenes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductosStock_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalSchema: "almacen",
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SolicitudesAlmacenDetalle",
                schema: "almacen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SolicitudAlmacenId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CantidadSolicitada = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    CantidadAprobada = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    CantidadEntregada = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    Observacion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SolicitudesAlmacenDetalle", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SolicitudesAlmacenDetalle_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalSchema: "almacen",
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SolicitudesAlmacenDetalle_SolicitudesAlmacen_SolicitudAlmacenId",
                        column: x => x.SolicitudAlmacenId,
                        principalSchema: "almacen",
                        principalTable: "SolicitudesAlmacen",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "InventariosFisicoDetalle",
                schema: "almacen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InventarioFisicoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductoLoteId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CantidadSistema = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    CantidadContada = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    Observacion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventariosFisicoDetalle", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventariosFisicoDetalle_InventariosFisicos_InventarioFisicoId",
                        column: x => x.InventarioFisicoId,
                        principalSchema: "almacen",
                        principalTable: "InventariosFisicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InventariosFisicoDetalle_ProductosLote_ProductoLoteId",
                        column: x => x.ProductoLoteId,
                        principalSchema: "almacen",
                        principalTable: "ProductosLote",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InventariosFisicoDetalle_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalSchema: "almacen",
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MovimientosAlmacenDetalle",
                schema: "almacen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MovimientoAlmacenId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductoLoteId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Cantidad = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    CostoUnitario = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    CostoTotal = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovimientosAlmacenDetalle", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MovimientosAlmacenDetalle_MovimientosAlmacen_MovimientoAlmacenId",
                        column: x => x.MovimientoAlmacenId,
                        principalSchema: "almacen",
                        principalTable: "MovimientosAlmacen",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MovimientosAlmacenDetalle_ProductosLote_ProductoLoteId",
                        column: x => x.ProductoLoteId,
                        principalSchema: "almacen",
                        principalTable: "ProductosLote",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MovimientosAlmacenDetalle_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalSchema: "almacen",
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TransferenciasAlmacenDetalle",
                schema: "almacen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TransferenciaAlmacenId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductoId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductoLoteOrigenId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CantidadSolicitada = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    CantidadEnviada = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    CantidadRecibida = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: false),
                    Observacion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransferenciasAlmacenDetalle", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransferenciasAlmacenDetalle_ProductosLote_ProductoLoteOrigenId",
                        column: x => x.ProductoLoteOrigenId,
                        principalSchema: "almacen",
                        principalTable: "ProductosLote",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TransferenciasAlmacenDetalle_Productos_ProductoId",
                        column: x => x.ProductoId,
                        principalSchema: "almacen",
                        principalTable: "Productos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TransferenciasAlmacenDetalle_TransferenciasAlmacen_TransferenciaAlmacenId",
                        column: x => x.TransferenciaAlmacenId,
                        principalSchema: "almacen",
                        principalTable: "TransferenciasAlmacen",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Almacenes_Codigo",
                schema: "almacen",
                table: "Almacenes",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Almacenes_TipoAlmacenId",
                schema: "almacen",
                table: "Almacenes",
                column: "TipoAlmacenId");

            migrationBuilder.CreateIndex(
                name: "IX_CategoriasProducto_Codigo",
                schema: "almacen",
                table: "CategoriasProducto",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FormasFarmaceuticas_Codigo",
                schema: "almacen",
                table: "FormasFarmaceuticas",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InventariosFisicoDetalle_InventarioFisicoId",
                schema: "almacen",
                table: "InventariosFisicoDetalle",
                column: "InventarioFisicoId");

            migrationBuilder.CreateIndex(
                name: "IX_InventariosFisicoDetalle_ProductoId",
                schema: "almacen",
                table: "InventariosFisicoDetalle",
                column: "ProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_InventariosFisicoDetalle_ProductoLoteId",
                schema: "almacen",
                table: "InventariosFisicoDetalle",
                column: "ProductoLoteId");

            migrationBuilder.CreateIndex(
                name: "IX_InventariosFisicos_AlmacenId",
                schema: "almacen",
                table: "InventariosFisicos",
                column: "AlmacenId");

            migrationBuilder.CreateIndex(
                name: "IX_InventariosFisicos_Numero",
                schema: "almacen",
                table: "InventariosFisicos",
                column: "Numero",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MedicamentosDetalle_FormaFarmaceuticaId",
                schema: "almacen",
                table: "MedicamentosDetalle",
                column: "FormaFarmaceuticaId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicamentosDetalle_ProductoId",
                schema: "almacen",
                table: "MedicamentosDetalle",
                column: "ProductoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosAlmacen_AlmacenDestinoId",
                schema: "almacen",
                table: "MovimientosAlmacen",
                column: "AlmacenDestinoId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosAlmacen_AlmacenOrigenId",
                schema: "almacen",
                table: "MovimientosAlmacen",
                column: "AlmacenOrigenId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosAlmacen_Numero",
                schema: "almacen",
                table: "MovimientosAlmacen",
                column: "Numero",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosAlmacen_TipoMovimientoAlmacenId",
                schema: "almacen",
                table: "MovimientosAlmacen",
                column: "TipoMovimientoAlmacenId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosAlmacenDetalle_MovimientoAlmacenId",
                schema: "almacen",
                table: "MovimientosAlmacenDetalle",
                column: "MovimientoAlmacenId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosAlmacenDetalle_ProductoId",
                schema: "almacen",
                table: "MovimientosAlmacenDetalle",
                column: "ProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimientosAlmacenDetalle_ProductoLoteId",
                schema: "almacen",
                table: "MovimientosAlmacenDetalle",
                column: "ProductoLoteId");

            migrationBuilder.CreateIndex(
                name: "IX_Productos_CategoriaProductoId",
                schema: "almacen",
                table: "Productos",
                column: "CategoriaProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_Productos_Codigo",
                schema: "almacen",
                table: "Productos",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Productos_CodigoBarras",
                schema: "almacen",
                table: "Productos",
                column: "CodigoBarras",
                unique: true,
                filter: "[CodigoBarras] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Productos_UnidadMedidaId",
                schema: "almacen",
                table: "Productos",
                column: "UnidadMedidaId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductosLote_AlmacenId",
                schema: "almacen",
                table: "ProductosLote",
                column: "AlmacenId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductosLote_ProductoId_AlmacenId_NumeroLote",
                schema: "almacen",
                table: "ProductosLote",
                columns: new[] { "ProductoId", "AlmacenId", "NumeroLote" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductosStock_AlmacenId",
                schema: "almacen",
                table: "ProductosStock",
                column: "AlmacenId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductosStock_ProductoId_AlmacenId",
                schema: "almacen",
                table: "ProductosStock",
                columns: new[] { "ProductoId", "AlmacenId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SolicitudesAlmacen_AlmacenId",
                schema: "almacen",
                table: "SolicitudesAlmacen",
                column: "AlmacenId");

            migrationBuilder.CreateIndex(
                name: "IX_SolicitudesAlmacen_Numero",
                schema: "almacen",
                table: "SolicitudesAlmacen",
                column: "Numero",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SolicitudesAlmacenDetalle_ProductoId",
                schema: "almacen",
                table: "SolicitudesAlmacenDetalle",
                column: "ProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_SolicitudesAlmacenDetalle_SolicitudAlmacenId",
                schema: "almacen",
                table: "SolicitudesAlmacenDetalle",
                column: "SolicitudAlmacenId");

            migrationBuilder.CreateIndex(
                name: "IX_TiposAlmacen_Codigo",
                schema: "almacen",
                table: "TiposAlmacen",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TiposMovimientoAlmacen_Codigo",
                schema: "almacen",
                table: "TiposMovimientoAlmacen",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TransferenciasAlmacen_AlmacenDestinoId",
                schema: "almacen",
                table: "TransferenciasAlmacen",
                column: "AlmacenDestinoId");

            migrationBuilder.CreateIndex(
                name: "IX_TransferenciasAlmacen_AlmacenOrigenId",
                schema: "almacen",
                table: "TransferenciasAlmacen",
                column: "AlmacenOrigenId");

            migrationBuilder.CreateIndex(
                name: "IX_TransferenciasAlmacen_Numero",
                schema: "almacen",
                table: "TransferenciasAlmacen",
                column: "Numero",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TransferenciasAlmacenDetalle_ProductoId",
                schema: "almacen",
                table: "TransferenciasAlmacenDetalle",
                column: "ProductoId");

            migrationBuilder.CreateIndex(
                name: "IX_TransferenciasAlmacenDetalle_ProductoLoteOrigenId",
                schema: "almacen",
                table: "TransferenciasAlmacenDetalle",
                column: "ProductoLoteOrigenId");

            migrationBuilder.CreateIndex(
                name: "IX_TransferenciasAlmacenDetalle_TransferenciaAlmacenId",
                schema: "almacen",
                table: "TransferenciasAlmacenDetalle",
                column: "TransferenciaAlmacenId");

            migrationBuilder.CreateIndex(
                name: "IX_UnidadesMedida_Codigo",
                schema: "almacen",
                table: "UnidadesMedida",
                column: "Codigo",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InventariosFisicoDetalle",
                schema: "almacen");

            migrationBuilder.DropTable(
                name: "MedicamentosDetalle",
                schema: "almacen");

            migrationBuilder.DropTable(
                name: "MovimientosAlmacenDetalle",
                schema: "almacen");

            migrationBuilder.DropTable(
                name: "ProductosStock",
                schema: "almacen");

            migrationBuilder.DropTable(
                name: "SolicitudesAlmacenDetalle",
                schema: "almacen");

            migrationBuilder.DropTable(
                name: "TransferenciasAlmacenDetalle",
                schema: "almacen");

            migrationBuilder.DropTable(
                name: "InventariosFisicos",
                schema: "almacen");

            migrationBuilder.DropTable(
                name: "FormasFarmaceuticas",
                schema: "almacen");

            migrationBuilder.DropTable(
                name: "MovimientosAlmacen",
                schema: "almacen");

            migrationBuilder.DropTable(
                name: "SolicitudesAlmacen",
                schema: "almacen");

            migrationBuilder.DropTable(
                name: "ProductosLote",
                schema: "almacen");

            migrationBuilder.DropTable(
                name: "TransferenciasAlmacen",
                schema: "almacen");

            migrationBuilder.DropTable(
                name: "TiposMovimientoAlmacen",
                schema: "almacen");

            migrationBuilder.DropTable(
                name: "Productos",
                schema: "almacen");

            migrationBuilder.DropTable(
                name: "Almacenes",
                schema: "almacen");

            migrationBuilder.DropTable(
                name: "CategoriasProducto",
                schema: "almacen");

            migrationBuilder.DropTable(
                name: "UnidadesMedida",
                schema: "almacen");

            migrationBuilder.DropTable(
                name: "TiposAlmacen",
                schema: "almacen");
        }
    }
}
