using Clinica.Api.Modules.Notificaciones.Enums;

namespace Clinica.Api.Modules.Notificaciones.Dtos;

public sealed record NotificacionResponse
{
    public int Id { get; init; }
    public string Titulo { get; init; }
    public string Mensaje { get; init; }
    public TipoNotificacion Tipo { get; init; }
    public string? Modulo { get; init; }
    public string? EntidadTipo { get; init; }
    public string? EntidadId { get; init; }
    public string? Url { get; init; }
    public bool Leida { get; init; }
    public DateTime? FechaLectura { get; init; }
    public DateTime FechaCreacion { get; init; }
}