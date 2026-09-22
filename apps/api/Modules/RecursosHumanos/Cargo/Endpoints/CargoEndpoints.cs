using Clinica.Api.Modules.RecursosHumanos.Cargo.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Cargo.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;
using ClosedXML.Excel;

namespace Clinica.Api.Modules.RecursosHumanos.Cargo.Endpoints;

public static class CargoEndpoints
{
    public static IEndpointRouteBuilder MapCargoEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/cargos")
            .WithTags("Cargos")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync).WithName("ListarCargos");
        group.MapGet("/{id:int}", ObtenerAsync).WithName("ObtenerCargo");
        group.MapPost("/", CrearAsync)
            .WithName("CrearCargo")
            .Validate<CreateCargoRequest>();
        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarCargo")
            .Validate<UpdateCargoRequest>();
        group.MapDelete("/{id:int}", EliminarAsync).WithName("EliminarCargo");

        // EXCEL ENDPOINTS
        group.MapPost(
                "/importar-excel",
                ImportarExcelAsync)
            .WithName("ImportarCargosExcel")
            .DisableAntiforgery();

        group.MapGet(
                "/plantilla-excel",
                DescargarPlantillaExcelAsync)
            .WithName("DescargarPlantillaCargosExcel");

        group.MapGet(
                "/exportar-excel",
                ExportarExcelAsync)
            .WithName("ExportarCargosExcel");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        CargoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                pagination,
                search,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        CargoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateCargoRequest request,
        CargoService service)
    {
        var result = await service.CrearAsync(request);

        return Results.Created(
            $"/cargos/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateCargoRequest request,
        CargoService service)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                id,
                request));
    }

    private static async Task<IResult> EliminarAsync(
        int id,
        CargoService service)
    {
        await service.EliminarAsync(id);
        return Results.NoContent();
    }

    private static async Task<IResult> ImportarExcelAsync(
        IFormFile? archivo,
        ICargoImportacionService service,
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
        var worksheet = workbook.Worksheets.Add("Plantilla Cargos");

        string[] headers =
        [
            "CODIGO",
            "NOMBRE",
            "DESCRIPCION"
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
        worksheet.Cell(2, 1).Value = "MED-GRAL";
        worksheet.Cell(2, 2).Value = "Médico General";
        worksheet.Cell(2, 3).Value = "Atención médica integral en consulta externa";

        worksheet.Cell(3, 1).Value = "ENF-JEFE";
        worksheet.Cell(3, 2).Value = "Enfermero/a Jefe";
        worksheet.Cell(3, 3).Value = "Coordinación y supervisión del área de enfermería";

        worksheet.Cell(4, 1).Value = "RECEPCION";
        worksheet.Cell(4, 2).Value = "Recepcionista Clínico";
        worksheet.Cell(4, 3).Value = "Atención al paciente, admisión y caja";

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        var content = stream.ToArray();

        return Results.File(
            content,
            contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileDownloadName: "plantilla_importacion_cargos.xlsx");
    }

    private static async Task<IResult> ExportarExcelAsync(
        string? search,
        CargoService service,
        CancellationToken cancellationToken)
    {
        var bytes = await service.ExportarExcelAsync(search, cancellationToken);
        var filename = $"reporte_cargos_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

        return Results.File(
            bytes,
            contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileDownloadName: filename);
    }
}