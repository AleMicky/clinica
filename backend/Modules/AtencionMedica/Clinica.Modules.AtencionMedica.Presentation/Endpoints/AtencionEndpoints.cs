using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.Atenciones;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.AtencionMedica.Presentation.Endpoints;

public static class AtencionEndpoints
{
    public static RouteGroupBuilder MapAtencionEndpoints(this RouteGroupBuilder group)
    {
        var atenciones = group.MapGroup("/atenciones")
            .RequireAuthorization()
            .WithTags(AtencionMedicaSwaggerTags.Atenciones);

        atenciones.MapPost("/recepcionar", async (
                RecepcionarAtencionRequest request,
                IValidator<RecepcionarAtencionRequest> validator,
                IAtencionService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);

                if (!validation.IsValid)
                {
                    var message = $"Datos inválidos. {string.Join(", ",
                        validation.Errors
                            .Select(x => x.ErrorMessage)
                            .Distinct())}";

                    return ApiResults.BadRequest(message);
                }

                var result = await service.RecepcionarAsync(request, cancellationToken);
                return ApiResults.Created(result, "Atención recepcionada correctamente.");
            })
            .WithName("Atencion_Recepcionar")
            .Produces<ApiResponse<AtencionResponse>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        atenciones.MapFilteredCrud<
            AtencionPagedRequest,
            IAtencionService,
            AtencionResponse,
            CreateAtencionRequest,
            UpdateAtencionRequest>(
            "Atencion",
            static (service, request, cancellationToken) =>
                service.GetPagedAsync(request, cancellationToken));

        return group;
    }
}
