using Clinica.Api.Modules.RecursosHumanos.Medico.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Medico.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.RecursosHumanos.Medico.Endpoints;

public static class MedicoServicioAcuerdoEndpoints
{
    public static IEndpointRouteBuilder MapMedicoServicioAcuerdoEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/empleados/{empleadoId:int}/medicos/{medicoId:int}/servicios-acuerdo")
            .WithTags("Acuerdos de Servicio del Médico")
            .RequireAuthorization();

        group.MapGet("/", ListarAsync)
            .WithName("ListarMedicoServicioAcuerdos");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerMedicoServicioAcuerdo");

        group.MapPost("/", CrearAsync)
            .WithName("CrearMedicoServicioAcuerdo")
            .Validate<CreateMedicoServicioAcuerdoRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarMedicoServicioAcuerdo")
            .Validate<UpdateMedicoServicioAcuerdoRequest>();

        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarMedicoServicioAcuerdo");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        int empleadoId,
        int medicoId,
        [AsParameters] PaginationRequest pagination,
        string? search,
        MedicoServicioAcuerdoService service,
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
        MedicoServicioAcuerdoService service,
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
        CreateMedicoServicioAcuerdoRequest request,
        MedicoServicioAcuerdoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            empleadoId,
            medicoId,
            request,
            cancellationToken);

        return Results.Created(
            $"/empleados/{empleadoId}/medicos/{medicoId}/servicios-acuerdo/{result.Id}",
            result);
    }

    private static async Task<IResult> ActualizarAsync(
        int empleadoId,
        int medicoId,
        int id,
        UpdateMedicoServicioAcuerdoRequest request,
        MedicoServicioAcuerdoService service,
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
        MedicoServicioAcuerdoService service,
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
