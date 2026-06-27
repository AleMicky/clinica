using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.Especialidades;
using Clinica.SharedKernel.Crud;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.RecursosHumanos.Presentation.Endpoints;

public static class EspecialidadEndpoints
{
    public static RouteGroupBuilder MapEspecialidadEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/especialidades")
            .RequireAuthorization()
            .WithTags(RecursosHumanosSwaggerTags.Especialidades)
            .MapCrud<
                IEspecialidadService,
                Guid,
                EspecialidadResponse,
                CreateEspecialidadRequest,
                UpdateEspecialidadRequest>("Especialidad");

        return group;
    }
}
