using Clinica.Api.Modules.Almacenes.Producto.Dtos;
using Clinica.Api.Modules.Almacenes.Producto.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;
using ClosedXML.Excel;

namespace Clinica.Api.Modules.Almacenes.Producto.Endpoints;

public static class ProductoEndpoints
{
    public static IEndpointRouteBuilder MapProductoEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/productos")
            .WithTags("Productos")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarProductos");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerProducto");

        group.MapPost("/", CrearAsync)
            .WithName("CrearProducto")
            .Validate<CreateProductoRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarProducto")
            .Validate<UpdateProductoRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarProducto");

        group.MapPost(
                "/importar-excel",
                ImportarExcelAsync)
            .WithName("ImportarProductosExcel")
            .DisableAntiforgery();

        group.MapGet(
                "/plantilla-excel",
                DescargarPlantillaExcelAsync)
            .WithName("DescargarPlantillaProductosExcel");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int? categoriaProductoId,
        string? search,
        [AsParameters] PaginationRequest pagination,
        IProductoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                categoriaProductoId,
                search,
                pagination,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        IProductoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateProductoRequest request,
        IProductoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/productos/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateProductoRequest request,
        IProductoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                id,
                request,
                cancellationToken));
    }

    private static async Task<IResult> EliminarAsync(
        int id,
        IProductoService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> ImportarExcelAsync(
        IFormFile archivo,
        IProductoImportacionService service,
        CancellationToken cancellationToken)
    {
        if (archivo is null || archivo.Length == 0)
        {
            return Results.BadRequest(new
            {
                message = "Debe seleccionar un archivo Excel."
            });
        }

        var extension = Path.GetExtension(archivo.FileName);

        if (!extension.Equals(".xlsx", StringComparison.OrdinalIgnoreCase))
        {
            return Results.BadRequest(new
            {
                message = "Solo se permiten archivos Excel .xlsx."
            });
        }

        await using var stream = archivo.OpenReadStream();
        var resultado = await service.ImportarAsync(stream, cancellationToken);
        return Results.Ok(resultado);
    }

    private static IResult DescargarPlantillaExcelAsync()
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Plantilla Productos");

        string[] headers =
        [
            "CODIGO",
            "NOMBRE",
            "DESCRIPCION",
            "CATEGORIA",
            "UNIDAD_MEDIDA",
            "CONTROLA_LOTE",
            "CONTROLA_VENCIMIENTO",
            "STOCK_MINIMO",
            "STOCK_MAXIMO",
            "NUMERO_LOTE",
            "FECHA_FABRICACION",
            "FECHA_VENCIMIENTO",
            "COSTO_UNITARIO"
        ];

        for (var i = 0; i < headers.Length; i++)
        {
            var cell = worksheet.Cell(1, i + 1);
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Font.FontColor = XLColor.White;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#059669"); // Emerald
            cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        }

        // Fila 1 de ejemplo: Producto con Lote y Vencimiento
        worksheet.Cell(2, 1).Value = "MED-001";
        worksheet.Cell(2, 2).Value = "PARACETAMOL 500MG TABLETAS";
        worksheet.Cell(2, 3).Value = "CAJA CON 100 TABLETAS";
        worksheet.Cell(2, 4).Value = "MEDICAMENTOS";
        worksheet.Cell(2, 5).Value = "CAJA";
        worksheet.Cell(2, 6).Value = "SI";
        worksheet.Cell(2, 7).Value = "SI";
        worksheet.Cell(2, 8).Value = 10;
        worksheet.Cell(2, 9).Value = 500;
        worksheet.Cell(2, 10).Value = "LOT-2026-001";
        worksheet.Cell(2, 11).Value = "2026-01-15";
        worksheet.Cell(2, 12).Value = "2028-01-15";
        worksheet.Cell(2, 13).Value = 12.50;

        // Fila 2 de ejemplo: Insumo sin control de lote
        worksheet.Cell(3, 1).Value = "INS-001";
        worksheet.Cell(3, 2).Value = "GASA ESTERIL 10X10 CM";
        worksheet.Cell(3, 3).Value = "PAQUETE POR 10 UNIDADES";
        worksheet.Cell(3, 4).Value = "INSUMOS";
        worksheet.Cell(3, 5).Value = "PAQUETE";
        worksheet.Cell(3, 6).Value = "NO";
        worksheet.Cell(3, 7).Value = "NO";
        worksheet.Cell(3, 8).Value = 20;
        worksheet.Cell(3, 9).Value = 1000;
        worksheet.Cell(3, 10).Value = "";
        worksheet.Cell(3, 11).Value = "";
        worksheet.Cell(3, 12).Value = "";
        worksheet.Cell(3, 13).Value = "";

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        var content = stream.ToArray();

        return Results.File(
            content,
            contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileDownloadName: "plantilla_importacion_productos.xlsx");
    }
}

