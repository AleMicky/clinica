using Clinica.Modules.Parametros.Application.Abstractions;
using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.Modules.Parametros.Infrastructure.Persistence;
using Clinica.Modules.Parametros.Infrastructure.Persistence.Repositories;
using Clinica.Modules.Parametros.Infrastructure.Services;
using Clinica.SharedKernel.Abstractions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Parametros.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddParametrosInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<ParametrosDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<ICatalogoGrupoService, CatalogoGrupoService>();

        return services;
    }
}
