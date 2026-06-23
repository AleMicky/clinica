using Clinica.Modules.Seguridad.Application.Abstractions;
using Clinica.Modules.Seguridad.Application.Users;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Seguridad.Presentation.Endpoints;

public static class UserEndpoints
{
    public static RouteGroupBuilder MapUserEndpoints(this RouteGroupBuilder group)
    {
        var users = group.MapGroup("/users")
            .RequireAuthorization(SeguridadEndpoints.AdminPolicy)
            .WithTags(SeguridadSwaggerTags.Users);

        users.MapPost("/", CreateUserAsync)
            .WithName("Seguridad_CreateUser")
            .WithSummary("Crear un nuevo usuario")
            .Produces<ApiResponse<UserResponse>>(StatusCodes.Status201Created)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest);

        users.MapGet("/", GetUsersAsync)
            .WithName("Seguridad_GetUsers")
            .WithSummary("Obtener todos los usuarios")
            .Produces<ApiResponse<IReadOnlyList<UserResponse>>>(StatusCodes.Status200OK);

        users.MapGet("/{userId:guid}", GetUserByIdAsync)
            .WithName("Seguridad_GetUserById")
            .WithSummary("Obtener un usuario por id")
            .Produces<ApiResponse<UserResponse>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound);

        users.MapPut("/{userId:guid}", UpdateUserAsync)
            .WithName("Seguridad_UpdateUser")
            .WithSummary("Actualizar un usuario")
            .Produces<ApiResponse<UserResponse>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound);

        users.MapDelete("/{userId:guid}", DeleteUserAsync)
            .WithName("Seguridad_DeleteUser")
            .WithSummary("Eliminar un usuario")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound);

        users.MapPost("/{userId:guid}/roles", AssignRoleAsync)
            .WithName("Seguridad_AssignRole")
            .WithSummary("Asignar rol a un usuario")
            .Produces<ApiResponse<AssignRoleResponse>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound);

        users.MapDelete("/{userId:guid}/roles/{role}", RemoveRoleAsync)
            .WithName("Seguridad_RemoveRole")
            .WithSummary("Quitar un rol de un usuario")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound);

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

    private static async Task<IResult> GetUserByIdAsync(
        Guid userId,
        IUserService userService,
        CancellationToken cancellationToken)
    {
        var user = await userService.GetByIdAsync(userId, cancellationToken);

        return ApiResults.Ok(user);
    }

    private static async Task<IResult> UpdateUserAsync(
        Guid userId,
        UpdateUserRequest request,
        IValidator<UpdateUserRequest> validator,
        IUserService userService,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);

        if (!validation.IsValid)
            return ApiResults.BadRequest(GetValidationErrors(validation));

        var user = await userService.UpdateAsync(userId, request, cancellationToken);

        return ApiResults.Ok(user, "Usuario actualizado correctamente.");
    }

    private static async Task<IResult> DeleteUserAsync(
        Guid userId,
        IUserService userService,
        CancellationToken cancellationToken)
    {
        await userService.DeleteAsync(userId, cancellationToken);

        return ApiResults.NoContent();
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

    private static async Task<IResult> RemoveRoleAsync(
        Guid userId,
        string role,
        IUserService userService,
        CancellationToken cancellationToken)
    {
        await userService.RemoveRoleAsync(userId, role, cancellationToken);

        return ApiResults.NoContent();
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
