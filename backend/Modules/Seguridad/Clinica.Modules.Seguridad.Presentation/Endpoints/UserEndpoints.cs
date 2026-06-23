using Clinica.Modules.Seguridad.Application.Abstractions;
using Clinica.Modules.Seguridad.Application.Users;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Seguridad.Presentation.Endpoints;

public static class UserEndpoints
{
    public static RouteGroupBuilder MapUserEndpoints(this RouteGroupBuilder group)
    {
        var users = group.MapGroup("/users")
            .RequireAuthorization(SeguridadEndpoints.AdminPolicy)
            .WithTags("Usuarios");

        users.MapPost("/", CreateUserAsync)
            .WithName("Seguridad_CreateUser")
            .WithSummary("Crear un nuevo usuario");

        users.MapGet("/", GetUsersAsync)
            .WithName("Seguridad_GetUsers")
            .WithSummary("Obtener todos los usuarios");

        users.MapPost("/{userId:guid}/roles", AssignRoleAsync)
            .WithName("Seguridad_AssignRole")
            .WithSummary("Asignar rol a un usuario");

        return group;
    }

    private static async Task<IResult> CreateUserAsync(
        CreateUserRequest request,
        IValidator<CreateUserRequest> validator,
        IUserService userService,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);

        if (!validation.IsValid)
            return ApiResults.BadRequest(GetValidationErrors(validation));

        var user = await userService.CreateAsync(request, cancellationToken);

        return ApiResults.Created(user, "Usuario creado correctamente.");
    }

    private static async Task<IResult> GetUsersAsync(
        IUserService userService,
        CancellationToken cancellationToken)
    {
        var result = await userService.GetAllAsync(cancellationToken);

        return ApiResults.Ok(result);
    }

    private static async Task<IResult> AssignRoleAsync(
        Guid userId,
        AssignRoleRequest request,
        IValidator<AssignRoleRequest> validator,
        IUserService userService,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);

        if (!validation.IsValid)
            return ApiResults.BadRequest(GetValidationErrors(validation));

        await userService.AssignRoleAsync(userId, request, cancellationToken);

        return ApiResults.Ok(
            new AssignRoleResponse(userId, request.Role),
            "Rol asignado correctamente.");
    }

    private static string GetValidationErrors(FluentValidation.Results.ValidationResult validation)
    {
        return string.Join(", ",
            validation.Errors
                .Select(x => x.ErrorMessage)
                .Distinct());
    }

    private sealed record AssignRoleResponse(Guid UserId, string Role);
}