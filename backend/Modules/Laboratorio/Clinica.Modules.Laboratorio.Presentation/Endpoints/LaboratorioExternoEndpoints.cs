using Clinica.Modules.Laboratorio.Application.Abstractions;
using Clinica.Modules.Laboratorio.Application.LaboratoriosExternos;
using Clinica.SharedKernel.Crud;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Laboratorio.Presentation.Endpoints;

public static class LaboratorioExternoEndpoints
{
    public static RouteGroupBuilder MapLaboratorioExternoEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/laboratorios-externos")
            .RequireAuthorization()
            .WithTags(LaboratorioSwaggerTags.LaboratoriosExternos)
            .MapCrud<
                ILaboratorioExternoService,
                Guid,
                LaboratorioExternoResponse,
                CreateLaboratorioExternoRequest,
                UpdateLaboratorioExternoRequest>("LaboratorioExterno");

        return group;
    }
}
