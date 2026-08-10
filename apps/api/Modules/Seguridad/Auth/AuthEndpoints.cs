using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace Clinica.Api.Modules.Seguridad.Auth;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(
        this IEndpointRouteBuilder app)
    {
        var group = app
            .MapGroup("/auth")
            .WithTags("Auth");

        group.MapPost("/login", Login)
            .AllowAnonymous();

        group.MapGet("/me", Me)
            .RequireAuthorization();

        group.MapPost("/change-password", ChangePassword)
            .RequireAuthorization();

        group.MapPost("/logout", Logout)
            .RequireAuthorization();

        group.MapPost("/refresh", Refresh)
            .RequireAuthorization();

        return app;
    }

    private static async Task<IResult> Login(
        LoginRequest request,
        AuthService service)
    {
        return Results.Ok(
            await service.LoginAsync(request));
    }

    private static async Task<IResult> Me(
        ClaimsPrincipal user,
        AuthService service)
    {
        return Results.Ok(
            await service.MeAsync(user));
    }

    private static async Task<IResult> ChangePassword(
        ClaimsPrincipal user,
        ChangePasswordRequest request,
        AuthService service)
    {
        await service.ChangePasswordAsync(
            user,
            request);

        return Results.NoContent();
    }

    private static async Task<IResult> Logout(
        AuthService service)
    {
        return Results.Ok(
            await service.LogoutAsync());
    }

    private static async Task<IResult> Refresh(
        ClaimsPrincipal user,
        RefreshTokenRequest request,
        AuthService service)
    {
        return Results.Ok(
            await service.RefreshAsync(user, request));
    }
}