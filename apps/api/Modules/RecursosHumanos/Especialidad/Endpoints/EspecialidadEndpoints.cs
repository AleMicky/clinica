using Clinica.Api.Modules.RecursosHumanos.Especialidad.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Especialidad.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;
using ClosedXML.Excel;

namespace Clinica.Api.Modules.RecursosHumanos.Especialidad.Endpoints;

public static class EspecialidadEndpoints
{
    public static IEndpointRouteBuilder MapEspecialidadEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/especialidades")
            .WithTags("Especialidades")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarEspecialidades");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerEspecialidad");

        group.MapPost("/", CrearAsync)
            .WithName("CrearEspecialidad")
            .Validate<CreateEspecialidadRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarEspecialidad")
            .Validate<UpdateEspecialidadRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarEspecialidad");

        // EXCEL ENDPOINTS
        group.MapPost(
                "/importar-excel",
                ImportarExcelAsync)
            .WithName("ImportarEspecialidadesExcel")
            .DisableAntiforgery();

        group.MapGet(
                "/plantilla-excel",
                DescargarPlantillaExcelAsync)
            .WithName("DescargarPlantillaEspecialidadesExcel");

        group.MapGet(
                "/exportar-excel",
                ExportarExcelAsync)
            .WithName("ExportarEspecialidadesExcel");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        EspecialidadService service,
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
        EspecialidadService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateEspecialidadRequest request,
        EspecialidadService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/especialidades/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateEspecialidadRequest request,
        EspecialidadService service,
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
        EspecialidadService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> ImportarExcelAsync(
        IFormFile? archivo,
        IEspecialidadImportacionService service,
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
        var worksheet = workbook.Worksheets.Add("Plantilla Especialidades");

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
        worksheet.Cell(2, 1).Value = "PED";
        worksheet.Cell(2, 2).Value = "Pediatría";
        worksheet.Cell(2, 3).Value = "Atención médica integral en salud infantil y del adolescente";

        worksheet.Cell(3, 1).Value = "CARDIO";
        worksheet.Cell(3, 2).Value = "Cardiología";
        worksheet.Cell(3, 3).Value = "Diagnóstico y tratamiento de enfermedades cardiovasculares";

        worksheet.Cell(4, 1).Value = "GIN-OBS";
        worksheet.Cell(4, 2).Value = "Ginecología y Obstetricia";
        worksheet.Cell(4, 3).Value = "Salud reproductiva femenina, control prenatal y partos";

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        var content = stream.ToArray();

        return Results.File(
            content,
            contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileDownloadName: "plantilla_importacion_especialidades.xlsx");
    }

    private static async Task<IResult> ExportarExcelAsync(
        string? search,
        EspecialidadService service,
        CancellationToken cancellationToken)
    {
        var bytes = await service.ExportarExcelAsync(search, cancellationToken);
        var filename = $"reporte_especialidades_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

        return Results.File(
            bytes,
            contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileDownloadName: filename);
    }
}
