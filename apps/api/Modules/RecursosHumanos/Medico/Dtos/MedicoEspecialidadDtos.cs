namespace Clinica.Api.Modules.RecursosHumanos.Medico.Dtos;

public abstract record MedicoEspecialidadRequest
{
    public required int EspecialidadId { get; init; }
    public bool EsPrincipal { get; init; }
}

public sealed record CreateMedicoEspecialidadRequest
    : MedicoEspecialidadRequest;

public sealed record UpdateMedicoEspecialidadRequest
    : MedicoEspecialidadRequest;

public sealed record MedicoEspecialidadResponse
{
    public int Id { get; init; }
    public int MedicoId { get; init; }
    public int EspecialidadId { get; init; }
    public EspecialidadInfo? Especialidad { get; init; }
    public bool EsPrincipal { get; init; }
    public bool Activo { get; init; }
    public DateTime FechaCreacion { get; init; }
    public DateTime? FechaModificacion { get; init; }
    public string? CreadoPor { get; init; }
    public string? ModificadoPor { get; init; }
}

public sealed record EspecialidadInfo
{
    public int Id { get; init; }
    public string Codigo { get; init; } = string.Empty;
    public string Nombre { get; init; } = string.Empty;
}
