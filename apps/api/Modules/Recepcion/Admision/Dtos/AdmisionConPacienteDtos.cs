using Clinica.Api.Modules.Recepcion.Admision.Entity;
using Clinica.Api.Modules.Recepcion.Pacientes.Dtos;

namespace Clinica.Api.Modules.Recepcion.Admision.Dtos;

public sealed record CreateAdmisionConPacienteRequest
{
    public required CreatePacienteRequest Paciente { get; init; }
    public required string Numero { get; init; }
    public int? ConvenioId { get; init; }
    public required DateTime FechaHora { get; init; }
    public string? Observacion { get; init; }
    public required IReadOnlyCollection<CreateAdmisionDetalleRequest> Detalles { get; init; } = [];
}