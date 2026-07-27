using Clinica.Modules.Caja.Application.Abstractions;
using Clinica.Modules.Caja.Application.Movimientos;
using Clinica.Modules.Caja.Application.Pagos;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Caja.Presentation.Endpoints;

public static class PagoMovimientoEndpoints
{
    public static RouteGroupBuilder MapPagoEndpoints(this RouteGroupBuilder group)
    {
        var pagos = group.MapGroup("/pagos")
            .RequireAuthorization()
            .WithTags(CajaSwaggerTags.Pagos);

        pagos.MapGet("/", async (
                [AsParameters] PagoPagedRequest request,
                ICajaPagoService service,
                CancellationToken cancellationToken) =>
            ApiResults.Ok(await service.GetPagedAsync(request, cancellationToken)))
            .WithName("Caja_GetPagos");

        pagos.MapGet("/{id:guid}", async (
                Guid id,
                ICajaPagoService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);
                return result is null
                    ? ApiResults.NotFound("Pago no encontrado.")
                    : ApiResults.Ok(result);
            })
            .WithName("Caja_GetPagoById");

        pagos.MapPost("/", async (
                RegistrarPagoRequest request,
                IValidator<RegistrarPagoRequest> validator,
                ICajaPagoService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest($"Datos inválidos. {string.Join(", ", validation.Errors.Select(x => x.ErrorMessage).Distinct())}");

                var result = await service.RegistrarPagoAsync(request, cancellationToken);
                return ApiResults.Created(result, "Pago registrado correctamente.");
            })
            .WithName("Caja_RegistrarPagoV2");

        pagos.MapPost("/{id:guid}/anular", async (
                Guid id,
                AnularPagoRequest request,
                IValidator<AnularPagoRequest> validator,
                ICajaPagoService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest($"Datos inválidos. {string.Join(", ", validation.Errors.Select(x => x.ErrorMessage).Distinct())}");

                await service.AnularAsync(id, request, cancellationToken);
                return ApiResults.Ok("Pago anulado correctamente.");
            })
            .WithName("Caja_AnularPago");

        pagos.MapGet("/{id:guid}/recibo", async (
                Guid id,
                ICajaPagoService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetReciboAsync(id, cancellationToken);
                return result is null
                    ? ApiResults.NotFound("Recibo no encontrado.")
                    : ApiResults.Ok(result);
            })
            .WithName("Caja_GetReciboPago");

        return group;
    }

    public static RouteGroupBuilder MapMovimientoEndpoints(this RouteGroupBuilder group)
    {
        var movimientos = group.MapGroup("/movimientos")
            .RequireAuthorization()
            .WithTags(CajaSwaggerTags.Movimientos);

        movimientos.MapGet("/", async (
                [AsParameters] MovimientoCajaPagedRequest request,
                IMovimientoCajaService service,
                CancellationToken cancellationToken) =>
            ApiResults.Ok(await service.GetPagedAsync(request, cancellationToken)))
            .WithName("Caja_GetMovimientos");

        movimientos.MapPost("/ingreso", async (
                RegistrarMovimientoCajaRequest request,
                IValidator<RegistrarMovimientoCajaRequest> validator,
                IMovimientoCajaService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest($"Datos inválidos. {string.Join(", ", validation.Errors.Select(x => x.ErrorMessage).Distinct())}");

                var result = await service.RegistrarIngresoManualAsync(request, cancellationToken);
                return ApiResults.Created(result, "Ingreso registrado.");
            })
            .WithName("Caja_RegistrarIngreso");

        movimientos.MapPost("/egreso", async (
                RegistrarMovimientoCajaRequest request,
                IValidator<RegistrarMovimientoCajaRequest> validator,
                IMovimientoCajaService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest($"Datos inválidos. {string.Join(", ", validation.Errors.Select(x => x.ErrorMessage).Distinct())}");

                var result = await service.RegistrarEgresoManualAsync(request, cancellationToken);
                return ApiResults.Created(result, "Egreso registrado.");
            })
            .WithName("Caja_RegistrarEgreso");

        return group;
    }

    public static RouteGroupBuilder MapCatalogoEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/metodos-pago", async (
                IMetodoPagoCatalogService service,
                CancellationToken cancellationToken) =>
            ApiResults.Ok(await service.GetAllAsync(cancellationToken)))
            .RequireAuthorization()
            .WithTags(CajaSwaggerTags.Catalogos)
            .WithName("Caja_GetMetodosPago");

        group.MapGet("/conceptos", async (
                IConceptoCajaCatalogService service,
                CancellationToken cancellationToken) =>
            ApiResults.Ok(await service.GetAllAsync(cancellationToken)))
            .RequireAuthorization()
            .WithTags(CajaSwaggerTags.Catalogos)
            .WithName("Caja_GetConceptos");

        return group;
    }
}
