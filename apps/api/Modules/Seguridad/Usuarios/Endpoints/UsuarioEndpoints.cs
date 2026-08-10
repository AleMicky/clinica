using Clinica.Api.Modules.Seguridad.Usuarios.Dtos;
using Clinica.Api.Modules.Seguridad.Usuarios.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Seguridad.Usuarios.Endpoints;

public static class UsuarioEndpoints
{
    public static IEndpointRouteBuilder MapUsuarioEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/usuarios")
            .WithTags("Usuarios")
            .RequireAuthorization();

        group.MapGet("/", Listar)
            .WithName("ListarUsuarios");

        group.MapGet("/{id:int}", Obtener)
            .WithName("ObtenerUsuario");

        group.MapPost("/", Crear)
            .WithName("CrearUsuario")
            .Validate<CreateUsuarioRequest>();

        group.MapPut("/{id:int}", Actualizar)
            .WithName("ActualizarUsuario")
            .Validate<UpdateUsuarioRequest>();

        group.MapDelete("/{id:int}", Eliminar)
            .WithName("EliminarUsuario");

        return app;
    }

    private static async Task<IResult> Listar(
        [AsParameters] PaginationRequest pagination,
        string? search,
        UsuarioService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ListarAsync(
            pagination,
            search,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> Obtener(
        int id,
        UsuarioService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ObtenerAsync(
            id,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> Crear(
        CreateUsuarioRequest request,
        UsuarioService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/usuarios/{result.Id}",
            result);
    }

    private static async Task<IResult> Actualizar(
        int id,
        UpdateUsuarioRequest request,
        UsuarioService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ActualizarAsync(
            id,
            request,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> Eliminar(
        int id,
        UsuarioService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }
}