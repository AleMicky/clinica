using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Caja.Application.Cuentas;

public sealed class CuentaPagedRequest : PagedRequest
{
    public string? Estado { get; set; }
    public Guid? PacienteId { get; set; }
    public string? ModuloOrigen { get; set; }
    public string? Search { get; set; }
}
