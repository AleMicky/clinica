using Clinica.Api.Shared.Abstractions;
using Clinica.Api.Shared.Middleware;
using Clinica.Api.Shared.Persistence;
using Microsoft.AspNetCore.Http;

namespace Clinica.Api.Shared.Extensions;

public static class SharedExtensions
{
    public static IServiceCollection AddShared(
        this IServiceCollection services)
    {
        services.AddProblemDetails();
        services.AddExceptionHandler<GlobalExceptionHandler>();

        services.AddHttpContextAccessor();
        services.AddSingleton<ICurrentUserService, CurrentUserService>();
        services.AddSingleton<AuditSaveChangesInterceptor>();

        return services;
    }

    public static WebApplication UseShared(
        this WebApplication app)
    {
        app.UseExceptionHandler();

        return app;
    }
}