using Clinica.Api.Modules.Servicios.Convenios.Dtos;
using Clinica.Api.Modules.Servicios.Convenios.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Servicios.Convenios.Endpoints;

public static class ConvenioEndpoints
{
    public static IEndpointRouteBuilder MapConvenioEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/convenios")
            .WithTags("Convenios")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarConvenios");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerConvenio");

        group.MapPost("/", CrearAsync)
            .WithName("CrearConvenio")
            .Validate<CreateConvenioRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarConvenio")
            .Validate<UpdateConvenioRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarConvenio");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        ConvenioService service,
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
        ConvenioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateConvenioRequest request,
        ConvenioService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/convenios/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateConvenioRequest request,
        ConvenioService service,
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
        ConvenioService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }
}
