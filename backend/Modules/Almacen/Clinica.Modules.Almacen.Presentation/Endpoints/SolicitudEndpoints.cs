using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Application.Solicitudes;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Almacen.Presentation.Endpoints;

public static class SolicitudEndpoints
{
    public static RouteGroupBuilder MapSolicitudEndpoints(this RouteGroupBuilder group)
    {
        var solicitudes = group.MapGroup("/solicitudes")
            .RequireAuthorization()
            .WithTags(AlmacenSwaggerTags.Solicitudes);

        solicitudes.MapGet("/", async (
                [AsParameters] SolicitudPagedRequest request,
                ISolicitudAlmacenService service,
                CancellationToken cancellationToken) =>
            ApiResults.Ok(await service.GetPagedAsync(request, cancellationToken)))
            .WithName("AlmacenSolicitud_GetPaged");

        solicitudes.MapGet("/{id:guid}", async (
                Guid id,
                ISolicitudAlmacenService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);
                return result is null ? ApiResults.NotFound("Solicitud no encontrada.") : ApiResults.Ok(result);
            })
            .WithName("AlmacenSolicitud_GetById");

        solicitudes.MapPost("/", async (
                CreateSolicitudRequest request,
                IValidator<CreateSolicitudRequest> validator,
                ISolicitudAlmacenService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(e => e.ErrorMessage)));
                return ApiResults.Created(await service.CreateAsync(request, cancellationToken), "Solicitud creada.");
            })
            .WithName("AlmacenSolicitud_Create");

        solicitudes.MapPost("/{id:guid}/solicitar", async (Guid id, ISolicitudAlmacenService service, CancellationToken ct) =>
            ApiResults.Ok(await service.SolicitarAsync(id, ct), "Solicitud enviada."))
            .WithName("AlmacenSolicitud_Solicitar");

        solicitudes.MapPost("/{id:guid}/aprobar", async (
                Guid id,
                AprobarSolicitudRequest request,
                IValidator<AprobarSolicitudRequest> validator,
                ISolicitudAlmacenService service,
                CancellationToken ct) =>
            {
                var validation = await validator.ValidateAsync(request, ct);
                if (!validation.IsValid)
                    return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(e => e.ErrorMessage)));
                return ApiResults.Ok(await service.AprobarAsync(id, request, ct), "Solicitud aprobada.");
            })
            .WithName("AlmacenSolicitud_Aprobar");

        solicitudes.MapPost("/{id:guid}/atender", async (
                Guid id,
                AtenderSolicitudRequest request,
                IValidator<AtenderSolicitudRequest> validator,
                ISolicitudAlmacenService service,
                CancellationToken ct) =>
            {
                var validation = await validator.ValidateAsync(request, ct);
                if (!validation.IsValid)
                    return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(e => e.ErrorMessage)));
                return ApiResults.Ok(await service.AtenderAsync(id, request, ct), "Solicitud atendida.");
            })
            .WithName("AlmacenSolicitud_Atender");

        solicitudes.MapPost("/{id:guid}/rechazar", async (Guid id, ISolicitudAlmacenService service, CancellationToken ct) =>
            ApiResults.Ok(await service.RechazarAsync(id, ct), "Solicitud rechazada."))
            .WithName("AlmacenSolicitud_Rechazar");

        solicitudes.MapPost("/{id:guid}/anular", async (Guid id, ISolicitudAlmacenService service, CancellationToken ct) =>
            ApiResults.Ok(await service.AnularAsync(id, ct), "Solicitud anulada."))
            .WithName("AlmacenSolicitud_Anular");

        return solicitudes;
    }
}
