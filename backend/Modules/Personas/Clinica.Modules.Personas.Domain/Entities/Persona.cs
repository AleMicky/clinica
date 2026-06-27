using Clinica.Modules.Parametros.Domain.Entities;
using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.Personas.Domain.Entities;

public class Persona : AuditableEntity
{
    public string Nombres { get; set; } = string.Empty;
    public string ApellidoPaterno { get; set; } = string.Empty;
    public string ApellidoMaterno { get; set; } = string.Empty;
    public DateOnly FechaNacimiento { get; set; }
    public string Telefono { get; set; } = string.Empty;
    public string Direccion { get; set; } = string.Empty;

    public Guid TipoDocumentoId { get; set; }
    public CatalogoItem TipoDocumento { get; set; } = null!;
    
    public string NumeroDocumento { get; set; } = string.Empty;

    public Guid? ExtensionDocumentoId { get; set; }
    public CatalogoItem? ExtensionDocumento { get; set; }
    
    public string? ComplementoDocumento { get; set; }

    public Guid SexoId { get; set; }
    public CatalogoItem Sexo { get; set; } = null!;

    public Guid EstadoCivilId { get; set; }
    public CatalogoItem EstadoCivil { get; set; } = null!;
    
    public ICollection<ContactoEmergencia> ContactosEmergencia { get; set; } = [];
}