namespace Clinica.Modules.Personas.Application.Empleados;

public sealed record EmpleadoResponse(
    Guid Id,
    Guid PersonaId,
    string PersonaNombreCompleto,
    string CodigoEmpleado,
    DateOnly? FechaIngreso,
    Guid AreaId,
    string AreaNombre,
    Guid DepartamentoId,
    string DepartamentoNombre,
    Guid ServicioId,
    string ServicioNombre,
    Guid ProfesionId,
    string ProfesionNombre,
    Guid CargoId,
    string CargoNombre
);
