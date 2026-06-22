using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Parametros.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddParametrosApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(AssemblyReference.Assembly);
        return services;
    }
}
