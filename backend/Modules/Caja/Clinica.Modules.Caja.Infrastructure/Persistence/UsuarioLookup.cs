namespace Clinica.Modules.Caja.Infrastructure.Persistence;

/// <summary>
/// Lectura cross-schema de seguridad.usuarios (sin migraciones de Caja).
/// Turnos almacenan UserId en EmpleadoAperturaId / EmpleadoCierreId.
/// </summary>
internal sealed class UsuarioLookup
{
    public Guid Id { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public Guid? PersonaId { get; set; }
}
