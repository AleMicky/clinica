using Clinica.Api.Modules.Cajas.CierreCaja.Dtos;
using Clinica.Api.Modules.Cajas.CierreCaja.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Cajas.CierreCaja.Endpoints;

public static class CierreCajaEndpoints
{
    public static IEndpointRouteBuilder MapCierreCajaEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/cierres-caja")
            .WithTags("Cierres de Caja")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync).WithName("ListarCierresCaja");
        group.MapGet("/{id:int}", ObtenerAsync).WithName("ObtenerCierreCaja");
        group.MapPost("/", CrearAsync)
            .WithName("CrearCierreCaja")
            .Validate<CreateCierreCajaRequest>();
        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarCierreCaja")
            .Validate<UpdateCierreCajaRequest>();
        group.MapDelete("/{id:int}", EliminarAsync).WithName("EliminarCierreCaja");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        CierreCajaService service,
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
        CierreCajaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateCierreCajaRequest request,
        CierreCajaService service)
    {
        var result = await service.CrearAsync(request);

        return Results.Created(
            $"/cierres-caja/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateCierreCajaRequest request,
        CierreCajaService service)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                id,
                request));
    }

    private static async Task<IResult> EliminarAsync(
        int id,
        CierreCajaService service)
    {
        await service.EliminarAsync(id);
        return Results.NoContent();
    }
}