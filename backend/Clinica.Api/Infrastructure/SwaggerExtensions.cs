using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

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
                Description = "API del sistema de clínica — monolito modular con módulos Seguridad, Parámetros, Recursos Humanos, Personas y Workflow."
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

            options.OrderActionsBy(api => $"{api.GroupName}_{api.RelativePath}");
            options.DocumentFilter<SeguridadTagOrderDocumentFilter>();
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

    private sealed class SeguridadTagOrderDocumentFilter : IDocumentFilter
    {
        private static readonly string[] TagOrder =
        [
            "Seguridad",
            "Seguridad · Autenticación",
            "Seguridad · Usuarios",
            "Seguridad · Roles",
            "Parametros",
            "Parametros · Catálogo grupos",
            "Parametros · Catálogo ítems",
            "RecursosHumanos",
            "RecursosHumanos · Áreas",
            "RecursosHumanos · Cargos",
            "RecursosHumanos · Profesiones",
            "RecursosHumanos · Especialidades",
            "RecursosHumanos · Departamentos",
            "RecursosHumanos · Servicios",
            "Personas",
            "Personas · Personas",
            "Personas · Pacientes",
            "Personas · Empleados",
            "Personas · Médicos",
            "Personas · Contactos de emergencia",
            "Workflow",
            "Sistema"
        ];

        public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
        {
            if (swaggerDoc.Tags is null || swaggerDoc.Tags.Count == 0)
                return;

            var tagIndex = TagOrder
                .Select((name, index) => (name, index))
                .ToDictionary(x => x.name, x => x.index, StringComparer.Ordinal);

            var orderedTags = swaggerDoc.Tags
                .OrderBy(tag => tag.Name is not null && tagIndex.TryGetValue(tag.Name, out var index)
                    ? index
                    : int.MaxValue)
                .ThenBy(tag => tag.Name, StringComparer.Ordinal)
                .ToList();

            swaggerDoc.Tags.Clear();

            foreach (var tag in orderedTags)
                swaggerDoc.Tags.Add(tag);
        }
    }
}
