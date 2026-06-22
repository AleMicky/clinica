using Microsoft.OpenApi;

namespace Clinica.Api.Infrastructure;

public static class SwaggerExtensions
{
    public const string DocumentName = "v1";

    public static IServiceCollection AddClinicaSwagger(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc(DocumentName, new OpenApiInfo
            {
                Title = "Clinica API",
                Version = DocumentName,
                Description = "API del sistema de clínica — monolito modular con módulos Seguridad, Parámetros y Workflow."
            });

            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Token JWT. Ejemplo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            });

            options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference("Bearer", document)] = []
            });
        });

        return services;
    }

    public static WebApplication UseClinicaSwagger(this WebApplication app)
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint($"/swagger/{DocumentName}/swagger.json", "Clinica API v1");
            options.RoutePrefix = "swagger";
            options.DocumentTitle = "Clinica API";
            options.DisplayRequestDuration();
        });

        return app;
    }
}
