using Clinica.Api.Shared.Abstractions;
using Clinica.Api.Shared.Json;
using Clinica.Api.Shared.Middleware;
using Clinica.Api.Shared.Persistence;
using FluentValidation;

namespace Clinica.Api.Shared.Extensions;

public static class SharedExtensions
{
    public static IServiceCollection AddShared(
        this IServiceCollection services)
    {
        services.ConfigureHttpJsonOptions(options =>
        {
            options.SerializerOptions.Converters.Add(new DateOnlyJsonConverter());
            options.SerializerOptions.Converters.Add(new DateOnlyNullableJsonConverter());
        });

        services.Configure<Microsoft.AspNetCore.Mvc.JsonOptions>(options =>
        {
            options.JsonSerializerOptions.Converters.Add(new DateOnlyJsonConverter());
            options.JsonSerializerOptions.Converters.Add(new DateOnlyNullableJsonConverter());
        });

        services.AddProblemDetails();
        services.AddExceptionHandler<GlobalExceptionHandler>();

        services.AddHttpContextAccessor();
        services.AddSingleton<ICurrentUserService, CurrentUserService>();
        services.AddSingleton<AuditSaveChangesInterceptor>();
        
        services.AddValidatorsFromAssembly(
            typeof(SharedExtensions).Assembly,
            includeInternalTypes: true);

        return services;
    }

    public static WebApplication UseShared(
        this WebApplication app)
    {
        app.UseExceptionHandler();

        return app;
    }
}