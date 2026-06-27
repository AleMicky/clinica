using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Personas.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddPersonasApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(AssemblyReference.Assembly);
        return services;
    }
}
