using Clinica.Api.Modules.Seguridad.Personas.Dtos;
using Clinica.Api.Modules.Seguridad.Personas.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.Seguridad.Personas.Endpoints;

public static class PersonaEndpoints
{
    public static IEndpointRouteBuilder MapPersonaEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/personas")
            .WithTags("Personas")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync).WithName("ListarPersonas");
        group.MapGet("/{id:int}", ObtenerAsync).WithName("ObtenerPersona");
        group.MapPost("/", CrearAsync)
            .WithName("CrearPersona")
            .Validate<CreatePersonaRequest>();
        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarPersona")
            .Validate<UpdatePersonaRequest>();
        group.MapDelete("/{id:int}", EliminarAsync).WithName("EliminarPersona");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        PersonaService service,
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
        PersonaService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreatePersonaRequest request,
        PersonaService service)
    {
        var result = await service.CrearAsync(request);

        return Results.Created(
            $"/personas/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdatePersonaRequest request,
        PersonaService service)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                id,
                request));
    }

    private static async Task<IResult> EliminarAsync(
        int id,
        PersonaService service)
    {
        await service.EliminarAsync(id);
        return Results.NoContent();
    }
}