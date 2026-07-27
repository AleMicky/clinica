using Clinica.Modules.Almacen.Application;
using Clinica.Modules.Almacen.Infrastructure;
using Clinica.Modules.Almacen.Presentation;
using Clinica.Modules.AtencionMedica.Application;
using Clinica.Modules.AtencionMedica.Infrastructure;
using Clinica.Modules.AtencionMedica.Presentation;
using Clinica.Modules.Caja.Application;
using Clinica.Modules.Caja.Infrastructure;
using Clinica.Modules.Caja.Presentation;
using Clinica.Modules.Compras.Application;
using Clinica.Modules.Compras.Infrastructure;
using Clinica.Modules.Compras.Presentation;
using Clinica.Modules.Farmacia.Application;
using Clinica.Modules.Farmacia.Infrastructure;
using Clinica.Modules.Farmacia.Presentation;
using Clinica.Modules.Laboratorio.Application;
using Clinica.Modules.Laboratorio.Infrastructure;
using Clinica.Modules.Laboratorio.Presentation;
using Clinica.Modules.Parametros.Application;
using Clinica.Modules.Parametros.Infrastructure;
using Clinica.Modules.Parametros.Presentation;
using Clinica.Modules.Personas.Application;
using Clinica.Modules.Personas.Infrastructure;
using Clinica.Modules.Personas.Presentation;
using Clinica.Modules.RecursosHumanos.Application;
using Clinica.Modules.RecursosHumanos.Infrastructure;
using Clinica.Modules.RecursosHumanos.Presentation;
using Clinica.Modules.Seguridad.Application;
using Clinica.Modules.Seguridad.Infrastructure;
using Clinica.Modules.Seguridad.Presentation;
using Clinica.Modules.Workflow.Application;
using Clinica.Modules.Workflow.Infrastructure;
using Clinica.Modules.Workflow.Presentation;

namespace Clinica.Api.Extensions;

public static class ModuleExtensions
{
    public static IServiceCollection AddClinicaModules(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services
            .AddSeguridadApplication()
            .AddSeguridadInfrastructure(configuration)
            .AddSeguridadPresentation();

        services
            .AddParametrosApplication()
            .AddParametrosInfrastructure(configuration)
            .AddParametrosPresentation();

        services
            .AddWorkflowApplication()
            .AddWorkflowInfrastructure(configuration)
            .AddWorkflowPresentation();

        services
            .AddRecursosHumanosApplication()
            .AddRecursosHumanosInfrastructure(configuration)
            .AddRecursosHumanosPresentation();

        services
            .AddPersonasApplication()
            .AddPersonasInfrastructure(configuration)
            .AddPersonasPresentation();

        services
            .AddAtencionMedicaApplication()
            .AddAtencionMedicaInfrastructure(configuration)
            .AddAtencionMedicaPresentation();

        services
            .AddLaboratorioApplication()
            .AddLaboratorioInfrastructure(configuration)
            .AddLaboratorioPresentation();

        services
            .AddCajaApplication()
            .AddCajaInfrastructure(configuration)
            .AddCajaPresentation();

        services
            .AddAlmacenApplication()
            .AddAlmacenInfrastructure(configuration)
            .AddAlmacenPresentation();

        services
            .AddComprasApplication()
            .AddComprasInfrastructure(configuration)
            .AddComprasPresentation();

        services
            .AddFarmaciaApplication()
            .AddFarmaciaInfrastructure(configuration)
            .AddFarmaciaPresentation();

        return services;
    }

    public static WebApplication MapClinicaModules(this WebApplication app)
    {
        app.MapSeguridadModule();
        app.MapParametrosModule();
        app.MapWorkflowModule();
        app.MapRecursosHumanosModule();
        app.MapPersonasModule();
        app.MapAtencionMedicaModule();
        app.MapLaboratorioModule();
        app.MapCajaModule();
        app.MapAlmacenModule();
        app.MapComprasModule();
        app.MapFarmaciaModule();

        return app;
    }
}
