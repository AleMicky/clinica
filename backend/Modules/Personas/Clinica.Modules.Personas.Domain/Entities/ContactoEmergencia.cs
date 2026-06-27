using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Personas.Domain.Entities;

public class ContactoEmergencia : AuditableEntity
{
    public Guid PersonaId { get; set; }
    public Persona Persona { get; set; } = null!;
    
    public string Nombres { get; set; } = string.Empty;
    public string? Apellidos { get; set; }
    
    public Guid? ParentescoId { get; set; }
    public CatalogoItem? Parentesco { get; set; }
    
    public string? Telefono { get; set; }
    public string? Celular { get; set; }
    public string? Direccion { get; set; }
}