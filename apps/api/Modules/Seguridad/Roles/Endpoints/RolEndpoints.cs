using Clinica.Api.Modules.Seguridad.Roles.Dtos;
using Clinica.Api.Modules.Seguridad.Roles.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Clinica.Api.Modules.Seguridad.Roles.Endpoints;

public static class RolEndpoints
{
    public static IEndpointRouteBuilder MapRolEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/roles")
            .WithTags("Roles")
            .RequireAuthorization();

        group.MapGet("", Listar)
            .WithName("ListarRoles")
            .WithSummary("Listar roles")
            .WithDescription("Obtiene la lista paginada de roles.")
            .Produces<PagedResult<RolResponse>>(StatusCodes.Status200OK);

        group.MapGet("/{id:int}", Obtener)
            .WithName("ObtenerRol")
            .WithSummary("Obtener rol")
            .WithDescription("Obtiene un rol por su identificador.")
            .Produces<RolResponse>(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status404NotFound);

        group.MapPost("", Crear)
            .WithName("CrearRol")
            .WithSummary("Crear rol")
            .WithDescription("Crea un nuevo rol.")
            .Validate<CreateRolRequest>()
            .Produces<RolResponse>(StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .Produces(StatusCodes.Status409Conflict);

        group.MapPut("/{id:int}", Actualizar)
            .WithName("ActualizarRol")
            .WithSummary("Actualizar rol")
            .WithDescription("Actualiza los datos de un rol existente.")
            .Validate<UpdateRolRequest>()
            .Produces<RolResponse>(StatusCodes.Status200OK)
            .ProducesValidationProblem()
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status409Conflict);

        group.MapDelete("/{id:int}", Eliminar)
            .WithName("EliminarRol")
            .WithSummary("Eliminar rol")
            .WithDescription("Elimina un rol existente.")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status409Conflict);

        return app;
    }

    private static async Task<Ok<PagedResult<RolResponse>>> Listar(
        [AsParameters] PaginationRequest pagination,
        string? search,
        RolService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ListarAsync(
            pagination,
            search,
            cancellationToken);

        return TypedResults.Ok(result);
    }

    private static async Task<Ok<RolResponse>> Obtener(
        int id,
        RolService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ObtenerAsync(
            id,
            cancellationToken);

        return TypedResults.Ok(result);
    }

    private static async Task<CreatedAtRoute<RolResponse>> Crear(
        CreateRolRequest request,
        RolService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return TypedResults.CreatedAtRoute(
            result,
            "ObtenerRol",
            new { id = result.Id });
    }

    private static async Task<Ok<RolResponse>> Actualizar(
        int id,
        UpdateRolRequest request,
        RolService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ActualizarAsync(
            id,
            request,
            cancellationToken);

        return TypedResults.Ok(result);
    }

    private static async Task<NoContent> Eliminar(
        int id,
        RolService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return TypedResults.NoContent();
    }
}