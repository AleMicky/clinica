using Clinica.Api.Shared.Pagination;

namespace Clinica.Api.Modules.Seguridad.Usuarios;

public static class UsuarioEndpoints
{
    public static IEndpointRouteBuilder MapUsuarioEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/usuarios")
            .WithTags("Usuarios")
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
        UsuarioService service,
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
        UsuarioService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> Crear(
        CreateUsuarioRequest request,
        UsuarioService service)
    {
        var result = await service.CrearAsync(request);

        return Results.Created(
            $"/usuarios/{result.Id}",
            result);
    }

    private static async Task<IResult> Actualizar(
        int id,
        UpdateUsuarioRequest request,
        UsuarioService service)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                id,
                request));
    }

    private static async Task<IResult> Eliminar(
        int id,
        UsuarioService service)
    {
        await service.EliminarAsync(id);

        return Results.NoContent();
    }
}