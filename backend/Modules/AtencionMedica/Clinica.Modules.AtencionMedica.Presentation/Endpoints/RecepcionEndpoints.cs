using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.Atenciones;
using Clinica.Modules.AtencionMedica.Application.Recepcion;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.AtencionMedica.Presentation.Endpoints;

public static class RecepcionEndpoints
{
    public static RouteGroupBuilder MapRecepcionEndpoints(this RouteGroupBuilder group)
    {
        var recepcionGroup = group.MapGroup("/recepcion")
            .RequireAuthorization()
            .WithTags(AtencionMedicaSwaggerTags.Recepcion);

        recepcionGroup.MapPost("/", async (
                CrearRecepcionAtencionRequest request,
                IValidator<CrearRecepcionAtencionRequest> validator,
                IRecepcionAtencionService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);

                if (!validation.IsValid)
                {
                    var message = $"Datos inválidos. {string.Join(", ",
                        validation.Errors.Select(x => x.ErrorMessage).Distinct())}";

                    return ApiResults.BadRequest(message);
                }

                var result = await service.CrearRecepcionAtencionAsync(request, cancellationToken);
                return ApiResults.Created(result, "Atención registrada en recepción correctamente.");
            })
            .WithName("RecepcionAtencion_Create")
            .WithSummary("Registrar atención desde recepción")
            .Produces<ApiResponse<AtencionResponse>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        recepcionGroup.MapGet("/pendientes", async (
                IRecepcionAtencionService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetPendientesAsync(cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("RecepcionAtencion_GetPendientes")
            .WithSummary("Listar atenciones pendientes en recepción")
            .Produces<ApiResponse<IReadOnlyCollection<AtencionResponse>>>(StatusCodes.Status200OK);

        recepcionGroup.MapGet("/formulario/{tipoAtencionId:guid}", async (
                Guid tipoAtencionId,
                IRecepcionAtencionService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetFormularioRecepcionAsync(tipoAtencionId, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("RecepcionAtencion_GetFormulario")
            .WithSummary("Obtener formulario de recepción por tipo de atención")
            .Produces<ApiResponse<FormularioRecepcionResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        recepcionGroup.MapGet("/{id:guid}", async (
                Guid id,
                IRecepcionAtencionService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);

                return result is null
                    ? ApiResults.NotFound("Atención no encontrada.")
                    : ApiResults.Ok(result);
            })
            .WithName("RecepcionAtencion_GetById")
            .WithSummary("Obtener atención de recepción por ID")
            .Produces<ApiResponse<AtencionResponse>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound);

        return group;
    }
}
