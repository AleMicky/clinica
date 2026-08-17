namespace Clinica.Api.Modules.RecursosHumanos.Medico.Dtos;

public abstract record MedicoServicioAcuerdoRequest
{
    public required int ServicioId { get; init; }

    public required decimal ImporteServicio { get; init; }

    public required decimal ImporteMedico { get; init; }

    public required DateOnly FechaInicio { get; init; }

    public DateOnly? FechaFin { get; init; }
}

public sealed record CreateMedicoServicioAcuerdoRequest
    : MedicoServicioAcuerdoRequest;

public sealed record UpdateMedicoServicioAcuerdoRequest
    : MedicoServicioAcuerdoRequest;

public sealed record MedicoServicioAcuerdoResponse
{
    public int Id { get; init; }

    public int MedicoId { get; init; }

    public int ServicioId { get; init; }

    public ServicioInfo? Servicio { get; init; }

    public decimal ImporteServicio { get; init; }

    public decimal ImporteClinica { get; init; }

    public decimal ImporteMedico { get; init; }

    public DateOnly FechaInicio { get; init; }

    public DateOnly? FechaFin { get; init; }

    public bool Activo { get; init; }

    public DateTime FechaCreacion { get; init; }

    public DateTime? FechaModificacion { get; init; }

    public string? CreadoPor { get; init; }

    public string? ModificadoPor { get; init; }
}

public sealed record ServicioInfo
{
    public int Id { get; init; }

    public string Codigo { get; init; } = string.Empty;

    public string Nombre { get; init; } = string.Empty;
}