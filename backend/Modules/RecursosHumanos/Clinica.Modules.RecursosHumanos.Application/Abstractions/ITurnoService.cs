using Clinica.Modules.RecursosHumanos.Application.ProgramacionDiaria;
using Clinica.Modules.RecursosHumanos.Application.Turnos;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.RecursosHumanos.Application.Abstractions;

public interface ITurnoService
    : ICrudService<Guid, TurnoResponse, CreateTurnoRequest, UpdateTurnoRequest>
{
    Task<PagedResult<TurnoResponse>> GetPagedAsync(
        TurnoPagedRequest request,
        CancellationToken cancellationToken = default);
}

public interface IProgramacionDiariaService
    : ICrudService<Guid, ProgramacionDiariaResponse, CreateProgramacionDiariaRequest, UpdateProgramacionDiariaRequest>
{
    Task<PagedResult<ProgramacionDiariaResponse>> GetPagedAsync(
        ProgramacionDiariaPagedRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<MedicoDisponibilidadResponse>> GetDisponibilidadAsync(
        MedicoDisponibilidadRequest request,
        CancellationToken cancellationToken = default);

    Task EnsureMedicoDisponibleAsync(
        ValidarMedicoProgramadoRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ProgramacionLookupResponse>> GetProgramacionesLookupAsync(
        CancellationToken cancellationToken = default);
}
