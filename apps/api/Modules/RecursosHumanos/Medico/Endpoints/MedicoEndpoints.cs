using Clinica.Api.Modules.RecursosHumanos.Medico.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Medico.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.RecursosHumanos.Medico.Endpoints;

public static class MedicoEndpoints
{
    public static IEndpointRouteBuilder MapMedicoEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/empleados/{empleadoId:int}/medicos")
            .WithTags("Médicos")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarMedicos");

        group.MapGet("/{medicoId:int}", ObtenerAsync)
            .WithName("ObtenerMedico");

        group.MapPost("/", CrearAsync)
            .WithName("CrearMedico")
            .Validate<CreateMedicoRequest>();

        group.MapPut("/{medicoId:int}", ActualizarAsync)
            .WithName("ActualizarMedico")
            .Validate<UpdateMedicoRequest>();

        group.MapDelete("/{medicoId:int}", EliminarAsync)
            .WithName("EliminarMedico");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int empleadoId,
        [AsParameters] PaginationRequest pagination,
        string? search,
        MedicoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ListarAsync(
                empleadoId,
                pagination,
                search,
                cancellationToken));
    }

    private static async Task<IResult> ObtenerAsync(
        int empleadoId,
        int medicoId,
        MedicoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                empleadoId,
                medicoId,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        int empleadoId,
        CreateMedicoRequest request,
        MedicoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            empleadoId,
            request,
            cancellationToken);

        return Results.Created(
            $"/empleados/{empleadoId}/medicos/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int empleadoId,
        int medicoId,
        UpdateMedicoRequest request,
        MedicoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                empleadoId,
                medicoId,
                request,
                cancellationToken));
    }

    private static async Task<IResult> EliminarAsync(
        int empleadoId,
        int medicoId,
        MedicoService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            empleadoId,
            medicoId,
            cancellationToken);

        return Results.NoContent();
    }
}
