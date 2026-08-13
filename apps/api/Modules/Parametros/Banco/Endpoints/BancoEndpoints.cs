using Clinica.Api.Modules.Parametros.Banco.Dtos;
using Clinica.Api.Modules.Parametros.Banco.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Parametros.Banco.Endpoints;

public static class BancoEndpoints
{
    public static IEndpointRouteBuilder MapBancoEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/bancos")
            .WithTags("Bancos")
            .RequireAuthorization();

        MapBancos(group);
        MapCuentas(group);

        return app;
    }

    private static void MapBancos(RouteGroupBuilder group)
    {
        group.MapGet("/", ListarAsync)
            .WithName("ListarBancos");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerBanco");

        group.MapPost("/", CrearAsync)
            .WithName("CrearBanco")
            .Validate<CreateBancoRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarBanco")
            .Validate<UpdateBancoRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarBanco");
    }

    private static void MapCuentas(RouteGroupBuilder group)
    {
        group.MapGet("/{bancoId:int}/cuentas", ListarCuentasAsync)
            .WithName("ListarCuentasBancarias");

        group.MapGet("/{bancoId:int}/cuentas/{cuentaId:int}", ObtenerCuentaAsync)
            .WithName("ObtenerCuentaBancaria");

        group.MapPost("/{bancoId:int}/cuentas", CrearCuentaAsync)
            .WithName("CrearCuentaBancaria")
            .Validate<CreateCuentaBancariaRequest>();

        group.MapPut("/{bancoId:int}/cuentas/{cuentaId:int}", ActualizarCuentaAsync)
            .WithName("ActualizarCuentaBancaria")
            .Validate<UpdateCuentaBancariaRequest>();

        group.MapDelete("/{bancoId:int}/cuentas/{cuentaId:int}", EliminarCuentaAsync)
            .WithName("EliminarCuentaBancaria");
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        BancoService service,
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
        BancoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateBancoRequest request,
        BancoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/bancos/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateBancoRequest request,
        BancoService service,
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
        BancoService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> ListarCuentasAsync(
        int bancoId,
        [AsParameters] PaginationRequest pagination,
        string? search,
        CuentaBancariaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                bancoId,
                pagination,
                search,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerCuentaAsync(
        int bancoId,
        int cuentaId,
        CuentaBancariaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                bancoId,
                cuentaId,
                cancellationToken));
    }

    private static async Task<IResult> CrearCuentaAsync(
        int bancoId,
        CreateCuentaBancariaRequest request,
        CuentaBancariaService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            bancoId,
            request,
            cancellationToken);

        return Results.Created(
            $"/bancos/{bancoId}/cuentas/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarCuentaAsync(
        int bancoId,
        int cuentaId,
        UpdateCuentaBancariaRequest request,
        CuentaBancariaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                bancoId,
                cuentaId,
                request,
                cancellationToken));
    }

    private static async Task<IResult> EliminarCuentaAsync(
        int bancoId,
        int cuentaId,
        CuentaBancariaService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            bancoId,
            cuentaId,
            cancellationToken);

        return Results.NoContent();
    }
}
