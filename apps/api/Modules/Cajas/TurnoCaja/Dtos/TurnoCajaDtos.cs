using Clinica.Api.Modules.Cajas.TurnoCaja.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Cajas.TurnoCaja.Dtos;

public abstract record TurnoCajaRequest
{
    public required int CajaId { get; init; }
    public required int EmpleadoId { get; init; }
    public required DateTime FechaHoraApertura { get; init; }
    public required decimal MontoInicial { get; init; }
    public string? ObservacionApertura { get; init; }
    public DateTime? FechaHoraCierre { get; init; }
    public string? ObservacionCierre { get; init; }
    public required EstadoTurnoCaja Estado { get; init; }
}

public sealed record CreateTurnoCajaRequest : TurnoCajaRequest;

public sealed record UpdateTurnoCajaRequest : TurnoCajaRequest;

public sealed class AbrirTurnoCajaRequest
{
    public int CajaId { get; set; }

    public int EmpleadoId { get; set; }

    public decimal MontoInicial { get; set; }

    public string? Observacion { get; set; }
}

public sealed class CerrarTurnoCajaRequest
{
    public string? Observacion { get; set; }
}

public sealed record TurnoCajaResponse : AuditableResponse
{
    public int Id { get; init; }
    public CajaInfo? Caja { get; init; }
    public EmpleadoInfo? Empleado { get; init; }
    public DateTime FechaHoraApertura { get; init; }
    public decimal MontoInicial { get; init; }
    public string? ObservacionApertura { get; init; }
    public DateTime? FechaHoraCierre { get; init; }
    public string? ObservacionCierre { get; init; }
    public EstadoTurnoCaja Estado { get; init; }
}

public sealed record CajaInfo
{
    public int Id { get; init; }
    public string Codigo { get; init; } = string.Empty;
    public string Nombre { get; init; } = string.Empty;
}

public sealed record EmpleadoInfo
{
    public int Id { get; init; }
    public string CodigoEmpleado { get; init; } = string.Empty;
    public string NombreCompleto { get; init; } = string.Empty;
}

public sealed record TurnoCajaInfo
{
    public int Id { get; init; }
    public CajaInfo? Caja { get; init; }
    public EmpleadoInfo? Empleado { get; init; }
    public DateTime FechaHoraApertura { get; init; }
    public decimal MontoInicial { get; init; }
    public string? ObservacionApertura { get; init; }
    public DateTime? FechaHoraCierre { get; init; }
    public string? ObservacionCierre { get; init; }
    public EstadoTurnoCaja Estado { get; init; }
}
