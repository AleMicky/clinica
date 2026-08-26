using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Notificaciones.Entity;

public class Notificacion : AuditableEntity
{
    public int UsuarioId { get; set; } = default!;
    public string Titulo { get; set; } = default!;
    public string Mensaje { get; set; } = default!;
    public string? Tipo { get; set; }
    public string? Modulo { get; set; }
    public string? EntidadTipo { get; set; }
    public string? EntidadId { get; set; }
    public string? Url { get; set; }
    public bool Leida { get; set; }
    public DateTime? FechaLectura { get; set; }
}