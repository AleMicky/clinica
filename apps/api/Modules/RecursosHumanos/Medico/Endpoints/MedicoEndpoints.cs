using Clinica.Api.Modules.RecursosHumanos.Medico.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Medico.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;
using ClosedXML.Excel;

namespace Clinica.Api.Modules.RecursosHumanos.Medico.Endpoints;

public static class MedicoEndpoints
{
    public static IEndpointRouteBuilder MapMedicoEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/medicos")
            .WithTags("Médicos")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarMedicos");

        group.MapGet("/{medicoId:int}", ObtenerAsync)
            .WithName("ObtenerMedico");

        group.MapPost("/", CrearAsync)
            .WithName("CrearMedico")
            .Validate<CreateMedicoRequest>();

        group.MapPut("/{medicoId:int}", ActualizarAsync)
            .WithName("ActualizarMedico")
            .Validate<UpdateMedicoRequest>();

        group.MapDelete("/{medicoId:int}", EliminarAsync)
            .WithName("EliminarMedico");

        // IMPORTACIÓN Y EXPORTACIÓN EXCEL
        group.MapPost("/importar-excel", ImportarExcelAsync)
            .WithName("ImportarMedicosExcel")
            .DisableAntiforgery();

        group.MapGet("/plantilla-excel", DescargarPlantillaExcelAsync)
            .WithName("DescargarPlantillaMedicosExcel");

        group.MapGet("/exportar-excel", ExportarExcelAsync)
            .WithName("ExportarMedicosExcel");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int? empleadoId,
        [AsParameters] PaginationRequest pagination,
        string? search,
        MedicoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                empleadoId,
                pagination,
                search,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int medicoId,
        MedicoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                medicoId,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateMedicoRequest request,
        MedicoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/medicos/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int medicoId,
        UpdateMedicoRequest request,
        MedicoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                medicoId,
                request,
                cancellationToken));
    }

    private static async Task<IResult> EliminarAsync(
        int medicoId,
        MedicoService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            medicoId,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> ImportarExcelAsync(
        IFormFile archivo,
        IMedicoImportacionService service,
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
        var worksheet = workbook.Worksheets.Add("Plantilla Médicos");

        string[] headers =
        [
            "CODIGO_EMPLEADO",
            "MATRICULA_PROFESIONAL",
            "REGISTRO_MINISTERIO_SALUD",
            "ESPECIALIDAD_PRINCIPAL",
            "OTRAS_ESPECIALIDADES",
            "CODIGO_SERVICIO",
            "IMPORTE_SERVICIO",
            "IMPORTE_MEDICO",
            "IMPORTE_CLINICA",
            "FECHA_INICIO_ACUERDO",
            "FECHA_FIN_ACUERDO"
        ];

        for (var i = 0; i < headers.Length; i++)
        {
            var cell = worksheet.Cell(1, i + 1);
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Font.FontColor = XLColor.White;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#0284c7"); // Light Blue / Cyan
            cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        }

        // Fila de ejemplo
        worksheet.Cell(2, 1).Value = "CQ-00001";
        worksheet.Cell(2, 2).Value = "MP-9842";
        worksheet.Cell(2, 3).Value = "RMS-3021";
        worksheet.Cell(2, 4).Value = "CARDIOLOGÍA";
        worksheet.Cell(2, 5).Value = "MEDICINA INTERNA";
        worksheet.Cell(2, 6).Value = "CONS-ESP";
        worksheet.Cell(2, 7).Value = 150;
        worksheet.Cell(2, 8).Value = 100;
        worksheet.Cell(2, 9).Value = 50;
        worksheet.Cell(2, 10).Value = "2024-01-10";
        worksheet.Cell(2, 11).Value = "";

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        var content = stream.ToArray();

        return Results.File(
            content,
            contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileDownloadName: "plantilla_importacion_medicos.xlsx");
    }

    private static async Task<IResult> ExportarExcelAsync(
        string? search,
        int? empleadoId,
        MedicoService service,
        CancellationToken cancellationToken)
    {
        var bytes = await service.ExportarExcelAsync(search, empleadoId, cancellationToken);
        var filename = $"reporte_medicos_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

        return Results.File(
            bytes,
            contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileDownloadName: filename);
    }
}