using Clinica.Api.Modules.Cajas.DevolucionCobro.Dtos;
using Clinica.Api.Modules.Cajas.DevolucionCobro.Services;
using Clinica.Api.Shared.Constants;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Cajas.DevolucionCobro.Endpoints;

public static class DevolucionCobroEndpoints
{
    public static IEndpointRouteBuilder MapDevolucionCobroEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/devoluciones-cobro")
            .WithTags("Devoluciones de Cobro")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync).WithName("ListarDevolucionesCobro");
        group.MapGet("/{id:int}", ObtenerAsync).WithName("ObtenerDevolucionCobro");
        group.MapPost("/", CrearAsync)
            .WithName("CrearDevolucionCobro")
            .Validate<CreateDevolucionCobroRequest>();
        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarDevolucionCobro")
            .Validate<UpdateDevolucionCobroRequest>();
        group.MapDelete("/{id:int}", EliminarAsync).WithName("EliminarDevolucionCobro");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        DevolucionCobroService service,
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
        DevolucionCobroService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateDevolucionCobroRequest request,
        DevolucionCobroService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"{ApiRoutes.Prefix}/devoluciones-cobro/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateDevolucionCobroRequest request,
        DevolucionCobroService service,
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
        DevolucionCobroService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);
        return Results.NoContent();
    }
}