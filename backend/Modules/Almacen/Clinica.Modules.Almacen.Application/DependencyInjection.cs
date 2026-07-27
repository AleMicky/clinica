using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Almacen.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddAlmacenApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(AssemblyReference.Assembly);
        return services;
    }
}
