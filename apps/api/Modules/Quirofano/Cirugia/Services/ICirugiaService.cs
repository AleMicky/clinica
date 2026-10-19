using Clinica.Api.Modules.Quirofano.Cirugia.Dtos;
using Clinica.Api.Modules.Quirofano.Cirugia.Enums;
using Clinica.Api.Shared.Pagination;

namespace Clinica.Api.Modules.Quirofano.Cirugia.Services;

public interface ICirugiaService
{
    Task<PagedResult<CirugiaResponse>> ListarAsync(
        EstadoCirugia? estado = null,
        TipoCirugia? tipo = null,
        int? cirujanoId = null,
        string? sala = null,
        DateOnly? fechaDesde = null,
        DateOnly? fechaHasta = null,
        string? search = null,
        PaginationRequest? pagination = null,
        CancellationToken cancellationToken = default);

    Task<CirugiaResponse> ObtenerPorIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<CirugiaMetricsResponse> ObtenerMetricasAsync(
        DateOnly? fechaDesde = null,
        DateOnly? fechaHasta = null,
        CancellationToken cancellationToken = default);

    Task<List<MaterialQuirofanoStockResponse>> ListarMaterialesStockAsync(
        int? almacenId = null,
        string? search = null,
        CancellationToken cancellationToken = default);

    Task<CirugiaResponse> CrearAsync(
        CreateCirugiaRequest request,
        CancellationToken cancellationToken = default);

    Task<CirugiaResponse> ActualizarAsync(
        int id,
        UpdateCirugiaRequest request,
        CancellationToken cancellationToken = default);

    Task<CirugiaResponse> IniciarCirugiaAsync(
        int id,
        IniciarCirugiaRequest request,
        CancellationToken cancellationToken = default);

    Task<CirugiaResponse> RegistrarGastosMaterialesAsync(
        int id,
        RegistrarGastoMaterialCirugiaRequest request,
        CancellationToken cancellationToken = default);

    Task<CirugiaResponse> FinalizarCirugiaAsync(
        int id,
        FinalizarCirugiaRequest request,
        CancellationToken cancellationToken = default);

    Task<CirugiaResponse> CancelarCirugiaAsync(
        int id,
        CancelarCirugiaRequest request,
        CancellationToken cancellationToken = default);
}
