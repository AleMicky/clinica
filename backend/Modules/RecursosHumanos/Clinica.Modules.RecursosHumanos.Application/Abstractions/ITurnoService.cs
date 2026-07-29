using Clinica.Modules.RecursosHumanos.Application.GrupoProgramacion;
using Clinica.Modules.RecursosHumanos.Application.Programacion;
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

public interface IGrupoProgramacionService
    : ICrudService<Guid, GrupoProgramacionResponse, CreateGrupoProgramacionRequest, UpdateGrupoProgramacionRequest>
{
    Task<PagedResult<GrupoProgramacionResponse>> GetPagedAsync(
        GrupoProgramacionPagedRequest request,
        CancellationToken cancellationToken = default);

    Task<GrupoProgramacionResponse> SetEmpleadosAsync(
        Guid id,
        SetGrupoProgramacionEmpleadosRequest request,
        CancellationToken cancellationToken = default);
}

public interface IProgramacionService
    : ICrudService<Guid, ProgramacionResponse, CreateProgramacionRequest, UpdateProgramacionRequest>
{
    Task<PagedResult<ProgramacionResponse>> GetPagedAsync(
        ProgramacionPagedRequest request,
        CancellationToken cancellationToken = default);

    Task<ProgramacionResponse> UpdateEstadoAsync(
        Guid id,
        UpdateProgramacionEstadoRequest request,
        CancellationToken cancellationToken = default);
}
