using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.RecursosHumanos.Especialidad.Dtos;

public abstract record EspecialidadRequest
{
    public required string Codigo { get; init; }
    public required string Nombre { get; init; }
    public string? Descripcion { get; init; }
}

public sealed record CreateEspecialidadRequest : EspecialidadRequest;

public sealed record UpdateEspecialidadRequest : EspecialidadRequest;

public sealed record EspecialidadResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Codigo { get; init; }
    public string Nombre { get; init; }
    public string? Descripcion { get; init; }
}
