using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.GrupoProgramacion;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.RecursosHumanos.Presentation.Endpoints;

public static class GrupoProgramacionEndpoints
{
    public static RouteGroupBuilder MapGrupoProgramacionEndpoints(this RouteGroupBuilder group)
    {
        var grupos = group.MapGroup("/grupos-programacion")
            .RequireAuthorization()
            .WithTags(RecursosHumanosSwaggerTags.GruposProgramacion);

        grupos.MapGet("/", async (
                [AsParameters] GrupoProgramacionPagedRequest request,
                IGrupoProgramacionService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetPagedAsync(request, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("GrupoProgramacion_GetPaged");

        grupos.MapGet("/{id:guid}", async (
                Guid id,
                IGrupoProgramacionService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);
                return result is null
                    ? ApiResults.NotFound("Grupo de programación no encontrado.")
                    : ApiResults.Ok(result);
            })
            .WithName("GrupoProgramacion_GetById");

        grupos.MapPost("/", async (
                CreateGrupoProgramacionRequest request,
                IValidator<CreateGrupoProgramacionRequest> validator,
                IGrupoProgramacionService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(x => x.ErrorMessage)));

                var result = await service.CreateAsync(request, cancellationToken);
                return ApiResults.Created(result, "Grupo de programación creado correctamente.");
            })
            .WithName("GrupoProgramacion_Create");

        grupos.MapPut("/{id:guid}", async (
                Guid id,
                UpdateGrupoProgramacionRequest request,
                IValidator<UpdateGrupoProgramacionRequest> validator,
                IGrupoProgramacionService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(x => x.ErrorMessage)));

                var result = await service.UpdateAsync(id, request, cancellationToken);
                return ApiResults.Ok(result, "Grupo de programación actualizado correctamente.");
            })
            .WithName("GrupoProgramacion_Update");

        grupos.MapPut("/{id:guid}/empleados", async (
                Guid id,
                SetGrupoProgramacionEmpleadosRequest request,
                IValidator<SetGrupoProgramacionEmpleadosRequest> validator,
                IGrupoProgramacionService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);
                if (!validation.IsValid)
                    return ApiResults.BadRequest(string.Join(", ", validation.Errors.Select(x => x.ErrorMessage)));

                var result = await service.SetEmpleadosAsync(id, request, cancellationToken);
                return ApiResults.Ok(result, "Miembros del grupo actualizados correctamente.");
            })
            .WithName("GrupoProgramacion_SetEmpleados");

        grupos.MapDelete("/{id:guid}", async (
                Guid id,
                IGrupoProgramacionService service,
                CancellationToken cancellationToken) =>
            {
                await service.DeleteAsync(id, cancellationToken);
                return ApiResults.NoContent();
            })
            .WithName("GrupoProgramacion_Delete");

        return group;
    }
}
