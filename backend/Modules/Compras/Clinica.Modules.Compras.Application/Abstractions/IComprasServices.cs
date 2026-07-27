using Clinica.Modules.Compras.Application.OrdenesCompra;
using Clinica.Modules.Compras.Application.Proveedores;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Compras.Application.Abstractions;

public interface IProveedorService : ICrudService<Guid, ProveedorResponse, CreateProveedorRequest, UpdateProveedorRequest>;

public interface IOrdenCompraService
{
    Task<PagedResult<OrdenCompraListItemResponse>> GetPagedAsync(OrdenCompraPagedRequest request, CancellationToken cancellationToken = default);
    Task<OrdenCompraResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<OrdenCompraResponse> CreateAsync(CreateOrdenCompraRequest request, CancellationToken cancellationToken = default);
    Task<OrdenCompraResponse> ConfirmarAsync(Guid id, CancellationToken cancellationToken = default);
    Task<OrdenCompraResponse> RecibirAsync(Guid id, RecibirOrdenRequest request, CancellationToken cancellationToken = default);
    Task AnularAsync(Guid id, CancellationToken cancellationToken = default);
}
