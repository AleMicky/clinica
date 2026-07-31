using Clinica.Modules.Almacen.Application.Almacenes;
using Clinica.Modules.Almacen.Application.Categorias;
using Clinica.Modules.Almacen.Application.FormasFarmaceuticas;
using Clinica.Modules.Almacen.Application.Inventarios;
using Clinica.Modules.Almacen.Application.Productos;
using Clinica.Modules.Almacen.Application.Solicitudes;
using Clinica.Modules.Almacen.Application.Stock;
using Clinica.Modules.Almacen.Application.Transferencias;
using Clinica.Modules.Almacen.Application.UnidadesMedida;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Almacen.Application.Abstractions;

public interface IProductoService : ICrudService<Guid, ProductoResponse, CreateProductoRequest, UpdateProductoRequest>;

public interface ICategoriaProductoService : ICrudService<Guid, CategoriaProductoResponse, CreateCategoriaProductoRequest, UpdateCategoriaProductoRequest>;

public interface IUnidadMedidaService : ICrudService<Guid, UnidadMedidaResponse, CreateUnidadMedidaRequest, UpdateUnidadMedidaRequest>;

public interface IAlmacenCatalogService : ICrudService<Guid, AlmacenResponse, CreateAlmacenRequest, UpdateAlmacenRequest>
{
    Task<IReadOnlyList<TipoAlmacenResponse>> GetTiposAsync(CancellationToken cancellationToken = default);
}

public interface IFormaFarmaceuticaService : ICrudService<Guid, FormaFarmaceuticaResponse, CreateFormaFarmaceuticaRequest, UpdateFormaFarmaceuticaRequest>;

/// <summary>
/// Operaciones de stock y movimientos de almacén (multi-almacén).
/// Consumido por Compras/Farmacia y por la API de movimientos.
/// </summary>
public interface IAlmacenStockService
{
    Task<DisponibilidadProductoResponse> ConsultarDisponibilidadAsync(Guid productoId, CancellationToken cancellationToken = default);

    Task<MovimientoResponse> RegistrarIngresoAsync(RegistrarIngresoRequest request, CancellationToken cancellationToken = default);

    Task<MovimientoResponse> RegistrarSalidaAsync(RegistrarSalidaRequest request, CancellationToken cancellationToken = default);

    Task<DescontarFefoResponse> DescontarFefoAsync(DescontarFefoRequest request, CancellationToken cancellationToken = default);

    Task<MovimientoResponse> RegistrarAjusteAsync(RegistrarAjusteRequest request, CancellationToken cancellationToken = default);

    Task<MovimientoResponse> RegistrarBajaAsync(RegistrarBajaRequest request, CancellationToken cancellationToken = default);

    Task<MovimientoResponse> RegistrarTransferenciaAsync(RegistrarTransferenciaRequest request, CancellationToken cancellationToken = default);

    Task<MovimientoResponse> AplicarMovimientoAsync(Guid movimientoId, AplicarMovimientoRequest? request = null, CancellationToken cancellationToken = default);

    Task<MovimientoResponse?> GetMovimientoByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<PagedResult<MovimientoListItemResponse>> GetMovimientosPagedAsync(MovimientoPagedRequest request, CancellationToken cancellationToken = default);

    Task SetMovimientoEstadoAsync(Guid movimientoId, string estado, CancellationToken cancellationToken = default);
}

public interface ITransferenciaAlmacenService
{
    Task<PagedResult<TransferenciaListItemResponse>> GetPagedAsync(TransferenciaPagedRequest request, CancellationToken cancellationToken = default);
    Task<TransferenciaResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<TransferenciaResponse> CreateAsync(CreateTransferenciaRequest request, CancellationToken cancellationToken = default);
    Task<TransferenciaResponse> SolicitarAsync(Guid id, CancellationToken cancellationToken = default);
    Task<TransferenciaResponse> AprobarAsync(Guid id, AprobarTransferenciaRequest request, CancellationToken cancellationToken = default);
    Task<TransferenciaResponse> PrepararAsync(Guid id, CancellationToken cancellationToken = default);
    Task<TransferenciaResponse> EnviarAsync(Guid id, EnviarTransferenciaRequest request, CancellationToken cancellationToken = default);
    Task<TransferenciaResponse> RecibirAsync(Guid id, RecibirTransferenciaRequest request, CancellationToken cancellationToken = default);
    Task<TransferenciaResponse> RechazarAsync(Guid id, RechazarTransferenciaRequest request, CancellationToken cancellationToken = default);
    Task<TransferenciaResponse> AnularAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface ISolicitudAlmacenService
{
    Task<PagedResult<SolicitudListItemResponse>> GetPagedAsync(SolicitudPagedRequest request, CancellationToken cancellationToken = default);
    Task<SolicitudResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SolicitudResponse> CreateAsync(CreateSolicitudRequest request, CancellationToken cancellationToken = default);
    Task<SolicitudResponse> SolicitarAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SolicitudResponse> AprobarAsync(Guid id, AprobarSolicitudRequest request, CancellationToken cancellationToken = default);
    Task<SolicitudResponse> AtenderAsync(Guid id, AtenderSolicitudRequest request, CancellationToken cancellationToken = default);
    Task<SolicitudResponse> RechazarAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SolicitudResponse> AnularAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IInventarioFisicoService
{
    Task<PagedResult<InventarioListItemResponse>> GetPagedAsync(InventarioPagedRequest request, CancellationToken cancellationToken = default);
    Task<InventarioFisicoResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<InventarioFisicoResponse> CreateAsync(CreateInventarioFisicoRequest request, CancellationToken cancellationToken = default);
    Task<InventarioFisicoResponse> IniciarConteoAsync(Guid id, CancellationToken cancellationToken = default);
    Task<InventarioFisicoResponse> ContarAsync(Guid id, ContarInventarioRequest request, CancellationToken cancellationToken = default);
    Task<InventarioFisicoResponse> FinalizarConteoAsync(Guid id, CancellationToken cancellationToken = default);
    Task<InventarioFisicoResponse> AprobarAsync(Guid id, CancellationToken cancellationToken = default);
    Task<InventarioFisicoResponse> AnularAsync(Guid id, CancellationToken cancellationToken = default);
}
