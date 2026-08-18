using Clinica.Api.Modules.Recepcion.Admision.Entity;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Dtos;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Recepcion.Admision.Dtos;

public abstract record AdmisionRequest
{
    public required int PacienteId { get; init; }
    public required int RecepcionistaId { get; init; }
    public int? ConvenioId { get; init; }
    public required DateTime FechaHora { get; init; }
    public string? Observacion { get; init; }
    public IReadOnlyCollection<AdmisionDetalleRequest> Detalles { get; init; } = [];
}

public sealed record CreateAdmisionRequest : AdmisionRequest;

public sealed record UpdateAdmisionRequest : AdmisionRequest;

public sealed record AdmisionResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Numero { get; init; }
    public PacienteInfo Paciente { get; init; }
    public EmpleadoBaseInfo Recepcionista { get; init; }
    public ConvenioInfo? Convenio { get; init; }
    public DateTime FechaHora { get; init; }
    public EstadoAdmision Estado { get; init; }
    public string? Observacion { get; init; }
    public IReadOnlyCollection<AdmisionDetalleResponse> Detalles { get; init; } = [];
}

public sealed record PacienteInfo
{
    public int Id { get; init; }
    public string NumeroHistoriaClinica { get; init; } = string.Empty;
    public PersonaInfoAdmision Persona { get; init; } = null!;
}

public sealed record PersonaInfoAdmision
{
    public int Id { get; init; }
    public string Nombres { get; init; } = string.Empty;
    public string ApellidoPaterno { get; init; } = string.Empty;
    public string? ApellidoMaterno { get; init; }
    public string TipoDocumento { get; init; } = string.Empty;
    public string NumeroDocumento { get; init; } = string.Empty;
    public string? ExtensionDocumento { get; init; }
    public string? ComplementoDocumento { get; init; }
}

public sealed record ConvenioInfo
{
    public int Id { get; init; }
    public string Codigo { get; init; } = string.Empty;
    public string Nombre { get; init; } = string.Empty;
}