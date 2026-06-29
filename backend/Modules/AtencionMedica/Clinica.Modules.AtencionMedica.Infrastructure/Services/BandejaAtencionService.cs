using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.AtencionMedica.Application.Atenciones;
using Clinica.Modules.AtencionMedica.Domain.Constants;
using Clinica.Modules.AtencionMedica.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class BandejaAtencionService(AtencionMedicaDbContext context) : IBandejaAtencionService
{
    public Task<IReadOnlyCollection<AtencionResponse>> GetPendientesEnfermeriaAsync(
        CancellationToken cancellationToken = default)
    {
        return GetPendientesPorEstadosAsync(
            [AtencionEstados.Enfermeria, AtencionEstados.Triaje],
            cancellationToken);
    }

    public Task<IReadOnlyCollection<AtencionResponse>> GetPendientesConsultaMedicaAsync(
        CancellationToken cancellationToken = default)
    {
        return GetPendientesPorEstadosAsync(
            [AtencionEstados.ConsultaMedica],
            cancellationToken);
    }

    private async Task<IReadOnlyCollection<AtencionResponse>> GetPendientesPorEstadosAsync(
        IReadOnlyCollection<string> estados,
        CancellationToken cancellationToken)
    {
        return await context.Atenciones
            .AsNoTracking()
            .Where(x => estados.Contains(x.Estado))
            .OrderByDescending(x => x.FechaAtencion)
            .ThenBy(x => x.NumeroAtencion)
            .Select(x => AtencionMappings.ToResponse(x))
            .ToListAsync(cancellationToken);
    }
}
