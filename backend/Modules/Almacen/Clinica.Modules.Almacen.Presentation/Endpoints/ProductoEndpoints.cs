using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Application.Productos;
using Clinica.SharedKernel.Crud;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Almacen.Presentation.Endpoints;

public static class ProductoEndpoints
{
    public static RouteGroupBuilder MapProductoEndpoints(this RouteGroupBuilder group)
    {
        return group.MapGroup("/productos")
            .RequireAuthorization()
            .WithTags(AlmacenSwaggerTags.Productos)
            .MapCrud<
                IProductoService,
                Guid,
                ProductoResponse,
                CreateProductoRequest,
                UpdateProductoRequest>("AlmacenProducto");
    }
}
