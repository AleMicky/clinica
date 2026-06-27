using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.Profesiones;
using Clinica.SharedKernel.Crud;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.RecursosHumanos.Presentation.Endpoints;

public static class ProfesionEndpoints
{
    public static RouteGroupBuilder MapProfesionEndpoints(this RouteGroupBuilder group)
    {
        group.MapGroup("/profesiones")
            .RequireAuthorization()
            .WithTags(RecursosHumanosSwaggerTags.Profesiones)
            .MapCrud<
                IProfesionService,
                Guid,
                ProfesionResponse,
                CreateProfesionRequest,
                UpdateProfesionRequest>("Profesion");

        return group;
    }
}
