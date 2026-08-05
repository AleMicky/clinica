using Clinica.Api.Shared.Pagination;

namespace Clinica.Api.Modules.Seguridad.Roles;

public static class RolEndpoints
{
    public static IEndpointRouteBuilder MapRolEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/roles")
            .WithTags("Roles")
            .RequireAuthorization();

        group.MapGet("/", Listar);
        group.MapGet("/{id:int}", Obtener);
        group.MapPost("/", Crear);
        group.MapPut("/{id:int}", Actualizar);
        group.MapDelete("/{id:int}", Eliminar);

        return app;
    }

    private static async Task<IResult> Listar(
        [AsParameters] PaginationRequest pagination,
        string? search,
        RolService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                pagination,
                search,
                cancellationToken));
    }

    private static async Task<IResult> Obtener(
        int id,
        RolService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> Crear(
        CreateRolRequest request,
        RolService service)
    {
        var result = await service.CrearAsync(request);

        return Results.Created(
            $"/roles/{result.Id}",
            result);
    }

    private static async Task<IResult> Actualizar(
        int id,
        UpdateRolRequest request,
        RolService service)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                id,
                request));
    }

    private static async Task<IResult> Eliminar(
        int id,
        RolService service)
    {
        await service.EliminarAsync(id);

        return Results.NoContent();
    }
}