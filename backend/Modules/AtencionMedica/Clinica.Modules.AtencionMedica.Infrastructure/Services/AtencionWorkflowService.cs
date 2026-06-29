using Clinica.Modules.AtencionMedica.Application.Abstractions;
using Clinica.Modules.Workflow.Application.Abstractions;
using Clinica.Modules.Workflow.Application.WorkflowInstances;
using Microsoft.Extensions.Logging;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Services;

public sealed class AtencionWorkflowService(
    IWorkflowInstanceService workflowInstanceService,
    ILogger<AtencionWorkflowService> logger) : IWorkflowService
{
    private const string WorkflowDefinitionCode = "ATENCION_MEDICA";
    private const string ReferenceModule = "AtencionMedica";
    private const string ReferenceEntity = "Atencion";
    private const string RecepcionActionCode = "ENVIAR_RECEPCION";

    public async Task<Guid?> IniciarAtencionMedicaEnRecepcionAsync(
        Guid atencionId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var instance = await workflowInstanceService.StartAsync(
                new StartWorkflowInstanceRequest(
                    WorkflowDefinitionCode,
                    ReferenceModule,
                    ReferenceEntity,
                    atencionId),
                cancellationToken);

            await workflowInstanceService.ExecuteAsync(
                instance.Id,
                new ExecuteWorkflowTransitionRequest(RecepcionActionCode, null),
                cancellationToken);

            return instance.Id;
        }
        catch (Exception ex)
        {
            logger.LogWarning(
                ex,
                "No se pudo iniciar el workflow de atención médica para la atención {AtencionId}",
                atencionId);

            return null;
        }
    }

    public async Task<string?> ObtenerEstadoActualAsync(
        Guid workflowInstanceId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var instance = await workflowInstanceService.GetByIdAsync(
                workflowInstanceId,
                cancellationToken);

            return instance?.CurrentStateCode;
        }
        catch (Exception ex)
        {
            logger.LogWarning(
                ex,
                "No se pudo obtener el estado del workflow {WorkflowInstanceId}",
                workflowInstanceId);

            return null;
        }
    }

    public async Task<string?> EjecutarTransicionAsync(
        Guid workflowInstanceId,
        string actionCode,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var instance = await workflowInstanceService.ExecuteAsync(
                workflowInstanceId,
                new ExecuteWorkflowTransitionRequest(actionCode, null),
                cancellationToken);

            return instance.CurrentStateCode;
        }
        catch (Exception ex)
        {
            logger.LogWarning(
                ex,
                "No se pudo ejecutar la transición {ActionCode} en el workflow {WorkflowInstanceId}",
                actionCode,
                workflowInstanceId);

            throw;
        }
    }
}
