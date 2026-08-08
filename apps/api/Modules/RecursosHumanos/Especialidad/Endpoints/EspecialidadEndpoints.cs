using Clinica.Api.Modules.RecursosHumanos.Especialidad.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Especialidad.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.RecursosHumanos.Especialidad.Endpoints;

public static class EspecialidadEndpoints
{
    public static IEndpointRouteBuilder MapEspecialidadEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/especialidades")
            .WithTags("Especialidades")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarEspecialidades");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerEspecialidad");

        group.MapPost("/", CrearAsync)
            .WithName("CrearEspecialidad")
            .Validate<CreateEspecialidadRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarEspecialidad")
            .Validate<UpdateEspecialidadRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarEspecialidad");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        EspecialidadService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                pagination,
                search,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        EspecialidadService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateEspecialidadRequest request,
        EspecialidadService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/especialidades/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateEspecialidadRequest request,
        EspecialidadService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                id,
                request,
                cancellationToken));
    }

    private static async Task<IResult> EliminarAsync(
        int id,
        EspecialidadService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            id,
            cancellationToken);

        return Results.NoContent();
    }
}
