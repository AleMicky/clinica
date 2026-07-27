using Clinica.Modules.Farmacia.Application.Dispensaciones;
using Clinica.Modules.Farmacia.Application.Precios;
using Clinica.Modules.Farmacia.Application.Recetas;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Farmacia.Application.Abstractions;

public interface IPrecioService
{
    Task<PagedResult<PrecioResponse>> GetPagedAsync(PrecioPagedRequest request, CancellationToken cancellationToken = default);
    Task<PrecioResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PrecioResponse?> GetVigenteAsync(Guid productoId, DateOnly? fecha = null, CancellationToken cancellationToken = default);
    Task<PrecioResponse> CreateAsync(CreatePrecioRequest request, CancellationToken cancellationToken = default);
    Task<PrecioResponse> UpdateAsync(Guid id, UpdatePrecioRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IRecetaService
{
    Task<PagedResult<RecetaListItemResponse>> GetPagedAsync(RecetaPagedRequest request, CancellationToken cancellationToken = default);
    Task<RecetaResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<RecetaResponse> CreateAsync(CreateRecetaRequest request, CancellationToken cancellationToken = default);
    Task AnularAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IDispensacionService
{
    Task<PagedResult<DispensacionListItemResponse>> GetPagedAsync(DispensacionPagedRequest request, CancellationToken cancellationToken = default);
    Task<DispensacionResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<DispensacionResponse> CreateAsync(CreateDispensacionRequest request, CancellationToken cancellationToken = default);
    Task<DispensacionResponse> ConfirmarAsync(Guid id, ConfirmarDispensacionRequest? request = null, CancellationToken cancellationToken = default);
    Task SetEstadoAsync(Guid id, string estado, CancellationToken cancellationToken = default);
    Task AnularAsync(Guid id, CancellationToken cancellationToken = default);
}
