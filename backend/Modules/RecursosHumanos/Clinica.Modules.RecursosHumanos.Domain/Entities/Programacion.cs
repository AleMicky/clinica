using Clinica.Modules.RecursosHumanos.Domain.Enums;
using Clinica.SharedKernel.Abstractions;

namespace Clinica.Modules.RecursosHumanos.Domain.Entities;

public class Programacion : AuditableEntity
{
    public string Nombre { get; set; } = null!;
    public DateOnly FechaInicio { get; set; }
    public DateOnly FechaFin { get; set; }

    public Guid GrupoProgramacionId { get; set; }
    public GrupoProgramacion GrupoProgramacion { get; set; } = null!;

    public EstadoProgramacion Estado { get; set; } = EstadoProgramacion.Borrador;
    public string? Observacion { get; set; }

    public ICollection<ProgramacionDiaria> Detalles { get; set; } = [];
}