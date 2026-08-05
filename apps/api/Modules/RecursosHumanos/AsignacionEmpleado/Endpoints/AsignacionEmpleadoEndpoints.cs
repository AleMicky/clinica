using Clinica.Api.Modules.RecursosHumanos.AsignacionEmpleado.Dtos;
using Clinica.Api.Modules.RecursosHumanos.AsignacionEmpleado.Services;
using Clinica.Api.Shared.Pagination;

namespace Clinica.Api.Modules.RecursosHumanos.AsignacionEmpleado.Endpoints;

public static class AsignacionEmpleadoEndpoints
{
    public static IEndpointRouteBuilder MapAsignacionEmpleadoEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/asignaciones-empleado")
            .WithTags("Asignaciones de Empleado")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarAsignacionesEmpleado");
        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerAsignacionEmpleado");
        group.MapPost("/", CrearAsync)
            .WithName("CrearAsignacionEmpleado");
        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarAsignacionEmpleado");
        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarAsignacionEmpleado");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        AsignacionEmpleadoService service,
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
        AsignacionEmpleadoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateAsignacionEmpleadoRequest request,
        AsignacionEmpleadoService service)
    {
        var result = await service.CrearAsync(request);

        return Results.Created(
            $"/asignaciones-empleado/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateAsignacionEmpleadoRequest request,
        AsignacionEmpleadoService service)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                id,
                request));
    }

    private static async Task<IResult> EliminarAsync(
        int id,
        AsignacionEmpleadoService service)
    {
        await service.EliminarAsync(id);
        return Results.NoContent();
    }
}