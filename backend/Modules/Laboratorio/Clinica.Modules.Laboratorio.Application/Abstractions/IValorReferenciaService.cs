using Clinica.Modules.Laboratorio.Application.ValoresReferencia;
using Clinica.SharedKernel.Crud;
using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Laboratorio.Application.Abstractions;

public interface IValorReferenciaService : ICrudService<Guid,
    ValorReferenciaResponse,
    CreateValorReferenciaRequest,
    UpdateValorReferenciaRequest>
{
    Task<PagedResult<ValorReferenciaResponse>> GetPagedAsync(
        ValorReferenciaPagedRequest request,
        CancellationToken cancellationToken = default);
}
