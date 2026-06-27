using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Application.Departamentos;
using Clinica.SharedKernel.Pagination;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.RecursosHumanos.Presentation.Endpoints;

public static class DepartamentoEndpoints
{
    public static RouteGroupBuilder MapDepartamentoEndpoints(this RouteGroupBuilder group)
    {
        var departamentos = group.MapGroup("/departamentos")
            .RequireAuthorization()
            .WithTags(RecursosHumanosSwaggerTags.Departamentos);

        departamentos.MapGet("/", async (
                [AsParameters] DepartamentoPagedRequest request,
                IDepartamentoService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetPagedAsync(request, cancellationToken);
                return ApiResults.Ok(result);
            })
            .WithName("Departamento_GetPaged")
            .Produces<ApiResponse<PagedResult<DepartamentoResponse>>>(StatusCodes.Status200OK);

        departamentos.MapGet("/{id:guid}", async (
                Guid id,
                IDepartamentoService service,
                CancellationToken cancellationToken) =>
            {
                var result = await service.GetByIdAsync(id, cancellationToken);

                return result is null
                    ? ApiResults.NotFound("Registro no encontrado.")
                    : ApiResults.Ok(result);
            })
            .WithName("Departamento_GetById")
            .Produces<ApiResponse<DepartamentoResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        departamentos.MapPost("/", async (
                CreateDepartamentoRequest request,
                IValidator<CreateDepartamentoRequest> validator,
                IDepartamentoService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);

                if (!validation.IsValid)
                {
                    var message = $"Datos inválidos. {string.Join(", ",
                        validation.Errors
                            .Select(x => x.ErrorMessage)
                            .Distinct())}";

                    return ApiResults.BadRequest(message);
                }

                var result = await service.CreateAsync(request, cancellationToken);

                return ApiResults.Created(result, "Registro creado correctamente.");
            })
            .WithName("Departamento_Create")
            .Produces<ApiResponse<DepartamentoResponse>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest);

        departamentos.MapPut("/{id:guid}", async (
                Guid id,
                UpdateDepartamentoRequest request,
                IValidator<UpdateDepartamentoRequest> validator,
                IDepartamentoService service,
                CancellationToken cancellationToken) =>
            {
                var validation = await validator.ValidateAsync(request, cancellationToken);

                if (!validation.IsValid)
                {
                    var message = $"Datos inválidos. {string.Join(", ",
                        validation.Errors
                            .Select(x => x.ErrorMessage)
                            .Distinct())}";

                    return ApiResults.BadRequest(message);
                }

                var result = await service.UpdateAsync(id, request, cancellationToken);

                return ApiResults.Ok(result, "Registro actualizado correctamente.");
            })
            .WithName("Departamento_Update")
            .Produces<ApiResponse<DepartamentoResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        departamentos.MapDelete("/{id:guid}", async (
                Guid id,
                IDepartamentoService service,
                CancellationToken cancellationToken) =>
            {
                await service.DeleteAsync(id, cancellationToken);

                return ApiResults.NoContent();
            })
            .WithName("Departamento_Delete")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiResponse<object>>(StatusCodes.Status404NotFound);

        return group;
    }
}
