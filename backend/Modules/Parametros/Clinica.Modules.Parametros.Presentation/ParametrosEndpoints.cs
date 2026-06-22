using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Application.CatalogoGrupos;
using Clinica.SharedKernel.Contracts;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Parametros.Presentation;

public static class ParametrosEndpoints
{
    private const string BasePath = "/api/parametros";
    private const string AdminPolicy = "AdminOnly";

    public static IEndpointRouteBuilder MapParametrosEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup(BasePath)
            .WithTags("Parametros");

        MapHealth(group);
        MapCatalogoGrupos(group);

        return app;
    }

    private static void MapHealth(RouteGroupBuilder group)
    {
        group.MapGet("/health", () =>
                Results.Ok(ApiResponse<string>.Ok("Parametros operativo")))
            .WithName("ParametrosHealth")
            .WithSummary("Estado del módulo Parámetros")
            .Produces<ApiResponse<string>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status500InternalServerError);
    }

    private static void MapCatalogoGrupos(RouteGroupBuilder group)
    {
        var catalogoGrupos = group.MapGroup("/catalogo-grupos")
            .RequireAuthorization(AdminPolicy);

        catalogoGrupos.MapPost("/", async (
                CreateCatalogoGrupoRequest request,
                IValidator<CreateCatalogoGrupoRequest> validator,
                ICatalogoGrupoService catalogoGrupoService,
                CancellationToken cancellationToken) =>
            {
                var error = await ValidateAsync(request, validator, cancellationToken);
                if (error is not null) return error;

                var grupo = await catalogoGrupoService.CreateAsync(request, cancellationToken);

                return Results.Created(
                    $"{BasePath}/catalogo-grupos/{grupo.Id}",
                    ApiResponse<CatalogoGrupoResponse>.Ok(
                        grupo,
                        "Grupo de catálogo creado correctamente."));
            })
            .WithName("Parametros_CreateCatalogoGrupo")
            .WithSummary("Crear un grupo de catálogo")
            .Produces<ApiResponse<CatalogoGrupoResponse>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
            .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized)
            .Produces<ProblemDetails>(StatusCodes.Status403Forbidden);

        catalogoGrupos.MapGet("/", async (
                ICatalogoGrupoService catalogoGrupoService,
                CancellationToken cancellationToken) =>
            {
                var result = await catalogoGrupoService.GetAllAsync(cancellationToken);

                return Results.Ok(
                    ApiResponse<IReadOnlyList<CatalogoGrupoResponse>>.Ok(result));
            })
            .WithName("Parametros_GetCatalogoGrupos")
            .WithSummary("Listar grupos de catálogo")
            .Produces<ApiResponse<IReadOnlyList<CatalogoGrupoResponse>>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized)
            .Produces<ProblemDetails>(StatusCodes.Status403Forbidden);

        catalogoGrupos.MapGet("/{id:guid}", async (
                Guid id,
                ICatalogoGrupoService catalogoGrupoService,
                CancellationToken cancellationToken) =>
            {
                var grupo = await catalogoGrupoService.GetByIdAsync(id, cancellationToken);

                return Results.Ok(
                    ApiResponse<CatalogoGrupoResponse>.Ok(grupo));
            })
            .WithName("Parametros_GetCatalogoGrupoById")
            .WithSummary("Obtener un grupo de catálogo por id")
            .Produces<ApiResponse<CatalogoGrupoResponse>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized)
            .Produces<ProblemDetails>(StatusCodes.Status403Forbidden)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound);

        catalogoGrupos.MapPut("/{id:guid}", async (
                Guid id,
                UpdateCatalogoGrupoRequest request,
                IValidator<UpdateCatalogoGrupoRequest> validator,
                ICatalogoGrupoService catalogoGrupoService,
                CancellationToken cancellationToken) =>
            {
                var error = await ValidateAsync(request, validator, cancellationToken);
                if (error is not null) return error;

                var grupo = await catalogoGrupoService.UpdateAsync(id, request, cancellationToken);

                return Results.Ok(
                    ApiResponse<CatalogoGrupoResponse>.Ok(
                        grupo,
                        "Grupo de catálogo actualizado correctamente."));
            })
            .WithName("Parametros_UpdateCatalogoGrupo")
            .WithSummary("Actualizar un grupo de catálogo")
            .Produces<ApiResponse<CatalogoGrupoResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
            .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized)
            .Produces<ProblemDetails>(StatusCodes.Status403Forbidden)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound);

        catalogoGrupos.MapDelete("/{id:guid}", async (
                Guid id,
                ICatalogoGrupoService catalogoGrupoService,
                CancellationToken cancellationToken) =>
            {
                await catalogoGrupoService.DeleteAsync(id, cancellationToken);

                return Results.NoContent();
            })
            .WithName("Parametros_DeleteCatalogoGrupo")
            .WithSummary("Eliminar un grupo de catálogo")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized)
            .Produces<ProblemDetails>(StatusCodes.Status403Forbidden)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult?> ValidateAsync<TRequest>(
        TRequest request,
        IValidator<TRequest> validator,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);

        if (validation.IsValid)
            return null;

        var errors = validation.Errors
            .Select(e => e.ErrorMessage)
            .ToList();

        return Results.BadRequest(
            ApiResponse<object>.Fail("Datos inválidos.", errors));
    }
}
