using Clinica.Api.Modules.Parametros.MetodoPago.Dtos;
using Clinica.Api.Modules.Parametros.MetodoPago.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Parametros.MetodoPago.Endpoints;

public static class MetodoPagoEndpoints
{
    public static IEndpointRouteBuilder MapMetodoPagoEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/metodos-pago")
            .WithTags("Métodos de Pago")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync).WithName("ListarMetodosPago");
        group.MapGet("/{id:int}", ObtenerAsync).WithName("ObtenerMetodoPago");
        group.MapPost("/", CrearAsync)
            .WithName("CrearMetodoPago")
            .Validate<CreateMetodoPagoRequest>();
        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarMetodoPago")
            .Validate<UpdateMetodoPagoRequest>();
        group.MapDelete("/{id:int}", EliminarAsync).WithName("EliminarMetodoPago");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        MetodoPagoService service,
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
        MetodoPagoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateMetodoPagoRequest request,
        MetodoPagoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/metodos-pago/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateMetodoPagoRequest request,
        MetodoPagoService service,
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
        MetodoPagoService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }
}
