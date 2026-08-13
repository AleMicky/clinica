using Clinica.Api.Modules.RecursosHumanos.AsignacionEmpleado.Dtos;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Recepcion.Admision.Dtos;

public record AdmisionDetalleRequest
{
    public required int ServicioId { get; init; }
    public int? MedicoId { get; init; }
    public decimal Cantidad { get; init; } = 1;
    public decimal PrecioUnitario { get; init; }
    public decimal Descuento { get; init; }

    public decimal CalcularTotal() => (Cantidad * PrecioUnitario) - Descuento;
}

public sealed record CreateAdmisionDetalleRequest : AdmisionDetalleRequest;

public sealed record UpdateAdmisionDetalleRequest : AdmisionDetalleRequest;

public sealed record AdmisionDetalleResponse : AuditableResponse
{
    public int Id { get; init; }
    public int AdmisionId { get; init; }
    public ServicioInfo Servicio { get; init; }
    public MedicoInfo? Medico { get; init; }
    public decimal Cantidad { get; init; }
    public decimal PrecioUnitario { get; init; }
    public decimal Descuento { get; init; }
    public decimal Total { get; init; }
}

public sealed record ServicioInfo
{
    public int Id { get; init; }
    public string Codigo { get; init; } = string.Empty;
    public string Nombre { get; init; } = string.Empty;
}

public sealed record MedicoInfo
{
    public int Id { get; init; }
    public EmpleadoInfo? Empleado { get; init; }
    public string MatriculaProfesional { get; init; } = string.Empty;
}