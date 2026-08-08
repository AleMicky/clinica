using Clinica.Api.Modules.Servicios.Convenios.Entity;
using Clinica.Api.Shared.Abstractions;

namespace Clinica.Api.Modules.Recepcion.Pacientes.Entity;

public sealed class PacienteConvenio : AuditableEntity
{
    public int PacienteId { get; set; }
    public Paciente Paciente { get; set; } = null!;

    public int ConvenioId { get; set; }
    public Convenio Convenio { get; set; } = null!;

    public string? NumeroAfiliado { get; set; }

    public DateOnly FechaInicio { get; set; }
    public DateOnly? FechaFin { get; set; }

    public bool EsPrincipal { get; set; }
}