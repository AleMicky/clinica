using Clinica.Api.Modules.Recepcion.Pacientes.Dtos;
using Clinica.Api.Modules.Recepcion.Pacientes.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

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
}