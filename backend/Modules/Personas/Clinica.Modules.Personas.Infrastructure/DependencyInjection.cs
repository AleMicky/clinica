using Clinica.Modules.Personas.Application.Abstractions;
using Clinica.Modules.Personas.Infrastructure.Persistence;
using Clinica.Modules.Personas.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Personas.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddPersonasInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<PersonasDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IPersonaService, PersonaService>();
        services.AddScoped<IPacienteService, PacienteService>();
        services.AddScoped<IEmpleadoService, EmpleadoService>();
        services.AddScoped<IMedicoService, MedicoService>();
        services.AddScoped<IContactoEmergenciaService, ContactoEmergenciaService>();

        return services;
    }
}
