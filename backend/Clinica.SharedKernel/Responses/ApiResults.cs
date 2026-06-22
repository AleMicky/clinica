using Microsoft.AspNetCore.Http;

namespace Clinica.SharedKernel.Responses;

public static class ApiResults
{
    public static IResult Ok<T>(
        T data,
        string message = "Operación realizada correctamente")
    {
        return Results.Ok(new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data
        });
    }

    public static IResult Created<T>(
        T data,
        string message = "Registro creado correctamente")
    {
        return Results.Created(string.Empty,
            new ApiResponse<T>
            {
                Success = true,
                Message = message,
                Data = data
            });
    }

    public static IResult NoContent()
    {
        return Results.NoContent();
    }

    public static IResult BadRequest(
        string message)
    {
        return Results.BadRequest(
            new ApiResponse<object>
            {
                Success = false,
                Message = message
            });
    }

    public static IResult NotFound(
        string message)
    {
        return Results.NotFound(
            new ApiResponse<object>
            {
                Success = false,
                Message = message
            });
    }
}