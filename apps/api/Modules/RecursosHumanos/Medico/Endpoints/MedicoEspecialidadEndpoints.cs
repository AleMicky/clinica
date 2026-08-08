using Clinica.Api.Modules.RecursosHumanos.Medico.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Medico.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.RecursosHumanos.Medico.Endpoints;

public static class MedicoEspecialidadEndpoints
{
    public static IEndpointRouteBuilder MapMedicoEspecialidadEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/empleados/{empleadoId:int}/medicos/{medicoId:int}/especialidades")
            .WithTags("Especialidades del Médico")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarMedicoEspecialidades");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerMedicoEspecialidad");

        group.MapPost("/", CrearAsync)
            .WithName("CrearMedicoEspecialidad")
            .Validate<CreateMedicoEspecialidadRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarMedicoEspecialidad")
            .Validate<UpdateMedicoEspecialidadRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarMedicoEspecialidad");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int empleadoId,
        int medicoId,
        [AsParameters] PaginationRequest pagination,
        string? search,
        MedicoEspecialidadService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                empleadoId,
                medicoId,
                pagination,
                search,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int empleadoId,
        int medicoId,
        int id,
        MedicoEspecialidadService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                empleadoId,
                medicoId,
                id,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        int empleadoId,
        int medicoId,
        CreateMedicoEspecialidadRequest request,
        MedicoEspecialidadService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            empleadoId,
            medicoId,
            request,
            cancellationToken);

        return Results.Created(
            $"/empleados/{empleadoId}/medicos/{medicoId}/especialidades/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int empleadoId,
        int medicoId,
        int id,
        UpdateMedicoEspecialidadRequest request,
        MedicoEspecialidadService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                empleadoId,
                medicoId,
                id,
                request,
                cancellationToken));
    }

    private static async Task<IResult> EliminarAsync(
        int empleadoId,
        int medicoId,
        int id,
        MedicoEspecialidadService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            empleadoId,
            medicoId,
            id,
            cancellationToken);

        return Results.NoContent();
    }
}
