using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Application.Almacenes;
using Clinica.Modules.Almacen.Application.Categorias;
using Clinica.Modules.Almacen.Application.FormasFarmaceuticas;
using Clinica.Modules.Almacen.Application.UnidadesMedida;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Responses;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Almacen.Presentation.Endpoints;

public static class CategoriaEndpoints
{
    public static RouteGroupBuilder MapCategoriaEndpoints(this RouteGroupBuilder group) =>
        group.MapGroup("/categorias")
            .RequireAuthorization()
            .WithTags(AlmacenSwaggerTags.Categorias)
            .MapCrud<
                ICategoriaProductoService,
                Guid,
                CategoriaProductoResponse,
                CreateCategoriaProductoRequest,
                UpdateCategoriaProductoRequest>("AlmacenCategoria");
}

public static class UnidadMedidaEndpoints
{
    public static RouteGroupBuilder MapUnidadMedidaEndpoints(this RouteGroupBuilder group) =>
        group.MapGroup("/unidades-medida")
            .RequireAuthorization()
            .WithTags(AlmacenSwaggerTags.UnidadesMedida)
            .MapCrud<
                IUnidadMedidaService,
                Guid,
                UnidadMedidaResponse,
                CreateUnidadMedidaRequest,
                UpdateUnidadMedidaRequest>("AlmacenUnidadMedida");
}

public static class FormaFarmaceuticaEndpoints
{
    public static RouteGroupBuilder MapFormaFarmaceuticaEndpoints(this RouteGroupBuilder group) =>
        group.MapGroup("/formas-farmaceuticas")
            .RequireAuthorization()
            .WithTags(AlmacenSwaggerTags.FormasFarmaceuticas)
            .MapCrud<
                IFormaFarmaceuticaService,
                Guid,
                FormaFarmaceuticaResponse,
                CreateFormaFarmaceuticaRequest,
                UpdateFormaFarmaceuticaRequest>("AlmacenFormaFarmaceutica");
}

public static class AlmacenCatalogEndpoints
{
    public static RouteGroupBuilder MapAlmacenCatalogEndpoints(this RouteGroupBuilder group)
    {
        var almacenes = group.MapGroup("/almacenes")
            .RequireAuthorization()
            .WithTags(AlmacenSwaggerTags.Almacenes);

        almacenes.MapGet("/tipos", async (
                IAlmacenCatalogService service,
                CancellationToken cancellationToken) =>
            ApiResults.Ok(await service.GetTiposAsync(cancellationToken)))
            .WithName("AlmacenCatalog_GetTipos");

        return almacenes.MapCrud<
            IAlmacenCatalogService,
            Guid,
            AlmacenResponse,
            CreateAlmacenRequest,
            UpdateAlmacenRequest>("AlmacenCatalog");
    }
}
