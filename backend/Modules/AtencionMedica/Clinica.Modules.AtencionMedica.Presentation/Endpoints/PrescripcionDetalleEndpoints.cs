using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.PrescripcionDetalles;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.AtencionMedica.Presentation.Endpoints;

public static class PrescripcionDetalleEndpoints
{
    public static RouteGroupBuilder MapPrescripcionDetalleEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/prescripcion-detalles")
            .RequireAuthorization()
            .WithTags(AtencionMedicaSwaggerTags.PrescripcionDetalles)
            .MapFilteredCrud<
                PrescripcionDetallePagedRequest,
                IPrescripcionDetalleService,
                PrescripcionDetalleResponse,
                CreatePrescripcionDetalleRequest,
                UpdatePrescripcionDetalleRequest>(
                "PrescripcionDetalle",
                static (service, request, cancellationToken) =>
                    service.GetPagedAsync(request, cancellationToken));

        return group;
    }
}
