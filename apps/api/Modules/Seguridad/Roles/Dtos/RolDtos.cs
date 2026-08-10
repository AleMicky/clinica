namespace Clinica.Api.Modules.Seguridad.Roles.Dtos;

public abstract record RolRequest
{
    public required string Name { get; init; }
    public string? Descripcion { get; init; }
}

public record CreateRolRequest : RolRequest;

public record UpdateRolRequest : RolRequest;

public record RolResponse
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Descripcion { get; init; }
}   