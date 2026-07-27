using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Laboratorio.Application.ValoresReferencia;

public sealed class ValorReferenciaPagedRequest : PagedRequest
{
    public Guid? ParametroId { get; set; }
}
