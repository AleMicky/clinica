using System.Net;
using Clinica.SharedKernel.Exceptions;
using Clinica.SharedKernel.Responses;

namespace Clinica.Api.Middleware;

public sealed class ExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (NotFoundException ex)
        {
            await WriteErrorAsync(
                context,
                HttpStatusCode.NotFound,
                ex.Message);
        }
        catch (BadRequestException ex)
        {
            await WriteErrorAsync(
                context,
                HttpStatusCode.BadRequest,
                ex.Message);
        }
        catch (BusinessException ex)
        {
            await WriteErrorAsync(
                context,
                HttpStatusCode.BadRequest,
                ex.Message);
        }
        catch (ValidationException ex)
        {
            await WriteErrorAsync(
                context,
                (HttpStatusCode)422,
                ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            await WriteErrorAsync(
                context,
                HttpStatusCode.Unauthorized,
                ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error no controlado.");

            await WriteErrorAsync(
                context,
                HttpStatusCode.InternalServerError,
                "Ocurrió un error interno.");
        }
    }

    private static async Task WriteErrorAsync(
        HttpContext context,
        HttpStatusCode statusCode,
        string message)
    {
        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        await context.Response.WriteAsJsonAsync(
            new ApiResponse<object>
            {
                Success = false,
                Message = message
            });
    }
}