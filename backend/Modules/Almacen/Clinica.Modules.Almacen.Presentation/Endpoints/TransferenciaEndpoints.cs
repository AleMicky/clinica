using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Application.Transferencias;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Almacen.Presentation.Endpoints;

public static class TransferenciaEndpoints
{
    public static RouteGroupBuilder MapTransferenciaEndpoints(this RouteGroupBuilder group)
    {
        var transferencias = group.MapGroup("/transferencias")
            .RequireAuthorization()
            .WithTags(AlmacenSwaggerTags.Transferencias);

        transferencias.MapGet("/", async (
                [AsParameters] TransferenciaPagedRequest request,
                ITransferenciaAlmacenService service,
                CancellationToken cancellationToken) =>
            ApiResults.Ok(await service.GetPagedAsync(request, cancellationToken)))
            .WithName("AlmacenTransferencia_GetPaged");

        transferencias.MapGet("/{id:guid}", async (
                Guid id,
                ITransferenciaAlmacenService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);
                return result is null ? ApiResults.NotFound("Transferencia no encontrada.") : ApiResults.Ok(result);
            })
            .WithName("AlmacenTransferencia_GetById");

        transferencias.MapPost("/", async (
                CreateTransferenciaRequest request,
                IValidator<CreateTransferenciaRequest> validator,
                ITransferenciaAlmacenService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(e => e.ErrorMessage)));
                return ApiResults.Created(await service.CreateAsync(request, cancellationToken), "Transferencia creada.");
            })
            .WithName("AlmacenTransferencia_Create");

        transferencias.MapPost("/{id:guid}/solicitar", async (Guid id, ITransferenciaAlmacenService service, CancellationToken ct) =>
            ApiResults.Ok(await service.SolicitarAsync(id, ct), "Transferencia solicitada."))
            .WithName("AlmacenTransferencia_Solicitar");

        transferencias.MapPost("/{id:guid}/aprobar", async (
                Guid id, AprobarTransferenciaRequest request, ITransferenciaAlmacenService service, CancellationToken ct) =>
            ApiResults.Ok(await service.AprobarAsync(id, request, ct), "Transferencia aprobada."))
            .WithName("AlmacenTransferencia_Aprobar");

        transferencias.MapPost("/{id:guid}/preparar", async (Guid id, ITransferenciaAlmacenService service, CancellationToken ct) =>
            ApiResults.Ok(await service.PrepararAsync(id, ct), "Transferencia en preparación."))
            .WithName("AlmacenTransferencia_Preparar");

        transferencias.MapPost("/{id:guid}/enviar", async (
                Guid id, EnviarTransferenciaRequest request, ITransferenciaAlmacenService service, CancellationToken ct) =>
            ApiResults.Ok(await service.EnviarAsync(id, request, ct), "Transferencia enviada."))
            .WithName("AlmacenTransferencia_Enviar");

        transferencias.MapPost("/{id:guid}/recibir", async (
                Guid id, RecibirTransferenciaRequest request, ITransferenciaAlmacenService service, CancellationToken ct) =>
            ApiResults.Ok(await service.RecibirAsync(id, request, ct), "Transferencia recibida."))
            .WithName("AlmacenTransferencia_Recibir");

        transferencias.MapPost("/{id:guid}/rechazar", async (
                Guid id, RechazarTransferenciaRequest request, ITransferenciaAlmacenService service, CancellationToken ct) =>
            ApiResults.Ok(await service.RechazarAsync(id, request, ct), "Transferencia rechazada."))
            .WithName("AlmacenTransferencia_Rechazar");

        transferencias.MapPost("/{id:guid}/anular", async (Guid id, ITransferenciaAlmacenService service, CancellationToken ct) =>
            ApiResults.Ok(await service.AnularAsync(id, ct), "Transferencia anulada."))
            .WithName("AlmacenTransferencia_Anular");

        return transferencias;
    }
}
