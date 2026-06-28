using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.AtencionMedica.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddAtencionMedicaApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(AssemblyReference.Assembly);
        return services;
    }
}
