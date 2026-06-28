namespace Clinica.Modules.AtencionMedica.Application.PrescripcionDetalles;

public sealed record PrescripcionDetalleResponse(
    Guid Id,
    Guid PrescripcionId,
    Guid? MedicamentoId,
    string MedicamentoNombre,
    string Dosis,
    string Frecuencia,
    string Duracion,
    string? ViaAdministracion,
    string? Indicaciones);

public sealed record CreatePrescripcionDetalleRequest(
    Guid PrescripcionId,
    string MedicamentoNombre,
    string Dosis,
    string Frecuencia,
    string Duracion,
    Guid? MedicamentoId = null,
    string? ViaAdministracion = null,
    string? Indicaciones = null);

public sealed record UpdatePrescripcionDetalleRequest(
    Guid PrescripcionId,
    string MedicamentoNombre,
    string Dosis,
    string Frecuencia,
    string Duracion,
    Guid? MedicamentoId = null,
    string? ViaAdministracion = null,
    string? Indicaciones = null);
