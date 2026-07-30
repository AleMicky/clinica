using Clinica.Modules.Caja.Application.Arqueos;
using Clinica.Modules.Caja.Application.Cajas;
using Clinica.Modules.Caja.Application.Cargos;
using Clinica.Modules.Caja.Application.Catalogos;
using Clinica.Modules.Caja.Application.Cuentas;
using Clinica.Modules.Caja.Application.Movimientos;
using Clinica.Modules.Caja.Application.Pagos;
using Clinica.Modules.Caja.Application.Turnos;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Caja.Application.Abstractions;

public interface ICajaCargoService
{
    Task<CuentaResponse> AgregarCargosAsync(
        AgregarCargosRequest request,
        CancellationToken cancellationToken = default);

    Task<CuentaResponse?> GetByReferenciaAsync(
        string moduloOrigen,
        string entidadOrigen,
        Guid referenciaId,
        CancellationToken cancellationToken = default);

    Task<bool> EstaPagadaAsync(
        string moduloOrigen,
        string entidadOrigen,
        Guid referenciaId,
        CancellationToken cancellationToken = default);
}

public interface ICajaCuentaService
{
    Task<PagedResult<CuentaListItemResponse>> GetPagedAsync(
        CuentaPagedRequest request,
        CancellationToken cancellationToken = default);

    Task<CuentaResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task AnularAsync(
        Guid id,
        AnularCuentaRequest? request = null,
        CancellationToken cancellationToken = default);
}

public interface ICajaPagoService
{
    Task<PagoDetalleCompletoResponse> RegistrarPagoAsync(
        RegistrarPagoRequest request,
        CancellationToken cancellationToken = default);

    Task<PagedResult<PagoListItemResponse>> GetPagedAsync(
        PagoPagedRequest request,
        CancellationToken cancellationToken = default);

    Task<PagoDetalleCompletoResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task AnularAsync(
        Guid id,
        AnularPagoRequest request,
        CancellationToken cancellationToken = default);

    Task<ReciboResponse?> GetReciboAsync(
        Guid pagoId,
        CancellationToken cancellationToken = default);
}

public interface ICajaFisicaService
{
    Task<PagedResult<CajaResponse>> GetPagedAsync(
        CajaPagedRequest request,
        CancellationToken cancellationToken = default);

    Task<CajaResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<CajaResponse> CreateAsync(CreateCajaRequest request, CancellationToken cancellationToken = default);

    Task<CajaResponse> UpdateAsync(Guid id, UpdateCajaRequest request, CancellationToken cancellationToken = default);

    Task ChangeStatusAsync(Guid id, ChangeCajaStatusRequest request, CancellationToken cancellationToken = default);
}

public interface ITurnoCajaService
{
    Task<TurnoCajaResponse> AbrirAsync(AbrirTurnoCajaRequest request, CancellationToken cancellationToken = default);

    Task<TurnoCajaResponse?> ObtenerTurnoAbiertoAsync(CancellationToken cancellationToken = default);

    Task<TurnoCajaResponse> CerrarAsync(Guid id, CerrarTurnoCajaRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<TurnoCajaResponse>> GetPagedAsync(
        TurnoCajaPagedRequest request,
        CancellationToken cancellationToken = default);

    Task<TurnoCajaResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IMovimientoCajaService
{
    Task<MovimientoCajaResponse> RegistrarIngresoManualAsync(
        RegistrarMovimientoCajaRequest request,
        CancellationToken cancellationToken = default);

    Task<MovimientoCajaResponse> RegistrarEgresoManualAsync(
        RegistrarMovimientoCajaRequest request,
        CancellationToken cancellationToken = default);

    Task<PagedResult<MovimientoCajaResponse>> GetPagedAsync(
        MovimientoCajaPagedRequest request,
        CancellationToken cancellationToken = default);

    Task<ResumenTurnoCajaResponse> GetResumenTurnoAsync(
        Guid turnoId,
        CancellationToken cancellationToken = default);
}

public interface IArqueoCajaService
{
    Task<ArqueoCajaResponse> CalcularAsync(Guid turnoId, CancellationToken cancellationToken = default);

    Task<ArqueoCajaResponse> CerrarTurnoAsync(
        Guid turnoId,
        CerrarArqueoCajaRequest request,
        CancellationToken cancellationToken = default);

    Task<ArqueoCajaResponse?> GetByTurnoAsync(Guid turnoId, CancellationToken cancellationToken = default);
}

public interface IMetodoPagoCatalogService
{
    Task<IReadOnlyList<MetodoPagoResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<MetodoPagoResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<MetodoPagoResponse> CreateAsync(
        CreateMetodoPagoRequest request,
        CancellationToken cancellationToken = default);

    Task<MetodoPagoResponse> UpdateAsync(
        Guid id,
        UpdateMetodoPagoRequest request,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IConceptoCajaCatalogService
{
    Task<IReadOnlyList<ConceptoCajaResponse>> GetAllAsync(CancellationToken cancellationToken = default);
}
