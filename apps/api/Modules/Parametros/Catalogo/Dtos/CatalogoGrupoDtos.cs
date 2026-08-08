using System.ComponentModel.DataAnnotations;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Parametros.Catalogo.Dtos;

public abstract record CatalogoGrupoRequest
{
    public required string Codigo { get; init; }
    public required string Nombre { get; init; }
    public string? Descripcion { get; init; }
}

public sealed record CreateCatalogoGrupoRequest : CatalogoGrupoRequest;

public sealed record UpdateCatalogoGrupoRequest : CatalogoGrupoRequest;

public sealed record CatalogoGrupoResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Codigo { get; init; }
    public string Nombre { get; init; }
    public string? Descripcion { get; init; }
}