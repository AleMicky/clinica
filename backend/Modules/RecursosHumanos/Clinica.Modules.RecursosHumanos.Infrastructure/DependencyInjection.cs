using Clinica.Modules.RecursosHumanos.Application.Abstractions;
using Clinica.Modules.RecursosHumanos.Infrastructure.Persistence;
using Clinica.Modules.RecursosHumanos.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.RecursosHumanos.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddRecursosHumanosInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<RecursosHumanosDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IAreaService, AreaService>();
        services.AddScoped<ICargoService, CargoService>();
        services.AddScoped<IProfesionService, ProfesionService>();
        services.AddScoped<IEspecialidadService, EspecialidadService>();
        services.AddScoped<IDepartamentoService, DepartamentoService>();
        services.AddScoped<IServicioService, ServicioService>();

        return services;
    }
}
