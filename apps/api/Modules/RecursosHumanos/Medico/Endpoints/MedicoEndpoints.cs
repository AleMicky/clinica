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
            .MapGroup("/medicos")
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
        int? empleadoId,
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
        int medicoId,
        MedicoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ObtenerAsync(
                medicoId,
                cancellationToken));
    }

    private static async Task<IResult> CrearAsync(
        CreateMedicoRequest request,
        MedicoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created(
            $"/medicos/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int medicoId,
        UpdateMedicoRequest request,
        MedicoService service,
        CancellationToken cancellationToken)
    {
        return Results.Ok(
            await service.ActualizarAsync(
                medicoId,
                request,
                cancellationToken));
    }

    private static async Task<IResult> EliminarAsync(
        int medicoId,
        MedicoService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(
            medicoId,
            cancellationToken);

        return Results.NoContent();
    }
}