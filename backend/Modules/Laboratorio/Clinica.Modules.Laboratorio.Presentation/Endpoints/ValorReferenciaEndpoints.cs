using Clinica.Modules.Laboratorio.Application.Abstractions;
using Clinica.Modules.Laboratorio.Application.ValoresReferencia;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Laboratorio.Presentation.Endpoints;

public static class ValorReferenciaEndpoints
{
    public static RouteGroupBuilder MapValorReferenciaEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/valores-referencia")
            .RequireAuthorization()
            .WithTags(LaboratorioSwaggerTags.ValoresReferencia)
            .MapFilteredCrud<
                ValorReferenciaPagedRequest,
                IValorReferenciaService,
                ValorReferenciaResponse,
                CreateValorReferenciaRequest,
                UpdateValorReferenciaRequest>(
                "LaboratorioValorReferencia",
                static (service, request, cancellationToken) =>
                    service.GetPagedAsync(request, cancellationToken));

        return group;
    }
}
