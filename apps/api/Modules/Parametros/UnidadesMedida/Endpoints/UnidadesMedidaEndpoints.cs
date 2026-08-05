using Clinica.Api.Modules.Parametros.UnidadesMedida.Dtos;
using Clinica.Api.Modules.Parametros.UnidadesMedida.Services;
using Clinica.Api.Shared.Pagination;

namespace Clinica.Api.Modules.Parametros.UnidadesMedida.Endpoints;

public static class UnidadesMedidaEndpoints
{
    public static IEndpointRouteBuilder MapUnidadesMedidaEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/unidades-medida")
            .WithTags("Unidades de Medida")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync).WithName("ListarUnidadesMedida");
        group.MapGet("/{id:int}", ObtenerAsync).WithName("ObtenerUnidadMedida");
        group.MapPost("/", CrearAsync).WithName("CrearUnidadMedida");
        group.MapPut("/{id:int}", ActualizarAsync).WithName("ActualizarUnidadMedida");
        group.MapDelete("/{id:int}", EliminarAsync).WithName("EliminarUnidadMedida");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        UnidadesMedidaService service,
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
        UnidadesMedidaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateUnidadesMedidaRequest request,
        UnidadesMedidaService service)
    {
        var result = await service.CrearAsync(request);

        return Results.Created(
            $"/unidades-medida/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateUnidadesMedidaRequest request,
        UnidadesMedidaService service)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                id,
                request));
    }

    private static async Task<IResult> EliminarAsync(
        int id,
        UnidadesMedidaService service)
    {
        await service.EliminarAsync(id);
        return Results.NoContent();
    }
}