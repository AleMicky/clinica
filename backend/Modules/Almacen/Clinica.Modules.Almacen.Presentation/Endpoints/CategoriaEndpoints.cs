using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Application.Categorias;
using Clinica.SharedKernel.Crud;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Almacen.Presentation.Endpoints;

public static class CategoriaEndpoints
{
    public static RouteGroupBuilder MapCategoriaEndpoints(this RouteGroupBuilder group)
    {
        return group.MapGroup("/categorias")
            .RequireAuthorization()
            .WithTags(AlmacenSwaggerTags.Categorias)
            .MapCrud<
                ICategoriaService,
                Guid,
                CategoriaResponse,
                CreateCategoriaRequest,
                UpdateCategoriaRequest>("AlmacenCategoria");
    }
}
