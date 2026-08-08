using System.ComponentModel.DataAnnotations;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Parametros.UnidadesMedida.Dtos;

public abstract record UnidadesMedidaRequest
{
    public required string Categoria { get; init; }
    public required string Codigo { get; init; }
    public required string Nombre { get; init; }
    public required string Simbolo { get; init; }
}

public sealed record CreateUnidadesMedidaRequest : UnidadesMedidaRequest;

public sealed record UpdateUnidadesMedidaRequest : UnidadesMedidaRequest;

public sealed record UnidadesMedidaResponse : AuditableResponse
{
    public int Id { get; init; }
    public string Categoria { get; init; }
    public string Codigo { get; init; }
    public string Nombre { get; init; }
    public string Simbolo { get; init; }
}