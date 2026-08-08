namespace Clinica.Api.Shared.Validation;

public static class ValidationEndpointExtensions
{
    public static RouteHandlerBuilder Validate<TRequest>(
        this RouteHandlerBuilder builder)
        where TRequest : class
    {
        return builder.AddEndpointFilter<
            ValidationFilter<TRequest>>();
    }
}