namespace Clinica.Modules.AtencionMedica.Application.Abstractions;

public interface IWorkflowService
{
    Task<Guid?> IniciarAtencionMedicaEnRecepcionAsync(
        Guid atencionId,
        CancellationToken cancellationToken = default);
}
