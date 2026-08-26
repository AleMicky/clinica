using Clinica.Api.Modules.Notificaciones.Enums;

namespace Clinica.Api.Modules.Notificaciones.Dtos;

public sealed record CrearNotificacionRequest
{
    public required string UsuarioId { get; init; }
    public required string Titulo { get; init; }
    public required string Mensaje { get; init; }
    public TipoNotificacion Tipo { get; init; } = TipoNotificacion.Informacion;
    public string? Modulo { get; init; }
    public string? EntidadTipo { get; init; }
    public string? EntidadId { get; init; }
    public string? Url { get; init; }
}