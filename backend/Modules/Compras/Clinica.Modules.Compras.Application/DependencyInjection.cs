using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Compras.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddComprasApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(AssemblyReference.Assembly);
        return services;
    }
}
