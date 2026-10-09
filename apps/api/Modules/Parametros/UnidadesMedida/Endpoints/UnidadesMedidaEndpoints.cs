using Clinica.Api.Modules.Parametros.UnidadesMedida.Dtos;
using Clinica.Api.Modules.Parametros.UnidadesMedida.Services;
using Clinica.Api.Modules.Parametros.UnidadesMedida.Validators;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;
using ClosedXML.Excel;

namespace Clinica.Api.Modules.Parametros.UnidadesMedida.Endpoints;

public static class UnidadesMedidaEndpoints
{
    public static IEndpointRouteBuilder MapUnidadesMedidaEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/unidades-medida")
            .WithTags("Unidades de Medida")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync).WithName("ListarUnidadesMedida");
        group.MapGet("/{id:int}", ObtenerAsync).WithName("ObtenerUnidadMedida");
        group.MapPost("/", CrearAsync).WithName("CrearUnidadMedida").Validate<CreateUnidadesMedidaRequest>();
        group.MapPut("/{id:int}", ActualizarAsync).WithName("ActualizarUnidadMedida")
            .Validate<UpdateUnidadesMedidaRequest>();
        group.MapDelete("/{id:int}", EliminarAsync).WithName("EliminarUnidadMedida");

        // EXCEL ENDPOINTS
        group.MapPost(
                "/importar-excel",
                ImportarExcelAsync)
            .WithName("ImportarUnidadesMedidaExcel")
            .DisableAntiforgery();

        group.MapGet(
                "/plantilla-excel",
                DescargarPlantillaExcelAsync)
            .WithName("DescargarPlantillaUnidadesMedidaExcel");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        UnidadesMedidaService service,
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
        UnidadesMedidaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateUnidadesMedidaRequest request,
        UnidadesMedidaService service)
    {
        var result = await service.CrearAsync(request);

        return Results.Created(
            $"/unidades-medida/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateUnidadesMedidaRequest request,
        UnidadesMedidaService service)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                id,
                request));
    }

    private static async Task<IResult> EliminarAsync(
        int id,
        UnidadesMedidaService service)
    {
        await service.EliminarAsync(id);
        return Results.NoContent();
    }

    private static async Task<IResult> ImportarExcelAsync(
        IFormFile? archivo,
        IUnidadesMedidaImportacionService service,
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
        var worksheet = workbook.Worksheets.Add("Plantilla Unidades Medida");

        string[] headers =
        [
            "CODIGO",
            "NOMBRE",
            "SIMBOLO",
            "CATEGORIA"
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

        // Filas de ejemplo
        worksheet.Cell(2, 1).Value = "UND";
        worksheet.Cell(2, 2).Value = "Unidad";
        worksheet.Cell(2, 3).Value = "und";
        worksheet.Cell(2, 4).Value = "Unidad / Conteo";

        worksheet.Cell(3, 1).Value = "MG";
        worksheet.Cell(3, 2).Value = "Miligramo";
        worksheet.Cell(3, 3).Value = "mg";
        worksheet.Cell(3, 4).Value = "Masa / Peso";

        worksheet.Cell(4, 1).Value = "ML";
        worksheet.Cell(4, 2).Value = "Mililitro";
        worksheet.Cell(4, 3).Value = "ml";
        worksheet.Cell(4, 4).Value = "Volumen";

        worksheet.Cell(5, 1).Value = "COMPRIMIDO";
        worksheet.Cell(5, 2).Value = "Comprimido";
        worksheet.Cell(5, 3).Value = "comp";
        worksheet.Cell(5, 4).Value = "Forma Farmacéutica Sólida";

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        var content = stream.ToArray();

        return Results.File(
            content,
            contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileDownloadName: "plantilla_importacion_unidades_medida.xlsx");
    }
}