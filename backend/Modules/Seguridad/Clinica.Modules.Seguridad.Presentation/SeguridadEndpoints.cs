using Clinica.Modules.Seguridad.Application.Abstractions;
using Clinica.Modules.Seguridad.Application.Auth;
using Clinica.Modules.Seguridad.Application.Roles;
using Clinica.Modules.Seguridad.Application.Users;
using Clinica.SharedKernel.Contracts;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Seguridad.Presentation;

public static class SeguridadEndpoints
{
    private const string BasePath = "/api/seguridad";
    public const string AdminPolicy = "AdminOnly";
    public static IEndpointRouteBuilder MapSeguridadEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup(BasePath)
            .WithTags("Seguridad");

        MapHealth(group);
        MapAuth(group);
        MapRoles(group);
        MapUsers(group);

        return app;
    }

    private static void MapHealth(RouteGroupBuilder group)
    {
        group.MapGet("/health", () =>
                Results.Ok(ApiResponse<string>.Ok("Seguridad operativo")))
            .WithName("SeguridadHealth")
            .WithSummary("Estado del módulo Seguridad")
            .Produces<ApiResponse<string>>(StatusCodes.Status200OK);
    }

    private static void MapAuth(RouteGroupBuilder group)
    {
        var auth = group.MapGroup("/auth")
            .AllowAnonymous();

        auth.MapPost("/login", async (
                LoginRequest request,
                IValidator<LoginRequest> validator,
                IAuthService authService,
                CancellationToken cancellationToken) =>
            {
                var error = await ValidateAsync(request, validator, cancellationToken);
                if (error is not null) return error;

                try
                {
                    var result = await authService.LoginAsync(request, cancellationToken);

                    return Results.Ok(
                        ApiResponse<LoginResponse>.Ok(
                            result,
                            "Inicio de sesión exitoso."));
                }
                catch (UnauthorizedAccessException ex)
                {
                    return Unauthorized(ex.Message);
                }
            })
            .WithName("Seguridad_Login")
            .WithSummary("Iniciar sesión y obtener token JWT")
            .Produces<ApiResponse<LoginResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object>>(StatusCodes.Status401Unauthorized);
    }

    private static void MapRoles(RouteGroupBuilder group)
    {
        var roles = group.MapGroup("/roles")
            .RequireAuthorization(AdminPolicy);

        roles.MapPost("/", async (
                CreateRoleRequest request,
                IValidator<CreateRoleRequest> validator,
                IRoleService roleService,
                CancellationToken cancellationToken) =>
            {
                var error = await ValidateAsync(request, validator, cancellationToken);
                if (error is not null) return error;

                var role = await roleService.CreateAsync(request, cancellationToken);

                return Results.Created(
                    $"{BasePath}/roles/{role.Id}",
                    ApiResponse<RoleResponse>.Ok(
                        role,
                        "Rol creado correctamente."));
            })
            .WithName("Seguridad_CreateRole")
            .WithSummary("Crear un nuevo rol")
            .Produces<ApiResponse<RoleResponse>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
            .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized)
            .Produces<ProblemDetails>(StatusCodes.Status403Forbidden);

        roles.MapGet("/", async (
                IRoleService roleService,
                CancellationToken cancellationToken) =>
            {
                var result = await roleService.GetAllAsync(cancellationToken);

                return Results.Ok(
                    ApiResponse<IReadOnlyList<RoleResponse>>.Ok(result));
            })
            .WithName("Seguridad_GetRoles")
            .WithSummary("Listar todos los roles")
            .Produces<ApiResponse<IReadOnlyList<RoleResponse>>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized)
            .Produces<ProblemDetails>(StatusCodes.Status403Forbidden);
    }

    private static void MapUsers(RouteGroupBuilder group)
    {
        var users = group.MapGroup("/users")
            .RequireAuthorization(AdminPolicy);

        users.MapPost("/", async (
                CreateUserRequest request,
                IValidator<CreateUserRequest> validator,
                IUserService userService,
                CancellationToken cancellationToken) =>
            {
                var error = await ValidateAsync(request, validator, cancellationToken);
                if (error is not null) return error;

                var user = await userService.CreateAsync(request, cancellationToken);

                return Results.Created(
                    $"{BasePath}/users/{user.Id}",
                    ApiResponse<UserResponse>.Ok(
                        user,
                        "Usuario creado correctamente."));
            })
            .WithName("Seguridad_CreateUser")
            .WithSummary("Crear un nuevo usuario")
            .Produces<ApiResponse<UserResponse>>(StatusCodes.Status201Created)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
            .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized)
            .Produces<ProblemDetails>(StatusCodes.Status403Forbidden);

        users.MapGet("/", async (
                IUserService userService,
                CancellationToken cancellationToken) =>
            {
                var result = await userService.GetAllAsync(cancellationToken);

                return Results.Ok(
                    ApiResponse<IReadOnlyList<UserResponse>>.Ok(result));
            })
            .WithName("Seguridad_GetUsers")
            .WithSummary("Listar todos los usuarios")
            .Produces<ApiResponse<IReadOnlyList<UserResponse>>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized)
            .Produces<ProblemDetails>(StatusCodes.Status403Forbidden);

        users.MapPost("/{userId:guid}/roles", async (
                Guid userId,
                AssignRoleRequest request,
                IValidator<AssignRoleRequest> validator,
                IUserService userService,
                CancellationToken cancellationToken) =>
            {
                var error = await ValidateAsync(request, validator, cancellationToken);
                if (error is not null) return error;

                await userService.AssignRoleAsync(userId, request, cancellationToken);

                return Results.Ok(
                    ApiResponse<object>.Ok(
                        new { UserId = userId, request.Role },
                        "Rol asignado correctamente."));
            })
            .WithName("Seguridad_AssignRole")
            .WithSummary("Asignar un rol a un usuario")
            .Produces<ApiResponse<object>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object>>(StatusCodes.Status400BadRequest)
            .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized)
            .Produces<ProblemDetails>(StatusCodes.Status403Forbidden)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult?> ValidateAsync<TRequest>(
        TRequest request,
        IValidator<TRequest> validator,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);

        if (validation.IsValid)
            return null;

        var errors = validation.Errors
            .Select(e => e.ErrorMessage)
            .ToList();

        return Results.BadRequest(
            ApiResponse<object>.Fail("Datos inválidos.", errors));
    }

    private static IResult Unauthorized(string message)
    {
        return Results.Json(
            ApiResponse<object>.Fail(message),
            statusCode: StatusCodes.Status401Unauthorized);
    }
}