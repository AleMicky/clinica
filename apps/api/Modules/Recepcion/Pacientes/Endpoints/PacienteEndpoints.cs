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

        return app;
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
}