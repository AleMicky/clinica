using Clinica.SharedKernel.Pagination;

namespace Clinica.Modules.Caja.Application.Cajas;

public sealed record CajaResponse(
    Guid Id,
    string Codigo,
    string Nombre,
    string? Descripcion,
    bool Activo,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public sealed record CreateCajaRequest(
    string Codigo,
    string Nombre,
    string? Descripcion = null,
    bool Activo = true);

public sealed record UpdateCajaRequest(
    string Nombre,
    string? Descripcion,
    bool Activo);

public sealed record ChangeCajaStatusRequest(bool Activo);

public sealed class CajaPagedRequest : PagedRequest
{
    public string? Search { get; set; }
    public bool? Activo { get; set; }
}
