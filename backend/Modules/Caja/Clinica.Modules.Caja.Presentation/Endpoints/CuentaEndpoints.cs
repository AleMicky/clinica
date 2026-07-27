using Clinica.Modules.Caja.Application.Abstractions;
using Clinica.Modules.Caja.Application.Cargos;
using Clinica.Modules.Caja.Application.Cuentas;
using Clinica.Modules.Caja.Application.Pagos;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Caja.Presentation.Endpoints;

public static class CuentaEndpoints
{
    public static RouteGroupBuilder MapCuentaEndpoints(this RouteGroupBuilder group)
    {
        var cuentas = group.MapGroup("/cuentas")
            .RequireAuthorization()
            .WithTags(CajaSwaggerTags.Cuentas);

        cuentas.MapGet("/", async (
                [AsParameters] CuentaPagedRequest request,
                ICajaCuentaService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetPagedAsync(request, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("Caja_GetCuentas")
            .Produces<ApiResponse<PagedResult<CuentaListItemResponse>>>(StatusCodes.Status200OK);

        cuentas.MapGet("/{id:guid}", async (
                Guid id,
                ICajaCuentaService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);
                return result is null
                    ? ApiResults.NotFound("Cuenta no encontrada.")
                    : ApiResults.Ok(result);
            })
            .WithName("Caja_GetCuentaById")
            .Produces<ApiResponse<CuentaResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        cuentas.MapGet("/by-referencia/{moduloOrigen}/{entidadOrigen}/{referenciaId:guid}", async (
                string moduloOrigen,
                string entidadOrigen,
                Guid referenciaId,
                ICajaCargoService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByReferenciaAsync(
                    moduloOrigen,
                    entidadOrigen,
                    referenciaId,
                    cancellationToken);

                return result is null
                    ? ApiResults.NotFound("Cuenta no encontrada para la referencia.")
                    : ApiResults.Ok(result);
            })
            .WithName("Caja_GetCuentaByReferencia")
            .Produces<ApiResponse<CuentaResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        cuentas.MapPost("/cargos", async (
                AgregarCargosRequest request,
                IValidator<AgregarCargosRequest> validator,
                ICajaCargoService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                {
                    var message = $"Datos inválidos. {string.Join(", ",
                        validation.Errors.Select(x => x.ErrorMessage).Distinct())}";
                    return ApiResults.BadRequest(message);
                }

                var result = await service.AgregarCargosAsync(request, cancellationToken);
                return ApiResults.Created(result, "Cargos agregados correctamente.");
            })
            .WithName("Caja_AgregarCargos")
            .Produces<ApiResponse<CuentaResponse>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        // Compatibilidad: cobro desde detalle de cuenta
        cuentas.MapPost("/{id:guid}/pagos", async (
                Guid id,
                RegistrarPagoRequest request,
                IValidator<RegistrarPagoRequest> validator,
                ICajaPagoService service,
                CancellationToken cancellationToken) =>
            {
                var payload = request with { CuentaId = id };
                var validation = await validator.ValidateAsync(payload, cancellationToken);
                if (!validation.IsValid)
                {
                    var message = $"Datos inválidos. {string.Join(", ",
                        validation.Errors.Select(x => x.ErrorMessage).Distinct())}";
                    return ApiResults.BadRequest(message);
                }

                var result = await service.RegistrarPagoAsync(payload, cancellationToken);
                return ApiResults.Ok(result, "Pago registrado correctamente.");
            })
            .WithName("Caja_RegistrarPago")
            .Produces<ApiResponse<PagoDetalleCompletoResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        cuentas.MapPost("/{id:guid}/anular", async (
                Guid id,
                AnularCuentaRequest? request,
                ICajaCuentaService service,
                CancellationToken cancellationToken) =>
            {
                await service.AnularAsync(id, request, cancellationToken);
                return ApiResults.Ok("Cuenta anulada correctamente.");
            })
            .WithName("Caja_AnularCuenta")
            .Produces<ApiResponse<string>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        return group;
    }
}
