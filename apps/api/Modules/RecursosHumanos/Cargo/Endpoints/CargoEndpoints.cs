using Clinica.Api.Modules.RecursosHumanos.Cargo.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Cargo.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

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
}