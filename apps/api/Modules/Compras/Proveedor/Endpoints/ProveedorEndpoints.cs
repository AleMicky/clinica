using Clinica.Api.Modules.Compras.Proveedor.Dtos;
using Clinica.Api.Modules.Compras.Proveedor.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;
using ClosedXML.Excel;

namespace Clinica.Api.Modules.Compras.Proveedor.Endpoints;

public static class ProveedorEndpoints
{
    public static IEndpointRouteBuilder MapProveedorEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/proveedores")
            .WithTags("Proveedores")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarProveedores");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerProveedor");

        group.MapPost("/", CrearAsync)
            .WithName("CrearProveedor")
            .Validate<CreateProveedorRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarProveedor")
            .Validate<UpdateProveedorRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarProveedor");

        group.MapPost("/importar-excel", ImportarExcelAsync)
            .WithName("ImportarProveedoresExcel")
            .DisableAntiforgery();

        group.MapGet("/plantilla-excel", DescargarPlantillaExcelAsync)
            .WithName("DescargarPlantillaProveedoresExcel");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        string? search,
        [AsParameters] PaginationRequest pagination,
        IProveedorService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                search,
                pagination,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        IProveedorService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateProveedorRequest request,
        IProveedorService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/proveedores/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateProveedorRequest request,
        IProveedorService service,
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
        IProveedorService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> ImportarExcelAsync(
        IFormFile archivo,
        IProveedorImportacionService service,
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
        var worksheet = workbook.Worksheets.Add("Plantilla Proveedores");

        string[] headers =
        [
            "CODIGO",
            "RAZON_SOCIAL",
            "NOMBRE_COMERCIAL",
            "NIT",
            "DIRECCION",
            "TELEFONO",
            "CELULAR",
            "EMAIL",
            "CONTACTO",
            "OBSERVACION"
        ];

        for (var i = 0; i < headers.Length; i++)
        {
            var cell = worksheet.Cell(1, i + 1);
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Font.FontColor = XLColor.White;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#2563EB"); // Blue / Primary
            cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        }

        // Fila 1 de ejemplo: Proveedor de medicamentos completo
        worksheet.Cell(2, 1).Value = "PROV-001";
        worksheet.Cell(2, 2).Value = "DROGUERIA INTI S.A.";
        worksheet.Cell(2, 3).Value = "INTI FARMACEUTICA";
        worksheet.Cell(2, 4).Value = "1020304050";
        worksheet.Cell(2, 5).Value = "Av. Principal Nro 123, Zona Central";
        worksheet.Cell(2, 6).Value = "22445566";
        worksheet.Cell(2, 7).Value = "77889900";
        worksheet.Cell(2, 8).Value = "ventas@inti.com.bo";
        worksheet.Cell(2, 9).Value = "Lic. Carlos Mendoza";
        worksheet.Cell(2, 10).Value = "Distribuidor mayorista de medicamentos";

        // Fila 2 de ejemplo: Proveedor de insumos y equipos
        worksheet.Cell(3, 1).Value = "PROV-002";
        worksheet.Cell(3, 2).Value = "BIOMEDICAL SYSTEMS S.R.L.";
        worksheet.Cell(3, 3).Value = "BIOMEDICAL";
        worksheet.Cell(3, 4).Value = "9876543210";
        worksheet.Cell(3, 5).Value = "Calle 5 de Calacoto #45";
        worksheet.Cell(3, 6).Value = "27894561";
        worksheet.Cell(3, 7).Value = "71234567";
        worksheet.Cell(3, 8).Value = "contacto@biomedical.com";
        worksheet.Cell(3, 9).Value = "Dra. Patricia Aguilar";
        worksheet.Cell(3, 10).Value = "Proveedor de insumos quirúrgicos y mantenimiento";

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        var content = stream.ToArray();

        return Results.File(
            content,
            contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileDownloadName: "plantilla_importacion_proveedores.xlsx");
    }
}
