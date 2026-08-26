using Clinica.Api.Modules.Recepcion.Pacientes.Dtos;
using Clinica.Api.Modules.Recepcion.Pacientes.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;
using ClosedXML.Excel;

namespace Clinica.Api.Modules.Recepcion.Pacientes.Endpoints;

public static class PacienteEndpoints
{
    public static IEndpointRouteBuilder MapPacienteEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/pacientes")
            .WithTags("Pacientes")
            .RequireAuthorization();

        MapConvenios(group);

        group.MapGet("/", ListarAsync)
            .WithName("ListarPacientes");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerPaciente");

        group.MapPost("/", CrearAsync)
            .WithName("CrearPaciente")
            .Validate<CreatePacienteRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarPaciente")
            .Validate<UpdatePacienteRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarPaciente");

        group.MapPost(
                "/importar-excel",
                ImportarExcelAsync)
            .WithName("ImportarPacientesExcel")
            .DisableAntiforgery();

        group.MapGet(
                "/plantilla-excel",
                DescargarPlantillaExcelAsync)
            .WithName("DescargarPlantillaPacientesExcel");

        return app;
    }

    private static void MapConvenios(RouteGroupBuilder group)
    {
        group.MapGet("/{pacienteId:int}/convenios", ListarConveniosAsync)
            .WithName("ListarPacienteConvenios");

        group.MapGet("/{pacienteId:int}/convenios/{id:int}", ObtenerConvenioAsync)
            .WithName("ObtenerPacienteConvenio");

        group.MapPost("/{pacienteId:int}/convenios", CrearConvenioAsync)
            .WithName("CrearPacienteConvenio")
            .Validate<CreatePacienteConvenioRequest>();

        group.MapPut("/{pacienteId:int}/convenios/{id:int}", ActualizarConvenioAsync)
            .WithName("ActualizarPacienteConvenio")
            .Validate<UpdatePacienteConvenioRequest>();

        group.MapDelete("/{pacienteId:int}/convenios/{id:int}", EliminarConvenioAsync)
            .WithName("EliminarPacienteConvenio");
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        PacienteService service,
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
        PacienteService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreatePacienteRequest request,
        PacienteService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.CreatedAtRoute(
            routeName: "ObtenerPaciente",
            routeValues: new
            {
                id = result.Id
            },
            value: result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdatePacienteRequest request,
        PacienteService service,
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
        PacienteService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> ListarConveniosAsync(
        int pacienteId,
        [AsParameters] PaginationRequest pagination,
        string? search,
        PacienteConvenioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                pacienteId,
                pagination,
                search,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerConvenioAsync(
        int pacienteId,
        int id,
        PacienteConvenioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                pacienteId,
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearConvenioAsync(
        int pacienteId,
        CreatePacienteConvenioRequest request,
        PacienteConvenioService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            pacienteId,
            request,
            cancellationToken);

        return Results.CreatedAtRoute(
            routeName: "ObtenerPacienteConvenio",
            routeValues: new
            {
                pacienteId,
                id = result.Id
            },
            value: result);
    }

    private static async Task<IResult> ActualizarConvenioAsync(
        int pacienteId,
        int id,
        UpdatePacienteConvenioRequest request,
        PacienteConvenioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                pacienteId,
                id,
                request,
                cancellationToken));
    }

    private static async Task<IResult> EliminarConvenioAsync(
        int pacienteId,
        int id,
        PacienteConvenioService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            pacienteId,
            id,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> ImportarExcelAsync(IFormFile archivo, IPacienteImportacionService service,
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
        var worksheet = workbook.Worksheets.Add("Plantilla Pacientes");

        string[] headers =
        [
            "TIPO_DOCUMENTO",
            "NUMERO_DOCUMENTO",
            "EXTENSION_DOCUMENTO",
            "COMPLEMENTO_DOCUMENTO",
            "NOMBRES",
            "APELLIDO_PATERNO",
            "APELLIDO_MATERNO",
            "FECHA_NACIMIENTO",
            "GENERO",
            "ESTADO_CIVIL",
            "TELEFONO",
            "DIRECCION"
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

        // Fila de ejemplo
        worksheet.Cell(2, 1).Value = "CI";
        worksheet.Cell(2, 2).Value = "12345678";
        worksheet.Cell(2, 3).Value = "LP";
        worksheet.Cell(2, 4).Value = "";
        worksheet.Cell(2, 5).Value = "JUAN CARLOS";
        worksheet.Cell(2, 6).Value = "PEREZ";
        worksheet.Cell(2, 7).Value = "GOMEZ";
        worksheet.Cell(2, 8).Value = "1990-05-15";
        worksheet.Cell(2, 9).Value = "M";
        worksheet.Cell(2, 10).Value = "SOLTERO";
        worksheet.Cell(2, 11).Value = "71234567";
        worksheet.Cell(2, 12).Value = "AV. PRINCIPAL #123";

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        var content = stream.ToArray();

        return Results.File(
            content,
            contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileDownloadName: "plantilla_importacion_pacientes.xlsx");
    }
}