namespace Clinica.Modules.AtencionMedica.Application.AtencionFlujo;

public sealed record SeccionCompletitudResponse(
    Guid SeccionId,
    string Codigo,
    string Nombre,
    string? EtapaFlujo,
    int Orden,
    int CamposRequeridos,
    int CamposCompletados,
    bool Completa);

public sealed record AtencionFlujoCompletitudResponse(
    Guid AtencionId,
    string EstadoAtencion,
    Guid? WorkflowInstanceId,
    string? EstadoWorkflow,
    string? EtapaActual,
    bool PuedeAvanzar,
    string? SiguienteAccion,
    string? SiguienteAccionNombre,
    IReadOnlyCollection<SeccionCompletitudResponse> Secciones);

public sealed record AvanzarAtencionFlujoResponse(
    Guid AtencionId,
    string EstadoAnterior,
    string EstadoNuevo,
    string AccionEjecutada);
