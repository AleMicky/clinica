using Clinica.Api.Modules.RecursosHumanos.Empleado.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Services;
using Clinica.Api.Shared.Pagination;

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

        group.MapGet("/", ListarAsync).WithName("ListarEmpleados");
        group.MapGet("/{id:int}", ObtenerAsync).WithName("ObtenerEmpleado");
        group.MapPost("/", CrearAsync).WithName("CrearEmpleado");
        group.MapPut("/{id:int}", ActualizarAsync).WithName("ActualizarEmpleado");
        group.MapDelete("/{id:int}", EliminarAsync).WithName("EliminarEmpleado");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        EmpleadoService service,
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
        EmpleadoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateEmpleadoRequest request,
        EmpleadoService service)
    {
        var result = await service.CrearAsync(request);

        return Results.Created(
            $"/empleados/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateEmpleadoRequest request,
        EmpleadoService service)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                id,
                request));
    }

    private static async Task<IResult> EliminarAsync(
        int id,
        EmpleadoService service)
    {
        await service.EliminarAsync(id);
        return Results.NoContent();
    }
}