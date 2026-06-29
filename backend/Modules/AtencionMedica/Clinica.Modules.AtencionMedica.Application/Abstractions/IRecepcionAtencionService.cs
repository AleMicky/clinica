using Clinica.Modules.AtencionMedica.Application.Atenciones;
using Clinica.Modules.AtencionMedica.Application.Recepcion;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.AtencionMedica.Application.Abstractions;

public interface IRecepcionAtencionService
{
    Task<AtencionResponse> CrearRecepcionAtencionAsync(
        CrearRecepcionAtencionRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<AtencionResponse>> GetPendientesAsync(
        CancellationToken cancellationToken = default);

    Task<AtencionResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);
}
