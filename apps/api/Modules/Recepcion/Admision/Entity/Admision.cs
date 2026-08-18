using Clinica.Api.Modules.Recepcion.Pacientes.Entity;
using Clinica.Api.Modules.RecursosHumanos.Empleado.Entity;
using Clinica.Api.Modules.Servicios.Convenios.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Recepcion.Admision.Entity;

public sealed class Admision : AuditableEntity
{
    public string Numero { get; set; } = string.Empty;

    public int PacienteId { get; set; }
    public Paciente Paciente { get; set; } = null!;
    
    public int RecepcionistaId { get; set; }
    public Empleado Recepcionista { get; set; } = null!;

    public int? ConvenioId { get; set; }
    public Convenio? Convenio { get; set; }

    public DateTime FechaHora { get; set; }
    public EstadoAdmision Estado { get; set; }
    public string? Observacion { get; set; }

    public ICollection<AdmisionDetalle> Detalles { get; set; } = [];
}