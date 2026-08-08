using System.ComponentModel.DataAnnotations;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Parametros.Catalogo.Dtos;

public abstract record CatalogoItemRequest
{
    public required string Valor { get; init; }
    public required string Nombre { get; init; }
    public int Orden { get; init; }
}

public sealed record CreateCatalogoItemRequest : CatalogoItemRequest;

public sealed record UpdateCatalogoItemRequest : CatalogoItemRequest;

public sealed record CatalogoItemResponse : AuditableResponse
{
    public int Id { get; init; }
    public int CatalogoGrupoId { get; init; }
    public string Valor { get; init; }
    public string Nombre { get; init; }
    public int Orden { get; init; }
}