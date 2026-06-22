using System.Diagnostics;
using Clinica.SharedKernel.Responses;
using Clinica.SharedKernel.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Clinica.Api.Infrastructure;

public sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is UnauthorizedAccessException unauthorized)
        {
            _logger.LogWarning("Acceso no autorizado: {Message}", unauthorized.Message);
        }
        else
        {
            _logger.LogError(exception, "Error no controlado: {Message}", exception.Message);
        }

        var (statusCode, message) = exception switch
        {
            NotFoundException notFound => (StatusCodes.Status404NotFound, notFound.Message),
            ArgumentException argument => (StatusCodes.Status400BadRequest, argument.Message),
            UnauthorizedAccessException authEx => (StatusCodes.Status401Unauthorized, authEx.Message),
            _ => (StatusCodes.Status500InternalServerError, "Ha ocurrido un error interno.")
        };

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = message,
            Detail = exception.Message,
            Instance = httpContext.Request.Path
        };

        problemDetails.Extensions["traceId"] = Activity.Current?.Id ?? httpContext.TraceIdentifier;
        problemDetails.Extensions["response"] = ApiResponse<object>.Fail(message);

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }
}
