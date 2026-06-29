namespace Clinica.Modules.AtencionMedica.Application.Abstractions;

public interface IWorkflowService
{
    Task<Guid?> IniciarAtencionMedicaEnRecepcionAsync(
        Guid atencionId,
        CancellationToken cancellationToken = default);

    Task<string?> ObtenerEstadoActualAsync(
        Guid workflowInstanceId,
        CancellationToken cancellationToken = default);

    Task<string?> EjecutarTransicionAsync(
        Guid workflowInstanceId,
        string actionCode,
        CancellationToken cancellationToken = default);
}
