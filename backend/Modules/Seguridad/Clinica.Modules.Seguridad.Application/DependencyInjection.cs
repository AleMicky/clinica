using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Seguridad.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddSeguridadApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(AssemblyReference.Assembly);
        return services;
    }
}
