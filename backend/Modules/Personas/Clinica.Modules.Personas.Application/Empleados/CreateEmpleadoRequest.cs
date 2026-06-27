namespace Clinica.Modules.Personas.Application.Empleados;

public sealed record CreateEmpleadoRequest(
    Guid PersonaId,
    string CodigoEmpleado,
    Guid AreaId,
    Guid DepartamentoId,
    Guid ServicioId,
    Guid ProfesionId,
    Guid CargoId,
    DateOnly? FechaIngreso = null
);
