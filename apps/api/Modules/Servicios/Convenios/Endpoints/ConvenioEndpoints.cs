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

        MapTarifarios(group);

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

    private static void MapTarifarios(RouteGroupBuilder group)
    {
        group.MapGet("/{convenioId:int}/tarifarios", ListarTarifariosAsync)
            .WithName("ListarConvenioTarifarios");

        group.MapGet("/{convenioId:int}/tarifarios/{id:int}", ObtenerTarifarioAsync)
            .WithName("ObtenerConvenioTarifario");

        group.MapPost("/{convenioId:int}/tarifarios", CrearTarifarioAsync)
            .WithName("CrearConvenioTarifario")
            .Validate<CreateConvenioTarifarioRequest>();

        group.MapPut("/{convenioId:int}/tarifarios/{id:int}", ActualizarTarifarioAsync)
            .WithName("ActualizarConvenioTarifario")
            .Validate<UpdateConvenioTarifarioRequest>();

        group.MapDelete("/{convenioId:int}/tarifarios/{id:int}", EliminarTarifarioAsync)
            .WithName("EliminarConvenioTarifario");
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

    private static async Task<IResult> ListarTarifariosAsync(
        int convenioId,
        [AsParameters] PaginationRequest pagination,
        string? search,
        ConvenioTarifarioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                convenioId,
                pagination,
                search,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerTarifarioAsync(
        int convenioId,
        int id,
        ConvenioTarifarioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                convenioId,
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearTarifarioAsync(
        int convenioId,
        CreateConvenioTarifarioRequest request,
        ConvenioTarifarioService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            convenioId,
            request,
            cancellationToken);

        return Results.Created(
            $"/convenios/{convenioId}/tarifarios/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarTarifarioAsync(
        int convenioId,
        int id,
        UpdateConvenioTarifarioRequest request,
        ConvenioTarifarioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                convenioId,
                id,
                request,
                cancellationToken));
    }

    private static async Task<IResult> EliminarTarifarioAsync(
        int convenioId,
        int id,
        ConvenioTarifarioService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            convenioId,
            id,
            cancellationToken);

        return Results.NoContent();
    }
}
