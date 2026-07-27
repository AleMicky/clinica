using Clinica.Modules.Compras.Application.Abstractions;
using Clinica.Modules.Compras.Application.OrdenesCompra;
using Clinica.Modules.Compras.Application.Proveedores;
using Clinica.Modules.Compras.Presentation.Endpoints;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Compras.Presentation;

public static class ComprasEndpoints
{
    private const string BasePath = "/api/compras";

    public static IEndpointRouteBuilder MapComprasEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup(BasePath);
        group.MapGet("/health", () => ApiResults.Ok("Compras operativo."))
            .WithName("ComprasHealth")
            .WithTags(ComprasSwaggerTags.Module)
            .Produces<ApiResponse<string>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status500InternalServerError);

        group.MapGroup("/proveedores")
            .RequireAuthorization()
            .WithTags(ComprasSwaggerTags.Proveedores)
            .MapCrud<IProveedorService, Guid, ProveedorResponse, CreateProveedorRequest, UpdateProveedorRequest>("ComprasProveedor");

        group.MapOrdenCompraEndpoints();
        return app;
    }
}

public static class ComprasSwaggerTags
{
    public const string Module = "Compras";
    public const string Proveedores = "Compras · Proveedores";
    public const string Ordenes = "Compras · Órdenes";
}
