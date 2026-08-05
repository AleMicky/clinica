using Clinica.Api.Modules.Parametros.Moneda.Dtos;
using Clinica.Api.Modules.Parametros.Moneda.Services;
using Clinica.Api.Shared.Pagination;

namespace Clinica.Api.Modules.Parametros.Moneda.Endpoints;

public static class MonedaEndpoints
{
    public static IEndpointRouteBuilder MapMonedaEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/monedas")
            .WithTags("Monedas")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync).WithName("ListarMonedas");
        group.MapGet("/{id:int}", ObtenerAsync).WithName("ObtenerMoneda");
        group.MapPost("/", CrearAsync).WithName("CrearMoneda");
        group.MapPut("/{id:int}", ActualizarAsync).WithName("ActualizarMoneda");
        group.MapDelete("/{id:int}", EliminarAsync).WithName("EliminarMoneda");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        MonedaService service,
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
        MonedaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateMonedaRequest request,
        MonedaService service)
    {
        var result = await service.CrearAsync(request);

        return Results.Created(
            $"/monedas/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateMonedaRequest request,
        MonedaService service)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                id,
                request));
    }

    private static async Task<IResult> EliminarAsync(
        int id,
        MonedaService service)
    {
        await service.EliminarAsync(id);
        return Results.NoContent();
    }
}