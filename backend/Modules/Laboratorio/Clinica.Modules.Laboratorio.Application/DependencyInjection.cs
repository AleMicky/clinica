using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Clinica.Modules.Laboratorio.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddLaboratorioApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(AssemblyReference.Assembly);
        return services;
    }
}
