using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Servicios.Servicios.Dtos;

public abstract record ServicioRequest
{
    public required string Codigo { get; init; }
    public required string Nombre { get; init; }
    public string? Descripcion { get; init; }
}

public sealed record CreateServicioRequest : ServicioRequest;

public sealed record UpdateServicioRequest : ServicioRequest;

public sealed record ServicioResponse : AuditableResponse
{
    public int Id { get; init; }
    public int CategoriaServicioId { get; init; }
    public string Codigo { get; init; }
    public string Nombre { get; init; }
    public string? Descripcion { get; init; }
}

public sealed record ServicioTarifarioResponse
{
    public int Id { get; init; }
    public int CategoriaServicioId { get; init; }
    public string Codigo { get; init; }
    public string Nombre { get; init; }
    public string? Descripcion { get; init; }
    public decimal Precio { get; init; }

    public List<MedicoServicioResponse> Medicos { get; init; } = [];
}

public sealed record MedicoServicioResponse
{
    public int MedicoId { get; init; }
    public string NombreMedico { get; init; } = string.Empty;
}