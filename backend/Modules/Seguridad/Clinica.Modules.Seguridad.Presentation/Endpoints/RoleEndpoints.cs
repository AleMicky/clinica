using Clinica.Modules.Seguridad.Application.Abstractions;
using Clinica.Modules.Seguridad.Application.Roles;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Seguridad.Presentation.Endpoints;

public static class RoleEndpoints
{
    public static RouteGroupBuilder MapRoleEndpoints(this RouteGroupBuilder group)
    {
        var roles = group.MapGroup("/roles")
            .RequireAuthorization(SeguridadEndpoints.AdminPolicy)
            .WithTags(SeguridadSwaggerTags.Roles);

        roles.MapPost("/", CreateRoleAsync)
            .WithName("Seguridad_CreateRole")
            .WithSummary("Crear un nuevo rol")
            .Produces<ApiResponse<RoleResponse>>(StatusCodes.Status201Created)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest);

        roles.MapGet("/", GetRolesAsync)
            .WithName("Seguridad_GetRoles")
            .WithSummary("Obtener todos los roles")
            .Produces<ApiResponse<IReadOnlyList<RoleResponse>>>(StatusCodes.Status200OK);

        roles.MapGet("/{roleId:guid}", GetRoleByIdAsync)
            .WithName("Seguridad_GetRoleById")
            .WithSummary("Obtener un rol por id")
            .Produces<ApiResponse<RoleResponse>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound);

        roles.MapPut("/{roleId:guid}", UpdateRoleAsync)
            .WithName("Seguridad_UpdateRole")
            .WithSummary("Actualizar un rol")
            .Produces<ApiResponse<RoleResponse>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound);

        roles.MapDelete("/{roleId:guid}", DeleteRoleAsync)
            .WithName("Seguridad_DeleteRole")
            .WithSummary("Eliminar un rol")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound);

        return group;
    }

    private static async Task<IResult> CreateRoleAsync(
        CreateRoleRequest request,
        IValidator<CreateRoleRequest> validator,
        IRoleService roleService,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);

        if (!validation.IsValid)
            return ApiResults.BadRequest(GetValidationErrors(validation));

        var role = await roleService.CreateAsync(request, cancellationToken);

        return ApiResults.Created(role, "Rol creado correctamente.");
    }

    private static async Task<IResult> GetRolesAsync(
        IRoleService roleService,
        CancellationToken cancellationToken)
    {
        var result = await roleService.GetAllAsync(cancellationToken);

        return ApiResults.Ok(result);
    }

    private static async Task<IResult> GetRoleByIdAsync(
        Guid roleId,
        IRoleService roleService,
        CancellationToken cancellationToken)
    {
        var role = await roleService.GetByIdAsync(roleId, cancellationToken);

        return ApiResults.Ok(role);
    }

    private static async Task<IResult> UpdateRoleAsync(
        Guid roleId,
        UpdateRoleRequest request,
        IValidator<UpdateRoleRequest> validator,
        IRoleService roleService,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);

        if (!validation.IsValid)
            return ApiResults.BadRequest(GetValidationErrors(validation));

        var role = await roleService.UpdateAsync(roleId, request, cancellationToken);

        return ApiResults.Ok(role, "Rol actualizado correctamente.");
    }

    private static async Task<IResult> DeleteRoleAsync(
        Guid roleId,
        IRoleService roleService,
        CancellationToken cancellationToken)
    {
        await roleService.DeleteAsync(roleId, cancellationToken);

        return ApiResults.NoContent();
    }

    private static string GetValidationErrors(FluentValidation.Results.ValidationResult validation)
    {
        return string.Join(", ",
            validation.Errors
                .Select(x => x.ErrorMessage)
                .Distinct());
    }
}
