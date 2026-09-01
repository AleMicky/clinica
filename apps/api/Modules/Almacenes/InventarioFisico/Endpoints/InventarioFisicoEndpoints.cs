using Clinica.Api.Modules.Almacenes.InventarioFisico.Dtos;
using Clinica.Api.Modules.Almacenes.InventarioFisico.Enums;
using Clinica.Api.Modules.Almacenes.InventarioFisico.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Almacenes.InventarioFisico.Endpoints;

public static class InventarioFisicoEndpoints
{
    public static IEndpointRouteBuilder MapInventarioFisicoEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/inventarios-fisicos")
            .WithTags("Inventarios Físicos")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarInventariosFisicos");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerInventarioFisico");

        group.MapPost("/", CrearAsync)
            .WithName("CrearInventarioFisico")
            .Validate<CreateInventarioFisicoRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarInventarioFisico")
            .Validate<UpdateInventarioFisicoRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarInventarioFisico");

        group.MapPost("/{id:int}/iniciar-conteo", IniciarConteoAsync)
            .WithName("IniciarConteoInventarioFisico");

        group.MapPost("/{id:int}/registrar-conteo", RegistrarConteoAsync)
            .WithName("RegistrarConteoInventarioFisico")
            .Validate<RegistrarConteoInventarioFisicoRequest>();

        group.MapPost("/{id:int}/cerrar", CerrarAsync)
            .WithName("CerrarInventarioFisico");

        group.MapPost("/{id:int}/anular", AnularAsync)
            .WithName("AnularInventarioFisico")
            .Validate<AnularInventarioFisicoRequest>();

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int? almacenId,
        EstadoInventarioFisico? estado,
        string? search,
        [AsParameters] PaginationRequest pagination,
        IInventarioFisicoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                almacenId,
                estado,
                search,
                pagination,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        IInventarioFisicoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateInventarioFisicoRequest request,
        IInventarioFisicoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/inventarios-fisicos/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateInventarioFisicoRequest request,
        IInventarioFisicoService service,
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
        IInventarioFisicoService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> IniciarConteoAsync(
        int id,
        IInventarioFisicoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.IniciarConteoAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> RegistrarConteoAsync(
        int id,
        RegistrarConteoInventarioFisicoRequest request,
        IInventarioFisicoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.RegistrarConteoAsync(
                id,
                request,
                cancellationToken));
    }

    private static async Task<IResult> CerrarAsync(
        int id,
        IInventarioFisicoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.CerrarAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> AnularAsync(
        int id,
        AnularInventarioFisicoRequest request,
        IInventarioFisicoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.AnularAsync(
                id,
                request,
                cancellationToken));
    }
}