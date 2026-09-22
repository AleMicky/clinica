using Clinica.Api.Modules.RecursosHumanos.Area.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Area.Services;
using Clinica.Api.Shared.Pagination;
using ClosedXML.Excel;

namespace Clinica.Api.Modules.RecursosHumanos.Area.Endpoints;

public static class AreaEndpoints
{
    public static IEndpointRouteBuilder MapAreaEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/areas")
            .WithTags("Áreas")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync).WithName("ListarAreas");
        group.MapGet("/arbol", ArbolAsync).WithName("ArbolAreas");
        group.MapGet("/{id:int}/subareas", SubareasAsync)
            .WithName("SubareasArea");
        group.MapGet("/{id:int}", ObtenerAsync).WithName("ObtenerArea");
        group.MapPost("/", CrearAsync).WithName("CrearArea");
        group.MapPut("/{id:int}", ActualizarAsync).WithName("ActualizarArea");
        group.MapDelete("/{id:int}", EliminarAsync).WithName("EliminarArea");

        // EXCEL ENDPOINTS
        group.MapPost(
                "/importar-excel",
                ImportarExcelAsync)
            .WithName("ImportarAreasExcel")
            .DisableAntiforgery();

        group.MapGet(
                "/plantilla-excel",
                DescargarPlantillaExcelAsync)
            .WithName("DescargarPlantillaAreasExcel");

        group.MapGet(
                "/exportar-excel",
                ExportarExcelAsync)
            .WithName("ExportarAreasExcel");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        AreaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                pagination,
                search,
                cancellationToken));
    }

    private static async Task<IResult> ArbolAsync(
        AreaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerArbolAsync(cancellationToken));
    }

    private static async Task<IResult> SubareasAsync(
        int id,
        AreaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerSubareasAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        AreaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateAreaRequest request,
        AreaService service)
    {
        var result = await service.CrearAsync(request);

        return Results.Created(
            $"/areas/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateAreaRequest request,
        AreaService service)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                id,
                request));
    }

    private static async Task<IResult> EliminarAsync(
        int id,
        AreaService service)
    {
        await service.EliminarAsync(id);
        return Results.NoContent();
    }

    private static async Task<IResult> ImportarExcelAsync(
        IFormFile? archivo,
        IAreaImportacionService service,
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
        var worksheet = workbook.Worksheets.Add("Plantilla Áreas");

        string[] headers =
        [
            "TIPO_AREA",
            "CODIGO",
            "NOMBRE",
            "DESCRIPCION",
            "AREA_PADRE",
            "ORDEN"
        ];

        for (var i = 0; i < headers.Length; i++)
        {
            var cell = worksheet.Cell(1, i + 1);
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Font.FontColor = XLColor.White;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#2563EB");
            cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        }

        // Filas de ejemplo
        worksheet.Cell(2, 1).Value = "AREA";
        worksheet.Cell(2, 2).Value = "DIR-GEN";
        worksheet.Cell(2, 3).Value = "Dirección General";
        worksheet.Cell(2, 4).Value = "Nivel organizacional principal de la clínica";
        worksheet.Cell(2, 5).Value = "";
        worksheet.Cell(2, 6).Value = 1;

        worksheet.Cell(3, 1).Value = "DEPARTAMENTO";
        worksheet.Cell(3, 2).Value = "DEP-MED";
        worksheet.Cell(3, 3).Value = "Departamento Médico";
        worksheet.Cell(3, 4).Value = "División funcional de atención médica y asistencial";
        worksheet.Cell(3, 5).Value = "DIR-GEN";
        worksheet.Cell(3, 6).Value = 2;

        worksheet.Cell(4, 1).Value = "SERVICIO";
        worksheet.Cell(4, 2).Value = "CONS-EXT";
        worksheet.Cell(4, 3).Value = "Consulta Externa";
        worksheet.Cell(4, 4).Value = "Unidad operativa de consultas especializadas";
        worksheet.Cell(4, 5).Value = "DEP-MED";
        worksheet.Cell(4, 6).Value = 3;

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        var content = stream.ToArray();

        return Results.File(
            content,
            contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileDownloadName: "plantilla_importacion_areas.xlsx");
    }

    private static async Task<IResult> ExportarExcelAsync(
        string? search,
        AreaService service,
        CancellationToken cancellationToken)
    {
        var bytes = await service.ExportarExcelAsync(search, cancellationToken);
        var filename = $"reporte_areas_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

        return Results.File(
            bytes,
            contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileDownloadName: filename);
    }
}