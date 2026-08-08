using FluentValidation;

namespace Clinica.Api.Shared.Validation;

public sealed class ValidationFilter<TRequest>(
    IValidator<TRequest> validator)
    : IEndpointFilter
    where TRequest : class
{
    public async ValueTask<object?> InvokeAsync(
        EndpointFilterInvocationContext context,
        EndpointFilterDelegate next)
    {
        var request = context.Arguments
            .OfType<TRequest>()
            .FirstOrDefault();

        if (request is null)
        {
            return Results.BadRequest(new
            {
                message = "El cuerpo de la solicitud es obligatorio."
            });
        }

        var validationResult = await validator.ValidateAsync(
            request,
            context.HttpContext.RequestAborted);

        if (!validationResult.IsValid)
        {
            return Results.ValidationProblem(
                validationResult.ToDictionary(),
                statusCode: StatusCodes.Status400BadRequest,
                title: "Error de validación");
        }

        return await next(context);
    }
}