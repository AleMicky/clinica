using Clinica.Modules.Laboratorio.Application.Abstractions;
using Clinica.Modules.Laboratorio.Application.Especialidades;
using Clinica.SharedKernel.Crud;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Laboratorio.Presentation.Endpoints;

public static class EspecialidadEndpoints
{
    public static RouteGroupBuilder MapEspecialidadEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/especialidades")
            .RequireAuthorization()
            .WithTags(LaboratorioSwaggerTags.Especialidades)
            .MapCrud<
                IEspecialidadService,
                Guid,
                EspecialidadResponse,
                CreateEspecialidadRequest,
                UpdateEspecialidadRequest>("LaboratorioEspecialidad");

        return group;
    }
}
