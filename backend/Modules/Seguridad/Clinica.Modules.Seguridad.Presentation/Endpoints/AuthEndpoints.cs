using Clinica.Modules.Seguridad.Application.Abstractions;
using Clinica.Modules.Seguridad.Application.Auth;
using Clinica.Modules.Seguridad.Application.Users;
using Clinica.SharedKernel.Responses;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Clinica.Modules.Seguridad.Presentation.Endpoints;

public static class AuthEndpoints
{
    public static RouteGroupBuilder MapAuthEndpoints(this RouteGroupBuilder group)
    {
        var auth = group.MapGroup("/auth")
            .WithTags(SeguridadSwaggerTags.Auth);

        auth.MapPost("/login", LoginAsync)
            .AllowAnonymous()
            .WithName("Seguridad_Login")
            .WithSummary("Inicia sesión en el sistema")
            .Produces<ApiResponse<LoginResponse>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized);

        auth.MapPost("/refresh", RefreshTokenAsync)
            .AllowAnonymous()
            .WithName("Seguridad_RefreshToken")
            .WithSummary("Renueva el token de acceso usando un refresh token")
            .Produces<ApiResponse<LoginResponse>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized);

        auth.MapPost("/forgot-password", ForgotPasswordAsync)
            .AllowAnonymous()
            .WithName("Seguridad_ForgotPassword")
            .WithSummary("Solicita el restablecimiento de contraseña")
            .Produces<ApiResponse<ForgotPasswordResponse>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest);

        auth.MapPost("/reset-password", ResetPasswordAsync)
            .AllowAnonymous()
            .WithName("Seguridad_ResetPassword")
            .WithSummary("Restablece la contraseña con un token válido")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest);

        auth.MapGet("/me", GetMeAsync)
            .RequireAuthorization()
            .WithName("Seguridad_GetMe")
            .WithSummary("Obtiene el perfil del usuario autenticado")
            .Produces<ApiResponse<UserResponse>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized);

        auth.MapPost("/change-password", ChangePasswordAsync)
            .RequireAuthorization()
            .WithName("Seguridad_ChangePassword")
            .WithSummary("Cambia la contraseña del usuario autenticado")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized);

        auth.MapPost("/logout", LogoutAsync)
            .RequireAuthorization()
            .WithName("Seguridad_Logout")
            .WithSummary("Cierra sesión revocando el refresh token")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized);

        return group;
    }

    private static async Task<IResult> LoginAsync(
        LoginRequest request,
        IValidator<LoginRequest> validator,
        IAuthService authService,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);

        if (!validation.IsValid)
            return ApiResults.BadRequest(GetValidationErrors(validation));

        var result = await authService.LoginAsync(request, cancellationToken);

        return ApiResults.Ok(result, "Inicio de sesión exitoso.");
    }

    private static async Task<IResult> RefreshTokenAsync(
        RefreshTokenRequest request,
        IValidator<RefreshTokenRequest> validator,
        IAuthService authService,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);

        if (!validation.IsValid)
            return ApiResults.BadRequest(GetValidationErrors(validation));

        var result = await authService.RefreshTokenAsync(request, cancellationToken);

        return ApiResults.Ok(result, "Token renovado correctamente.");
    }

    private static async Task<IResult> ForgotPasswordAsync(
        ForgotPasswordRequest request,
        IValidator<ForgotPasswordRequest> validator,
        IAuthService authService,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);

        if (!validation.IsValid)
            return ApiResults.BadRequest(GetValidationErrors(validation));

        var result = await authService.ForgotPasswordAsync(request, cancellationToken);

        return ApiResults.Ok(result);
    }

    private static async Task<IResult> ResetPasswordAsync(
        ResetPasswordRequest request,
        IValidator<ResetPasswordRequest> validator,
        IAuthService authService,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);

        if (!validation.IsValid)
            return ApiResults.BadRequest(GetValidationErrors(validation));

        await authService.ResetPasswordAsync(request, cancellationToken);

        return ApiResults.NoContent();
    }

    private static async Task<IResult> GetMeAsync(
        IAuthService authService,
        CancellationToken cancellationToken)
    {
        var user = await authService.GetMeAsync(cancellationToken);

        return ApiResults.Ok(user);
    }

    private static async Task<IResult> ChangePasswordAsync(
        ChangePasswordRequest request,
        IValidator<ChangePasswordRequest> validator,
        IAuthService authService,
        CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);

        if (!validation.IsValid)
            return ApiResults.BadRequest(GetValidationErrors(validation));

        await authService.ChangePasswordAsync(request, cancellationToken);

        return ApiResults.NoContent();
    }

    private static async Task<IResult> LogoutAsync(
        IAuthService authService,
        CancellationToken cancellationToken)
    {
        await authService.LogoutAsync(cancellationToken);

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
