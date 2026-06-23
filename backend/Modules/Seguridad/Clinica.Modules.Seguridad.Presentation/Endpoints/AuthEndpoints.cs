using Clinica.Modules.Seguridad.Application.Abstractions;
using Clinica.Modules.Seguridad.Application.Auth;
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
            .AllowAnonymous()
            .WithTags("Autenticación");

        auth.MapPost("/login", LoginAsync)
            .WithName("Seguridad_Login")
            .WithSummary("Inicia sesión en el sistema")
            .Produces<ApiResponse<LoginResponse>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
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
        {
            var errors = validation.Errors
                .Select(x => x.ErrorMessage)
                .Distinct()
                .ToList();

            return ApiResults.BadRequest(string.Join(", ", errors));
        }

        var result = await authService.LoginAsync(request, cancellationToken);

        return ApiResults.Ok(result, "Inicio de sesión exitoso.");
    }
}