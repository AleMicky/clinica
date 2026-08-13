using Clinica.Api.Modules.Cajas.Caja.Dtos;
using Clinica.Api.Modules.Cajas.Caja.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Cajas.Caja.Endpoints;

public static class CajaEndpoints
{
    public static IEndpointRouteBuilder MapCajaEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/cajas")
            .WithTags("Cajas")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync).WithName("ListarCajas");
        group.MapGet("/{id:int}", ObtenerAsync).WithName("ObtenerCaja");
        group.MapPost("/", CrearAsync)
            .WithName("CrearCaja")
            .Validate<CreateCajaRequest>();
        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarCaja")
            .Validate<UpdateCajaRequest>();
        group.MapDelete("/{id:int}", EliminarAsync).WithName("EliminarCaja");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        CajaService service,
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
        CajaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateCajaRequest request,
        CajaService service)
    {
        var result = await service.CrearAsync(request);

        return Results.Created(
            $"/cajas/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateCajaRequest request,
        CajaService service)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                id,
                request));
    }

    private static async Task<IResult> EliminarAsync(
        int id,
        CajaService service)
    {
        await service.EliminarAsync(id);
        return Results.NoContent();
    }
}
