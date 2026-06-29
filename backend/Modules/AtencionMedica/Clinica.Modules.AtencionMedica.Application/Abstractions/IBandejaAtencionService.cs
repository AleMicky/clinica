using Clinica.Modules.AtencionMedica.Application.Atenciones;

namespace Clinica.Modules.AtencionMedica.Application.Abstractions;

public interface IBandejaAtencionService
{
    Task<IReadOnlyCollection<AtencionResponse>> GetPendientesEnfermeriaAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<AtencionResponse>> GetPendientesConsultaMedicaAsync(
        CancellationToken cancellationToken = default);
}
