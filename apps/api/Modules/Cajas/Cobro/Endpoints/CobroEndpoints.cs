using Clinica.Api.Modules.Cajas.Cobro.Dtos;
using Clinica.Api.Modules.Cajas.Cobro.Services;
using Clinica.Api.Shared.Constants;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Cajas.Cobro.Endpoints;

public static class CobroEndpoints
{
    public static IEndpointRouteBuilder MapCobroEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/cobros")
            .WithTags("Cobros")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync).WithName("ListarCobros");
        group.MapGet("/{id:int}", ObtenerAsync).WithName("ObtenerCobro");
        group.MapPost("/", CrearAsync)
            .WithName("CrearCobro")
            .Validate<CreateCobroRequest>();
        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarCobro")
            .Validate<UpdateCobroRequest>();
        group.MapPost("/{id:int}/anular", AnularAsync)
            .WithName("AnularCobro")
            .Validate<AnularCobroRequest>();
        group.MapDelete("/{id:int}", EliminarAsync).WithName("EliminarCobro");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        CobroService service,
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
        CobroService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateCobroRequest request,
        CobroService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"{ApiRoutes.Prefix}/cobros/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateCobroRequest request,
        CobroService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                id,
                request,
                cancellationToken));
    }

    private static async Task<IResult> AnularAsync(
        int id,
        AnularCobroRequest request,
        CobroService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.AnularAsync(
                id,
                request.MotivoAnulacion,
                cancellationToken));
    }

    private static async Task<IResult> EliminarAsync(
        int id,
        CobroService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);
        return Results.NoContent();
    }
}