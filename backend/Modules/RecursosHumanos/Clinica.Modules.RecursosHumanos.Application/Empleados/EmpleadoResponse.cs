namespace Clinica.Modules.RecursosHumanos.Application.Empleados;

public sealed record EmpleadoResponse(
    Guid Id,
    Guid PersonaId,
    string PersonaNombreCompleto,
    string CodigoEmpleado,
    DateOnly? FechaIngreso,
    Guid AreaId,
    string AreaNombre,
    Guid ProfesionId,
    string ProfesionNombre,
    Guid CargoId,
    string CargoNombre,
    bool EsMedico,
    EmpleadoMedicoResponse? Medico
);
