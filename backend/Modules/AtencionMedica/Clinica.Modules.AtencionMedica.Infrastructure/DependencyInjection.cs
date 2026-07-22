using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Clinica.Modules.AtencionMedica.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.AtencionMedica.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddAtencionMedicaInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AtencionMedicaDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<ITipoAtencionService, TipoAtencionService>();
        services.AddScoped<ITipoCampoFormularioService, TipoCampoFormularioService>();
        services.AddScoped<IFormularioClinicoService, FormularioClinicoService>();
        services.AddScoped<IFormularioSeccionService, FormularioSeccionService>();
        services.AddScoped<IFormularioCampoService, FormularioCampoService>();
        services.AddScoped<IAtencionService, AtencionService>();
        services.AddScoped<IBandejaAtencionService, BandejaAtencionService>();
        services.AddScoped<IAtencionFlujoService, AtencionFlujoService>();
        services.AddScoped<IWorkflowService, AtencionWorkflowService>();
        services.AddScoped<IAtencionFormularioRespuestaService, AtencionFormularioRespuestaService>();
        services.AddScoped<ISignoVitalService, SignoVitalService>();
        services.AddScoped<ITratamientoService, TratamientoService>();
        services.AddScoped<IEstudioService, EstudioService>();
        services.AddScoped<IResultadoEstudioService, ResultadoEstudioService>();
        services.AddScoped<IInterconsultaService, InterconsultaService>();
        services.AddScoped<IPrescripcionService, PrescripcionService>();
        services.AddScoped<IPrescripcionDetalleService, PrescripcionDetalleService>();

        return services;
    }
}
