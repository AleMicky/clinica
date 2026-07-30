using Clinica.Modules.Laboratorio.Application.Abstractions;
using Clinica.Modules.Laboratorio.Application.Solicitudes;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Laboratorio.Presentation.Endpoints;

public static class SolicitudEndpoints
{
    public static RouteGroupBuilder MapSolicitudEndpoints(this RouteGroupBuilder group)
    {
        var solicitudes = group.MapGroup("/solicitudes")
            .RequireAuthorization()
            .WithTags(LaboratorioSwaggerTags.Solicitudes);

        solicitudes.MapGet("/", async (
                [AsParameters] SolicitudPagedRequest request,
                ISolicitudService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetPagedAsync(request, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("LaboratorioSolicitud_GetPaged")
            .Produces<ApiResponse<PagedResult<SolicitudResponse>>>(StatusCodes.Status200OK);

        solicitudes.MapGet("/{id:guid}", async (
                Guid id,
                ISolicitudService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);
                return result is null
                    ? ApiResults.NotFound("Solicitud no encontrada.")
                    : ApiResults.Ok(result);
            })
            .WithName("LaboratorioSolicitud_GetById")
            .Produces<ApiResponse<SolicitudResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        solicitudes.MapPost("/", async (
                CreateSolicitudRequest request,
                IValidator<CreateSolicitudRequest> validator,
                ISolicitudService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                {
                    var message = $"Datos inválidos. {string.Join(", ",
                        validation.Errors.Select(x => x.ErrorMessage).Distinct())}";
                    return ApiResults.BadRequest(message);
                }

                var result = await service.CreateAsync(request, cancellationToken);
                return ApiResults.Created(result, "Solicitud creada correctamente.");
            })
            .WithName("LaboratorioSolicitud_Create")
            .Produces<ApiResponse<SolicitudResponse>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        solicitudes.MapPut("/{id:guid}", async (
                Guid id,
                UpdateSolicitudRequest request,
                IValidator<UpdateSolicitudRequest> validator,
                ISolicitudService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                {
                    var message = $"Datos inválidos. {string.Join(", ",
                        validation.Errors.Select(x => x.ErrorMessage).Distinct())}";
                    return ApiResults.BadRequest(message);
                }

                var result = await service.UpdateAsync(id, request, cancellationToken);
                return ApiResults.Ok(result, "Solicitud actualizada correctamente.");
            })
            .WithName("LaboratorioSolicitud_Update")
            .Produces<ApiResponse<SolicitudResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        solicitudes.MapDelete("/{id:guid}", async (
                Guid id,
                ISolicitudService service,
                CancellationToken cancellationToken) =>
            {
                await service.DeleteAsync(id, cancellationToken);
                return ApiResults.NoContent();
            })
            .WithName("LaboratorioSolicitud_Delete")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        solicitudes.MapPost("/{id:guid}/enviar-a-caja", async (
                Guid id,
                EnviarACajaRequest request,
                IValidator<EnviarACajaRequest> validator,
                ISolicitudService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                {
                    var message = $"Datos inválidos. {string.Join(", ",
                        validation.Errors.Select(x => x.ErrorMessage).Distinct())}";
                    return ApiResults.BadRequest(message);
                }

                var result = await service.EnviarACajaAsync(id, request, cancellationToken);
                return ApiResults.Ok(result, "Solicitud enviada a caja correctamente.");
            })
            .WithName("LaboratorioSolicitud_EnviarACaja")
            .Produces<ApiResponse<SolicitudResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        solicitudes.MapPut("/{id:guid}/estado", async (
                Guid id,
                SetSolicitudEstadoRequest request,
                IValidator<SetSolicitudEstadoRequest> validator,
                ISolicitudService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                {
                    var message = $"Datos inválidos. {string.Join(", ",
                        validation.Errors.Select(x => x.ErrorMessage).Distinct())}";
                    return ApiResults.BadRequest(message);
                }

                await service.SetEstadoAsync(id, request.Estado, cancellationToken);
                var result = await service.GetByIdAsync(id, cancellationToken);
                return result is null
                    ? ApiResults.NotFound("Solicitud no encontrada.")
                    : ApiResults.Ok(result, "Estado de solicitud actualizado correctamente.");
            })
            .WithName("LaboratorioSolicitud_SetEstado")
            .Produces<ApiResponse<SolicitudResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        return group;
    }
}
