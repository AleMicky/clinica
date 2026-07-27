using Clinica.Modules.Almacen.Application.Categorias;
using Clinica.Modules.Almacen.Application.Existencias;
using Clinica.Modules.Almacen.Application.Lotes;
using Clinica.Modules.Almacen.Application.Movimientos;
using Clinica.Modules.Almacen.Application.Productos;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Almacen.Application.Abstractions;

public interface ICategoriaService : ICrudService<Guid, CategoriaResponse, CreateCategoriaRequest, UpdateCategoriaRequest>;

public interface IProductoService : ICrudService<Guid, ProductoResponse, CreateProductoRequest, UpdateProductoRequest>;

public interface IExistenciaService
{
    Task<PagedResult<ExistenciaResponse>> GetPagedAsync(ExistenciaPagedRequest request, CancellationToken cancellationToken = default);
}

public interface ILoteConsultaService
{
    Task<PagedResult<LoteResponse>> GetPagedAsync(LotePagedRequest request, CancellationToken cancellationToken = default);
    Task<LoteResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}

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
