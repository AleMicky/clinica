using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.Atenciones;
using Clinica.SharedKernel.Responses;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.AtencionMedica.Presentation.Endpoints;

public static class BandejaAtencionEndpoints
{
    public static RouteGroupBuilder MapBandejaAtencionEndpoints(this RouteGroupBuilder group)
    {
        var enfermeriaGroup = group.MapGroup("/enfermeria")
            .RequireAuthorization()
            .WithTags("Enfermeria");

        enfermeriaGroup.MapGet("/pendientes", async (
                IBandejaAtencionService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetPendientesEnfermeriaAsync(cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("Enfermeria_GetPendientes")
            .WithSummary("Listar atenciones pendientes en enfermería")
            .Produces<ApiResponse<IReadOnlyCollection<AtencionResponse>>>(StatusCodes.Status200OK);

        var consultaGroup = group.MapGroup("/consulta-medica")
            .RequireAuthorization()
            .WithTags("ConsultaMedica");

        consultaGroup.MapGet("/pendientes", async (
                IBandejaAtencionService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetPendientesConsultaMedicaAsync(cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("ConsultaMedica_GetPendientes")
            .WithSummary("Listar atenciones pendientes en consulta médica")
            .Produces<ApiResponse<IReadOnlyCollection<AtencionResponse>>>(StatusCodes.Status200OK);

        return group;
    }
}
