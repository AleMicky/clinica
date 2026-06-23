using Clinica.Modules.Seguridad.Application.Abstractions;
using Clinica.Modules.Seguridad.Application.Roles;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Seguridad.Presentation.Endpoints;

public static class RoleEndpoints
{
    public static RouteGroupBuilder MapRoleEndpoints(this RouteGroupBuilder group)
    {
        var roles = group.MapGroup("/roles").RequireAuthorization(SeguridadEndpoints.AdminPolicy);

        roles.MapPost("/", CreateRoleAsync)
            .WithName("Seguridad_CreateRole")
            .WithSummary("Crear un nuevo rol");

        roles.MapGet("/", GetRolesAsync)
            .WithName("Seguridad_GetRoles")
            .WithSummary("Obtener todos los roles");

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
        {
            var errors = validation.Errors
                .Select(x => x.ErrorMessage)
                .Distinct();

            return ApiResults.BadRequest(string.Join(", ", errors));
        }

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
}