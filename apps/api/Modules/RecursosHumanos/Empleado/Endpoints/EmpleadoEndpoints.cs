using Clinica.Api.Modules.RecursosHumanos.Empleado.Dtos;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Services;
using Clinica.Api.Shared.Pagination;
using Clinica.Api.Shared.Validation;

namespace Clinica.Api.Modules.RecursosHumanos.Empleado.Endpoints;

public static class EmpleadoEndpoints
{
    public static IEndpointRouteBuilder MapEmpleadoEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/empleados")
            .WithTags("Empleados")
            .RequireAuthorization();

        // CONSULTAS
        group.MapGet("/", ListarAsync)
            .WithName("ListarEmpleados");

        group.MapGet("/base", EmpleadoBaseAsync)
            .WithName("EmpleadoBase");

        group.MapGet("/permitidos", EmpleadosPermitidosAsync)
            .WithName("EmpleadosPermitidos");

        group.MapGet("/{id:int}", ObtenerAsync)
            .WithName("ObtenerEmpleado");

        // EMPLEADO CON PERSONA EXISTENTE
        group.MapPost("/", CrearAsync)
            .WithName("CrearEmpleado")
            .Validate<CreateEmpleadoRequest>();

        group.MapPut("/{id:int}", ActualizarAsync)
            .WithName("ActualizarEmpleado")
            .Validate<UpdateEmpleadoRequest>();

        // EMPLEADO + PERSONA
        group.MapPost("/con-persona", CrearConPersonaAsync)
            .WithName("CrearEmpleadoConPersona")
            .Validate<EmpleadoPersonaRequest>();

        group.MapPut("/{id:int}/con-persona", ActualizarConPersonaAsync)
            .WithName("ActualizarEmpleadoConPersona")
            .Validate<EmpleadoPersonaRequest>();

        // ESTADO
        group.MapPatch("/{id:int}/activar", ActivarAsync)
            .WithName("ActivarEmpleado");

        group.MapPatch("/{id:int}/inactivar", InactivarAsync)
            .WithName("InactivarEmpleado");

        // ELIMINAR
        group.MapDelete("/{id:int}", EliminarAsync)
            .WithName("EliminarEmpleado");

        return app;
    }

    private static async Task<IResult> ListarAsync(
        [AsParameters] PaginationRequest pagination,
        string? search,
        EmpleadoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ListarAsync(
            pagination,
            search,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> ObtenerAsync(
        int id,
        EmpleadoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ObtenerAsync(
            id,
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> EmpleadoBaseAsync(
        EmpleadoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.EmpleadoBase(
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> EmpleadosPermitidosAsync(
        EmpleadoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.EmpleadosPermitidos(
            cancellationToken);

        return Results.Ok(result);
    }

    private static async Task<IResult> CrearAsync(
        CreateEmpleadoRequest request,
        EmpleadoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearAsync(
            request,
            cancellationToken);

        return Results.Created($"/empleados/{result.Id}", result);
    }

    private static async Task<IResult> ActualizarAsync(
        int id,
        UpdateEmpleadoRequest request,
        EmpleadoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ActualizarAsync(id, request, cancellationToken);
        return Results.Ok(result);
    }

    private static async Task<IResult> CrearConPersonaAsync(
        EmpleadoPersonaRequest request,
        EmpleadoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.CrearConPersonaAsync(
            request,
            cancellationToken);

        return Results.Created($"/empleados/{result.Id}", result);
    }

    private static async Task<IResult> ActualizarConPersonaAsync(
        int id,
        EmpleadoPersonaRequest request,
        EmpleadoService service,
        CancellationToken cancellationToken)
    {
        var result = await service.ActualizarConPersonaAsync(id, request, cancellationToken);
        return Results.Ok(result);
    }

    private static async Task<IResult> ActivarAsync(
        int id,
        EmpleadoService service,
        CancellationToken cancellationToken)
    {
        await service.ActivarAsync(id, cancellationToken);
        return Results.NoContent();
    }

    private static async Task<IResult> InactivarAsync(
        int id,
        EmpleadoService service,
        CancellationToken cancellationToken)
    {
        await service.InactivarAsync(id, cancellationToken);
        return Results.NoContent();
    }

    private static async Task<IResult> EliminarAsync(
        int id,
        EmpleadoService service,
        CancellationToken cancellationToken)
    {
        await service.EliminarAsync(id, cancellationToken);
        return Results.NoContent();
    }
}