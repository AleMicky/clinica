using Clinica.Modules.Almacen.Presentation.Endpoints;
using Clinica.SharedKernel.Responses;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Almacen.Presentation;

public static class AlmacenEndpoints
{
    private const string BasePath = "/api/almacen";

    public static IEndpointRouteBuilder MapAlmacenEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup(BasePath);
        MapHealth(group);
        group.MapProductoEndpoints();
        group.MapMovimientoEndpoints();
        group.MapCategoriaEndpoints();
        group.MapUnidadMedidaEndpoints();
        group.MapAlmacenCatalogEndpoints();
        group.MapFormaFarmaceuticaEndpoints();
        group.MapTransferenciaEndpoints();
        group.MapSolicitudEndpoints();
        group.MapInventarioFisicoEndpoints();
        return app;
    }

    private static void MapHealth(RouteGroupBuilder group)
    {
        group.MapGet("/health", () => ApiResults.Ok("Almacén operativo."))
            .WithName("AlmacenHealth")
            .WithSummary("Estado del módulo Almacén")
            .WithTags(AlmacenSwaggerTags.Module)
            .Produces<ApiResponse<string>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status500InternalServerError);
    }
}

public static class AlmacenSwaggerTags
{
    public const string Module = "Almacén";
    public const string Productos = "Almacén · Productos";
    public const string Movimientos = "Almacén · Movimientos";
    public const string Categorias = "Almacén · Categorías";
    public const string UnidadesMedida = "Almacén · Unidades de medida";
    public const string Almacenes = "Almacén · Almacenes";
    public const string FormasFarmaceuticas = "Almacén · Formas farmacéuticas";
    public const string Transferencias = "Almacén · Transferencias";
    public const string Solicitudes = "Almacén · Solicitudes";
    public const string Inventarios = "Almacén · Inventarios físicos";
}
