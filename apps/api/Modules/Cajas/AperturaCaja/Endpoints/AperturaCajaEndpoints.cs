using Clinica.Api.Modules.Cajas.AperturaCaja.Dtos;
using Clinica.Api.Modules.Cajas.AperturaCaja.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Cajas.AperturaCaja.Endpoints;

public static class AperturaCajaEndpoints
{
    public static IEndpointRouteBuilder MapAperturaCajaEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/aperturas-caja")
            .WithTags("Aperturas de Caja")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync).WithName("ListarAperturasCaja");
        group.MapGet("/{id:int}", ObtenerAsync).WithName("ObtenerAperturaCaja");
        group.MapPost("/", CrearAsync)
            .WithName("CrearAperturaCaja")
            .Validate<CreateAperturaCajaRequest>();
        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarAperturaCaja")
            .Validate<UpdateAperturaCajaRequest>();
        group.MapDelete("/{id:int}", EliminarAsync).WithName("EliminarAperturaCaja");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        int? turnoCajaId,
        AperturaCajaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                pagination,
                search,
                turnoCajaId,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        AperturaCajaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateAperturaCajaRequest request,
        AperturaCajaService service)
    {
        var result = await service.CrearAsync(request);

        return Results.Created(
            $"/aperturas-caja/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateAperturaCajaRequest request,
        AperturaCajaService service)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                id,
                request));
    }

    private static async Task<IResult> EliminarAsync(
        int id,
        AperturaCajaService service)
    {
        await service.EliminarAsync(id);
        return Results.NoContent();
    }
}