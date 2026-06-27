using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.RecursosHumanos.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddRecursosHumanosApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(AssemblyReference.Assembly);
        return services;
    }
}
