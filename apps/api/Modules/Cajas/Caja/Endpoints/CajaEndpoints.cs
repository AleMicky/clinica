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

        group.MapGet("/", ListarAsync)
            .WithName("ListarCajas");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerCaja");

        group.MapPost("/", CrearAsync)
            .WithName("CrearCaja")
            .Validate<CreateCajaRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarCaja")
            .Validate<UpdateCajaRequest>();

        group.MapPatch("/{id:int}/activar", ActivarAsync)
            .WithName("ActivarCaja");

        group.MapPatch("/{id:int}/desactivar", DesactivarAsync)
            .WithName("DesactivarCaja");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        CajaService service,
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
        CajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ObtenerAsync(
            id,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> CrearAsync(
        CreateCajaRequest request,
        CajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/cajas/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateCajaRequest request,
        CajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ActualizarAsync(
            id,
            request,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> ActivarAsync(
        int id,
        CajaService service,
        CancellationToken cancellationToken)
    {
        await service.ActivarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> DesactivarAsync(
        int id,
        CajaService service,
        CancellationToken cancellationToken)
    {
        await service.DesactivarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }
}