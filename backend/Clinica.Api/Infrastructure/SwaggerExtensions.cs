using Clinica.Modules.Almacen.Presentation;
using Clinica.Modules.AtencionMedica.Presentation;
using Clinica.Modules.Caja.Presentation;
using Clinica.Modules.Compras.Presentation;
using Clinica.Modules.Farmacia.Presentation;
using Clinica.Modules.Laboratorio.Presentation;
using Clinica.Modules.Parametros.Presentation;
using Clinica.Modules.Personas.Presentation;
using Clinica.Modules.RecursosHumanos.Presentation;
using Clinica.Modules.Seguridad.Presentation;
using Clinica.Modules.Workflow.Presentation;
using Microsoft.AspNetCore.Http.Metadata;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Clinica.Api.Infrastructure;

public static class SwaggerExtensions
{
    public const string DocumentName = "v1";

    private static readonly string[] TagOrder =
    [
        SeguridadSwaggerTags.Module,
        SeguridadSwaggerTags.Auth,
        SeguridadSwaggerTags.Users,
        SeguridadSwaggerTags.Roles,
        ParametrosSwaggerTags.Module,
        ParametrosSwaggerTags.CatalogoGrupos,
        ParametrosSwaggerTags.CatalogoItems,
        ParametrosSwaggerTags.Correlativos,
        ParametrosSwaggerTags.UnidadesMedida,
        ParametrosSwaggerTags.Gestiones,
        ParametrosSwaggerTags.Periodos,
        RecursosHumanosSwaggerTags.Module,
        RecursosHumanosSwaggerTags.Areas,
        RecursosHumanosSwaggerTags.TiposArea,
        RecursosHumanosSwaggerTags.Cargos,
        RecursosHumanosSwaggerTags.Profesiones,
        RecursosHumanosSwaggerTags.Especialidades,
        RecursosHumanosSwaggerTags.Empleados,
        RecursosHumanosSwaggerTags.Jerarquia,
        LaboratorioSwaggerTags.Module,
        LaboratorioSwaggerTags.Especialidades,
        LaboratorioSwaggerTags.TiposExamen,
        LaboratorioSwaggerTags.Pruebas,
        LaboratorioSwaggerTags.PruebaPrecios,
        LaboratorioSwaggerTags.Parametros,
        LaboratorioSwaggerTags.ValoresReferencia,
        LaboratorioSwaggerTags.Solicitudes,
        LaboratorioSwaggerTags.Muestras,
        LaboratorioSwaggerTags.Resultados,
        CajaSwaggerTags.Module,
        CajaSwaggerTags.Cajas,
        CajaSwaggerTags.Turnos,
        CajaSwaggerTags.Cuentas,
        CajaSwaggerTags.Pagos,
        CajaSwaggerTags.Movimientos,
        CajaSwaggerTags.Catalogos,
        AlmacenSwaggerTags.Module,
        AlmacenSwaggerTags.Categorias,
        AlmacenSwaggerTags.Productos,
        AlmacenSwaggerTags.Existencias,
        AlmacenSwaggerTags.Lotes,
        AlmacenSwaggerTags.Movimientos,
        ComprasSwaggerTags.Module,
        ComprasSwaggerTags.Proveedores,
        ComprasSwaggerTags.Ordenes,
        FarmaciaSwaggerTags.Module,
        FarmaciaSwaggerTags.Precios,
        FarmaciaSwaggerTags.Recetas,
        FarmaciaSwaggerTags.Dispensaciones,
        PersonasSwaggerTags.Module,
        PersonasSwaggerTags.Personas,
        PersonasSwaggerTags.Pacientes,
        PersonasSwaggerTags.Medicos,
        PersonasSwaggerTags.ContactosEmergencia,
        AtencionMedicaSwaggerTags.Module,
        AtencionMedicaSwaggerTags.TiposAtencion,
        AtencionMedicaSwaggerTags.TiposCampoFormulario,
        AtencionMedicaSwaggerTags.FormulariosClinicos,
        AtencionMedicaSwaggerTags.FormularioSecciones,
        AtencionMedicaSwaggerTags.FormularioCampos,
        AtencionMedicaSwaggerTags.Atenciones,
        AtencionMedicaSwaggerTags.AtencionRespuestas,
        WorkflowSwaggerTags.Module,
        WorkflowSwaggerTags.Definitions,
        WorkflowSwaggerTags.States,
        WorkflowSwaggerTags.Transitions,
        WorkflowSwaggerTags.Instances,
        "Sistema"
    ];

    private static readonly Dictionary<string, int> TagIndex = TagOrder
        .Select((name, index) => (name, index))
        .ToDictionary(x => x.name, x => x.index, StringComparer.Ordinal);

    public static IServiceCollection AddClinicaSwagger(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc(DocumentName, new OpenApiInfo
            {
                Title = "Clinica API",
                Version = DocumentName,
                Description = "API del sistema de clínica — monolito modular con módulos Seguridad, Parámetros, Recursos Humanos, Laboratorio, Caja, Almacén, Compras, Farmacia, Personas, Atención Médica y Workflow."
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

            // Evita colisiones entre DTOs homónimos de distintos módulos (p. ej. EspecialidadResponse).
            options.CustomSchemaIds(type => BuildSchemaId(type));

            options.OrderActionsBy(api =>
            {
                var tag = api.ActionDescriptor.EndpointMetadata
                    .OfType<ITagsMetadata>()
                    .SelectMany(metadata => metadata.Tags)
                    .FirstOrDefault()
                    ?? api.GroupName
                    ?? string.Empty;

                var tagOrder = TagIndex.TryGetValue(tag, out var index) ? index : int.MaxValue;
                return $"{tagOrder:D4}_{tag}_{api.RelativePath}_{api.HttpMethod}";
            });

            options.DocumentFilter<ModuleTagOrderDocumentFilter>();
        });

        return services;
    }

    private static string BuildSchemaId(Type type)
    {
        if (!type.IsGenericType)
            return SanitizeSchemaId(type.FullName ?? type.Name);

        var definitionName = type.GetGenericTypeDefinition().FullName!;
        var tickIndex = definitionName.IndexOf('`');
        if (tickIndex >= 0)
            definitionName = definitionName[..tickIndex];

        var argumentIds = string.Join("And", type.GetGenericArguments().Select(BuildSchemaId));
        return SanitizeSchemaId($"{definitionName}Of{argumentIds}");
    }

    private static string SanitizeSchemaId(string value) =>
        value
            .Replace('+', '.')
            .Replace('.', '_')
            .Replace(',', '_')
            .Replace(' ', '_');

    public static WebApplication UseClinicaSwagger(this WebApplication app)
    {
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint($"/swagger/{DocumentName}/swagger.json", "Clinica API v1");
            options.RoutePrefix = "swagger";
            options.DocumentTitle = "Clinica API";
            options.DisplayRequestDuration();
            options.EnablePersistAuthorization();
        });

        return app;
    }

    private sealed class ModuleTagOrderDocumentFilter : IDocumentFilter
    {
        public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
        {
            var existingByName = (swaggerDoc.Tags ?? Enumerable.Empty<OpenApiTag>())
                .Where(tag => tag.Name is not null)
                .GroupBy(tag => tag.Name!, StringComparer.Ordinal)
                .ToDictionary(group => group.Key, group => group.First(), StringComparer.Ordinal);

            var usedTagNames = swaggerDoc.Paths.Values
                .SelectMany(path => path.Operations?.Values ?? Enumerable.Empty<OpenApiOperation>())
                .SelectMany(operation => operation.Tags ?? Enumerable.Empty<OpenApiTagReference>())
                .Select(tag => tag.Name)
                .Where(name => !string.IsNullOrWhiteSpace(name))
                .Cast<string>()
                .ToHashSet(StringComparer.Ordinal);

            foreach (var name in existingByName.Keys)
                usedTagNames.Add(name);

            var orderedTags = TagOrder
                .Where(usedTagNames.Contains)
                .Concat(usedTagNames
                    .Where(name => !TagIndex.ContainsKey(name))
                    .OrderBy(name => name, StringComparer.Ordinal))
                .Select(name => existingByName.TryGetValue(name, out var existing)
                    ? existing
                    : new OpenApiTag { Name = name })
                .ToList();

            swaggerDoc.Tags ??= new HashSet<OpenApiTag>();
            swaggerDoc.Tags.Clear();

            foreach (var tag in orderedTags)
                swaggerDoc.Tags.Add(tag);
        }
    }
}
