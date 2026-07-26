using Clinica.Modules.Laboratorio.Application.Abstractions;
using Clinica.Modules.Laboratorio.Infrastructure.Persistence;
using Clinica.Modules.Laboratorio.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Laboratorio.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddLaboratorioInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<LaboratorioDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IEspecialidadService, EspecialidadService>();
        services.AddScoped<ITipoExamenService, TipoExamenService>();
        services.AddScoped<IPruebaService, PruebaService>();

        return services;
    }
}
