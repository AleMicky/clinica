using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Application.Stock;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Almacen.Presentation.Endpoints;

public static class MovimientoEndpoints
{
    public static RouteGroupBuilder MapMovimientoEndpoints(this RouteGroupBuilder group)
    {
        var movimientos = group.MapGroup("/movimientos")
            .RequireAuthorization()
            .WithTags(AlmacenSwaggerTags.Movimientos);

        movimientos.MapGet("/", async (
                [AsParameters] MovimientoPagedRequest request,
                IAlmacenStockService service,
                CancellationToken cancellationToken) =>
            ApiResults.Ok(await service.GetMovimientosPagedAsync(request, cancellationToken)))
            .WithName("AlmacenMovimiento_GetPaged");

        movimientos.MapGet("/{id:guid}", async (
                Guid id,
                IAlmacenStockService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetMovimientoByIdAsync(id, cancellationToken);
                return result is null
                    ? ApiResults.NotFound("Movimiento no encontrado.")
                    : ApiResults.Ok(result);
            })
            .WithName("AlmacenMovimiento_GetById");

        movimientos.MapGet("/disponibilidad/{productoId:guid}", async (
                Guid productoId,
                IAlmacenStockService service,
                CancellationToken cancellationToken) =>
            ApiResults.Ok(await service.ConsultarDisponibilidadAsync(productoId, cancellationToken)))
            .WithName("AlmacenMovimiento_Disponibilidad");

        movimientos.MapPost("/ingresos", async (
                RegistrarIngresoRequest request,
                IValidator<RegistrarIngresoRequest> validator,
                IAlmacenStockService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(e => e.ErrorMessage)));

                var result = await service.RegistrarIngresoAsync(request, cancellationToken);
                return ApiResults.Created(result, "Ingreso registrado.");
            })
            .WithName("AlmacenMovimiento_Ingreso");

        movimientos.MapPost("/salidas", async (
                RegistrarSalidaRequest request,
                IValidator<RegistrarSalidaRequest> validator,
                IAlmacenStockService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(e => e.ErrorMessage)));

                var result = await service.RegistrarSalidaAsync(request, cancellationToken);
                return ApiResults.Created(result, "Salida registrada.");
            })
            .WithName("AlmacenMovimiento_Salida");

        movimientos.MapPost("/ajustes", async (
                RegistrarAjusteRequest request,
                IValidator<RegistrarAjusteRequest> validator,
                IAlmacenStockService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(e => e.ErrorMessage)));

                var result = await service.RegistrarAjusteAsync(request, cancellationToken);
                return ApiResults.Created(result, "Ajuste registrado.");
            })
            .WithName("AlmacenMovimiento_Ajuste");

        movimientos.MapPost("/bajas", async (
                RegistrarBajaRequest request,
                IValidator<RegistrarBajaRequest> validator,
                IAlmacenStockService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(e => e.ErrorMessage)));

                var result = await service.RegistrarBajaAsync(request, cancellationToken);
                return ApiResults.Created(result, "Baja registrada.");
            })
            .WithName("AlmacenMovimiento_Baja");

        movimientos.MapPost("/transferencias", async (
                RegistrarTransferenciaRequest request,
                IValidator<RegistrarTransferenciaRequest> validator,
                IAlmacenStockService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(e => e.ErrorMessage)));

                var result = await service.RegistrarTransferenciaAsync(request, cancellationToken);
                return ApiResults.Created(result, "Transferencia registrada.");
            })
            .WithName("AlmacenMovimiento_Transferencia");

        movimientos.MapPost("/fefo", async (
                DescontarFefoRequest request,
                IValidator<DescontarFefoRequest> validator,
                IAlmacenStockService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(e => e.ErrorMessage)));

                var result = await service.DescontarFefoAsync(request, cancellationToken);
                return ApiResults.Created(result, "Descuento FEFO aplicado.");
            })
            .WithName("AlmacenMovimiento_Fefo");

        movimientos.MapPost("/{id:guid}/aplicar", async (
                Guid id,
                AplicarMovimientoRequest? request,
                IAlmacenStockService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.AplicarMovimientoAsync(id, request, cancellationToken);
                return ApiResults.Ok(result, "Movimiento aplicado.");
            })
            .WithName("AlmacenMovimiento_Aplicar");

        movimientos.MapPost("/{id:guid}/anular", async (
                Guid id,
                IAlmacenStockService service,
                CancellationToken cancellationToken) =>
            {
                await service.SetMovimientoEstadoAsync(id, "Anulado", cancellationToken);
                var result = await service.GetMovimientoByIdAsync(id, cancellationToken);
                return ApiResults.Ok(result, "Movimiento anulado.");
            })
            .WithName("AlmacenMovimiento_Anular");

        return movimientos;
    }
}
