using Clinica.Api.Modules.RecursosHumanos.Empleado.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;
using ClosedXML.Excel;

namespace Clinica.Api.Modules.RecursosHumanos.Empleado.Endpoints;

public static class EmpleadoEndpoints
{
    public static IEndpointRouteBuilder MapEmpleadoEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/empleados")
            .WithTags("Empleados")
            .RequireAuthorization();

        // CONSULTAS
        group.MapGet("/", ListarAsync)
            .WithName("ListarEmpleados");

        group.MapGet("/base", EmpleadoBaseAsync)
            .WithName("EmpleadoBase");

        group.MapGet("/permitidos", EmpleadosPermitidosAsync)
            .WithName("EmpleadosPermitidos");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerEmpleado");

        // EMPLEADO CON PERSONA EXISTENTE
        group.MapPost("/", CrearAsync)
            .WithName("CrearEmpleado")
            .Validate<CreateEmpleadoRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarEmpleado")
            .Validate<UpdateEmpleadoRequest>();

        // EMPLEADO + PERSONA
        group.MapPost("/con-persona", CrearConPersonaAsync)
            .WithName("CrearEmpleadoConPersona")
            .Validate<EmpleadoPersonaRequest>();

        group.MapPut("/{id:int}/con-persona", ActualizarConPersonaAsync)
            .WithName("ActualizarEmpleadoConPersona")
            .Validate<EmpleadoPersonaRequest>();

        // ESTADO
        group.MapPatch("/{id:int}/activar", ActivarAsync)
            .WithName("ActivarEmpleado");

        group.MapPatch("/{id:int}/inactivar", InactivarAsync)
            .WithName("InactivarEmpleado");

        // ELIMINAR
        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarEmpleado");

        // IMPORTACIÓN EXCEL
        group.MapPost(
                "/importar-excel",
                ImportarExcelAsync)
            .WithName("ImportarEmpleadosExcel")
            .DisableAntiforgery();

        group.MapGet(
                "/plantilla-excel",
                DescargarPlantillaExcelAsync)
            .WithName("DescargarPlantillaEmpleadosExcel");

        group.MapGet(
                "/exportar-excel",
                ExportarExcelAsync)
            .WithName("ExportarEmpleadosExcel");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        EmpleadoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ListarAsync(
            pagination,
            search,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        EmpleadoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ObtenerAsync(
            id,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> EmpleadoBaseAsync(
        EmpleadoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.EmpleadoBase(
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> EmpleadosPermitidosAsync(
        EmpleadoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.EmpleadosPermitidos(
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> CrearAsync(
        CreateEmpleadoRequest request,
        EmpleadoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created($"/empleados/{result.Id}", result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateEmpleadoRequest request,
        EmpleadoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ActualizarAsync(id, request, cancellationToken);
        return Results.Ok(result);
    }

    private static async Task<IResult> CrearConPersonaAsync(
        EmpleadoPersonaRequest request,
        EmpleadoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearConPersonaAsync(
            request,
            cancellationToken);

        return Results.Created($"/empleados/{result.Id}", result);
    }

    private static async Task<IResult> ActualizarConPersonaAsync(
        int id,
        EmpleadoPersonaRequest request,
        EmpleadoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ActualizarConPersonaAsync(id, request, cancellationToken);
        return Results.Ok(result);
    }

    private static async Task<IResult> ActivarAsync(
        int id,
        EmpleadoService service,
        CancellationToken cancellationToken)
    {
        await service.ActivarAsync(id, cancellationToken);
        return Results.NoContent();
    }

    private static async Task<IResult> InactivarAsync(
        int id,
        EmpleadoService service,
        CancellationToken cancellationToken)
    {
        await service.InactivarAsync(id, cancellationToken);
        return Results.NoContent();
    }

    private static async Task<IResult> EliminarAsync(
        int id,
        EmpleadoService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(id, cancellationToken);
        return Results.NoContent();
    }

    private static async Task<IResult> ImportarExcelAsync(
        IFormFile archivo,
        IEmpleadoImportacionService service,
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
        var worksheet = workbook.Worksheets.Add("Plantilla Empleados");

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
            "DIRECCION",
            "FECHA_INGRESO",
            "CODIGO_AREA",
            "CODIGO_CARGO",
            "FECHA_INICIO_ASIGNACION",
            "OBSERVACION_ASIGNACION"
        ];

        for (var i = 0; i < headers.Length; i++)
        {
            var cell = worksheet.Cell(1, i + 1);
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Font.FontColor = XLColor.White;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#2563eb"); // Blue / Indigo
            cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        }

        // Fila de ejemplo
        worksheet.Cell(2, 1).Value = "CI";
        worksheet.Cell(2, 2).Value = "87654321";
        worksheet.Cell(2, 3).Value = "LP";
        worksheet.Cell(2, 4).Value = "";
        worksheet.Cell(2, 5).Value = "CARLOS ALBERTO";
        worksheet.Cell(2, 6).Value = "MAMANI";
        worksheet.Cell(2, 7).Value = "FLORES";
        worksheet.Cell(2, 8).Value = "1988-03-20";
        worksheet.Cell(2, 9).Value = "M";
        worksheet.Cell(2, 10).Value = "SOLTERO";
        worksheet.Cell(2, 11).Value = "78901234";
        worksheet.Cell(2, 12).Value = "AV. 6 DE AGOSTO #456";
        worksheet.Cell(2, 13).Value = "2024-01-15";
        worksheet.Cell(2, 14).Value = "ADM";
        worksheet.Cell(2, 15).Value = "REC";
        worksheet.Cell(2, 16).Value = "2024-01-15";
        worksheet.Cell(2, 17).Value = "Asignación inicial de ingreso";

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        var content = stream.ToArray();

        return Results.File(
            content,
            contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileDownloadName: "plantilla_importacion_empleados.xlsx");
    }

    private static async Task<IResult> ExportarExcelAsync(
        string? search,
        EmpleadoService service,
        CancellationToken cancellationToken)
    {
        var bytes = await service.ExportarExcelAsync(search, cancellationToken);
        var filename = $"reporte_empleados_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

        return Results.File(
            bytes,
            contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileDownloadName: filename);
    }
}