using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Caja.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddCajaApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(AssemblyReference.Assembly);
        return services;
    }
}
