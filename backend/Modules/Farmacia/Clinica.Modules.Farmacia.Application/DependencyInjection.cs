using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Farmacia.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddFarmaciaApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(AssemblyReference.Assembly);
        return services;
    }
}
