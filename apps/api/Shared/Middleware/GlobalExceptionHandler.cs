using Clinica.Api.Shared.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Clinica.Api.Shared.Middleware;

public sealed class GlobalExceptionHandler(
    ILogger<GlobalExceptionHandler> logger)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        logger.LogError(
            exception,
            "Error no controlado: {Message}",
            exception.Message);

        var problemDetails = exception switch
        {
            NotFoundException notFound => new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Recurso no encontrado",
                Detail = notFound.Message
            },

            ConflictException conflict => new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Conflicto",
                Detail = conflict.Message
            },

            BusinessException business => new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Regla de negocio",
                Detail = business.Message
            },

            ValidationException validation => CreateValidationProblem(
                validation),

            UnauthorizedAccessException unauthorized => new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "No autorizado",
                Detail = unauthorized.Message
            },

            _ => new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Error interno",
                Detail = "Ocurrió un error inesperado."
            }
        };

        problemDetails.Instance = httpContext.Request.Path;

        httpContext.Response.StatusCode =
            problemDetails.Status
            ?? StatusCodes.Status500InternalServerError;

        await httpContext.Response.WriteAsJsonAsync(
            problemDetails,
            cancellationToken);

        return true;
    }

    private static HttpValidationProblemDetails CreateValidationProblem(
        ValidationException exception)
    {
        return new HttpValidationProblemDetails(
            exception.Errors.ToDictionary(
                x => x.Key,
                x => x.Value))
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Error de validación",
            Detail = exception.Message
        };
    }
}