using Clinica.Api.Modules.Cajas.ArqueoCaja.Dtos;
using Clinica.Api.Modules.Cajas.ArqueoCaja.Services;
using Clinica.Api.Shared.Constants;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Cajas.ArqueoCaja.Endpoints;

public static class ArqueoCajaEndpoints
{
    public static IEndpointRouteBuilder MapArqueoCajaEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/arqueos-caja")
            .WithTags("Arqueos de Caja")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarArqueosCaja");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerArqueoCaja");

        group.MapGet(
                "/turnos/{turnoCajaId:int}/resumen",
                ObtenerResumenAsync)
            .WithName("ObtenerResumenArqueoCaja");

        group.MapPost("/", RegistrarAsync)
            .WithName("RegistrarArqueoCaja")
            .Validate<RegistrarArqueoCajaRequest>();

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        ArqueoCajaService service,
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
        ArqueoCajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ObtenerAsync(
            id,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> ObtenerResumenAsync(
        int turnoCajaId,
        ArqueoCajaService service,
        CancellationToken cancellationToken)
    {
        var result =
            await service.ObtenerResumenAsync(
                turnoCajaId,
                cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> RegistrarAsync(
        RegistrarArqueoCajaRequest request,
        ArqueoCajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.RegistrarAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"{ApiRoutes.Prefix}/arqueos-caja/{result.Id}",
            result);
    }
}