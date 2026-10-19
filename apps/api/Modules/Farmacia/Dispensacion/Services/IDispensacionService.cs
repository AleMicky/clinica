using Clinica.Api.Modules.Farmacia.Dispensacion.Dtos;
using Clinica.Api.Modules.Farmacia.Dispensacion.Enums;
using Clinica.Api.Shared.Pagination;

namespace Clinica.Api.Modules.Farmacia.Dispensacion.Services;

public interface IDispensacionService
{
    Task<PagedResult<DispensacionResponse>> ListarAsync(
        PaginationRequest pagination,
        string? search = null,
        EstadoDispensacion? estado = null,
        TipoDispensacion? tipo = null,
        int? almacenId = null,
        DateOnly? fechaDesde = null,
        DateOnly? fechaHasta = null,
        CancellationToken cancellationToken = default);

    Task<DispensacionResponse> ObtenerPorIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<DispensacionMetricsResponse> ObtenerMetricasAsync(
        int? almacenId = null,
        DateOnly? fechaDesde = null,
        DateOnly? fechaHasta = null,
        CancellationToken cancellationToken = default);

    Task<List<MedicamentoStockResponse>> ListarMedicamentosStockAsync(
        int almacenId,
        string? search = null,
        CancellationToken cancellationToken = default);

    Task<DispensacionResponse> CrearAsync(
        CreateDispensacionRequest request,
        CancellationToken cancellationToken = default);

    Task<DispensacionResponse> RegistrarCobroAsync(
        int id,
        RegistrarCobroDispensacionRequest request,
        CancellationToken cancellationToken = default);

    Task<DispensacionResponse> EntregarMedicamentosAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<DispensacionResponse> AnularAsync(
        int id,
        AnularDispensacionRequest request,
        CancellationToken cancellationToken = default);
}
