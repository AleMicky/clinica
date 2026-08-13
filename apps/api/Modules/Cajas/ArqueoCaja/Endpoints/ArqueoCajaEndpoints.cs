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

        group.MapGet("/", ListarAsync).WithName("ListarArqueosCaja");
        group.MapGet("/{id:int}", ObtenerAsync).WithName("ObtenerArqueoCaja");
        group.MapPost("/", CrearAsync)
            .WithName("CrearArqueoCaja")
            .Validate<CreateArqueoCajaRequest>();
        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarArqueoCaja")
            .Validate<UpdateArqueoCajaRequest>();
        group.MapDelete("/{id:int}", EliminarAsync).WithName("EliminarArqueoCaja");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        ArqueoCajaService service,
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
        ArqueoCajaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateArqueoCajaRequest request,
        ArqueoCajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"{ApiRoutes.Prefix}/arqueos-caja/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateArqueoCajaRequest request,
        ArqueoCajaService service,
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
        ArqueoCajaService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);
        return Results.NoContent();
    }
}