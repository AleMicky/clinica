using Clinica.Modules.Workflow.Domain.Entities;
using Clinica.Modules.Workflow.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Clinica.Modules.Workflow.Infrastructure.Seed;

public static class WorkflowDbSeeder
{
    public static async Task MigrateAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();

        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILoggerFactory>()
            .CreateLogger("WorkflowDbSeeder");

        var context = services.GetRequiredService<WorkflowDbContext>();

        await context.Database.MigrateAsync();
        await SeedAsync(context);

        logger.LogInformation("Migraciones y datos iniciales de Workflow aplicados correctamente.");
    }

    private static async Task SeedAsync(WorkflowDbContext context)
    {
        const string definitionCode = "ATENCION_MEDICA";

        var definition = await context.WorkflowDefinitions
            .Include(x => x.States)
            .Include(x => x.Transitions)
            .FirstOrDefaultAsync(x => x.Code == definitionCode);

        if (definition is null)
        {
            definition = new WorkflowDefinition
            {
                Code = definitionCode,
                Name = "Atención Médica",
                Description = "Flujo de atención médica ambulatoria",
                Module = "AtencionMedica",
                EntityName = "Atencion",
                IsActive = true
            };

            context.WorkflowDefinitions.Add(definition);
            await context.SaveChangesAsync();
        }
        else
        {
            definition.Name = "Atención Médica";
            definition.Module = "AtencionMedica";
            definition.EntityName = "Atencion";
            definition.IsActive = true;
        }

        var states = new (string Code, string Name, bool IsInitial, bool IsFinal, string Color, int Order)[]
        {
            ("BORRADOR", "Borrador", true, false, "#8c8c8c", 1),
            ("RECEPCION", "Recepción", false, false, "#1677ff", 2),
            ("TRIAJE", "Triaje", false, false, "#13c2c2", 3),
            ("ENFERMERIA", "Enfermería", false, false, "#722ed1", 4),
            ("CONSULTA_MEDICA", "Consulta médica", false, false, "#52c41a", 5),
            ("PENDIENTE_PAGO", "Pendiente de pago", false, false, "#faad14", 6),
            ("PAGADO", "Pagado", false, false, "#389e0d", 7),
            ("FINALIZADO", "Finalizado", false, true, "#237804", 8),
            ("ANULADO", "Anulado", false, true, "#cf1322", 9)
        };

        foreach (var state in states)
        {
            var existing = definition.States.FirstOrDefault(x => x.Code == state.Code);

            if (existing is null)
            {
                definition.States.Add(new WorkflowState
                {
                    Code = state.Code,
                    Name = state.Name,
                    Description = state.Name,
                    IsInitial = state.IsInitial,
                    IsFinal = state.IsFinal,
                    Color = state.Color,
                    Order = state.Order
                });
            }
            else
            {
                existing.Name = state.Name;
                existing.IsInitial = state.IsInitial;
                existing.IsFinal = state.IsFinal;
                existing.Color = state.Color;
                existing.Order = state.Order;
            }
        }

        await context.SaveChangesAsync();

        await context.Entry(definition).Collection(x => x.States).LoadAsync();
        await context.Entry(definition).Collection(x => x.Transitions).LoadAsync();

        var stateMap = definition.States.ToDictionary(x => x.Code, x => x.Id);

        var linearTransitions = new (string From, string To, string ActionCode, string ActionName)[]
        {
            ("BORRADOR", "RECEPCION", "ENVIAR_RECEPCION", "Enviar a recepción"),
            ("RECEPCION", "TRIAJE", "ENVIAR_TRIAJE", "Enviar a triaje"),
            ("TRIAJE", "ENFERMERIA", "ENVIAR_ENFERMERIA", "Enviar a enfermería"),
            ("ENFERMERIA", "CONSULTA_MEDICA", "ENVIAR_MEDICO", "Enviar a consulta médica"),
            ("CONSULTA_MEDICA", "PENDIENTE_PAGO", "ENVIAR_CAJA", "Enviar a caja"),
            ("PENDIENTE_PAGO", "PAGADO", "REGISTRAR_PAGO", "Registrar pago"),
            ("PAGADO", "FINALIZADO", "FINALIZAR", "Finalizar")
        };

        foreach (var transition in linearTransitions)
        {
            await EnsureTransitionAsync(
                context,
                definition,
                stateMap[transition.From],
                stateMap[transition.To],
                transition.ActionCode,
                transition.ActionName);
        }

        var nonFinalStates = definition.States
            .Where(x => !x.IsFinal)
            .ToList();

        foreach (var fromState in nonFinalStates)
        {
            await EnsureTransitionAsync(
                context,
                definition,
                fromState.Id,
                stateMap["ANULADO"],
                "ANULAR",
                "Anular");
        }

        await context.SaveChangesAsync();
    }

    private static async Task EnsureTransitionAsync(
        WorkflowDbContext context,
        WorkflowDefinition definition,
        Guid fromStateId,
        Guid toStateId,
        string actionCode,
        string actionName)
    {
        var exists = definition.Transitions.Any(x =>
            x.FromStateId == fromStateId &&
            x.ActionCode == actionCode);

        if (exists)
            return;

        var transition = new WorkflowTransition
        {
            WorkflowDefinitionId = definition.Id,
            FromStateId = fromStateId,
            ToStateId = toStateId,
            ActionCode = actionCode,
            ActionName = actionName,
            Description = actionName,
            RequiresComment = actionCode == "ANULAR",
            IsActive = true
        };

        context.WorkflowTransitions.Add(transition);
        definition.Transitions.Add(transition);

        await Task.CompletedTask;
    }
}
