using Clinica.Modules.Almacen.Application.Abstractions;
using Clinica.Modules.Almacen.Application.Categorias;
using Clinica.Modules.Almacen.Application.Existencias;
using Clinica.Modules.Almacen.Application.Lotes;
using Clinica.Modules.Almacen.Application.Movimientos;
using Clinica.Modules.Almacen.Application.Productos;
using Clinica.Modules.Almacen.Presentation.Endpoints;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Responses;
using FluentValidation;
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
        group.MapCategoriaEndpoints();
        group.MapProductoEndpoints();
        group.MapExistenciaEndpoints();
        group.MapLoteEndpoints();
        group.MapMovimientoEndpoints();
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
    public const string Categorias = "Almacén · Categorías";
    public const string Productos = "Almacén · Productos";
    public const string Existencias = "Almacén · Existencias";
    public const string Lotes = "Almacén · Lotes";
    public const string Movimientos = "Almacén · Movimientos";
}
