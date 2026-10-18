using Clinica.Api.Modules.Cajas.MovimientoCaja.Dtos;
using Clinica.Api.Modules.Cajas.MovimientoCaja.Services;
using Clinica.Api.Shared.Constants;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Cajas.MovimientoCaja.Endpoints;

public static class ConceptoMovimientoCajaEndpoints
{
    public static IEndpointRouteBuilder MapConceptoMovimientoCajaEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/movimientos-caja/conceptos")
            .WithTags("Conceptos de Movimiento de Caja")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarConceptosMovimientoCaja");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerConceptoMovimientoCaja");

        group.MapPost("/", CrearAsync)
            .WithName("CrearConceptoMovimientoCaja")
            .Validate<CreateConceptoMovimientoCajaRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarConceptoMovimientoCaja")
            .Validate<UpdateConceptoMovimientoCajaRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarConceptoMovimientoCaja");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int? tipoMovimientoCajaId,
        MovimientoCajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ListarConceptosAsync(
            tipoMovimientoCajaId,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        MovimientoCajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ObtenerConceptoAsync(
            id,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> CrearAsync(
        CreateConceptoMovimientoCajaRequest request,
        MovimientoCajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearConceptoAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"{ApiRoutes.Prefix}/movimientos-caja/conceptos/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateConceptoMovimientoCajaRequest request,
        MovimientoCajaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ActualizarConceptoAsync(
            id,
            request,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> EliminarAsync(
        int id,
        MovimientoCajaService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarConceptoAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }
}
