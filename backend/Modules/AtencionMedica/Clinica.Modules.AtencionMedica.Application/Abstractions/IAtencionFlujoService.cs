using Clinica.Modules.AtencionMedica.Application.AtencionFlujo;

namespace Clinica.Modules.AtencionMedica.Application.Abstractions;

public interface IAtencionFlujoService
{
    Task<AtencionFlujoCompletitudResponse> GetCompletitudAsync(
        Guid atencionId,
        CancellationToken cancellationToken = default);

    Task<AvanzarAtencionFlujoResponse> AvanzarFlujoAsync(
        Guid atencionId,
        CancellationToken cancellationToken = default);
}
