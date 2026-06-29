namespace Clinica.Modules.Seguridad.Application;

public static class SeguridadRoles
{
    public const string Administrador = "Administrador";
    public const string Medico = "Medico";
    public const string Recepcionista = "Recepcionista";
    public const string Enfermeria = "Enfermeria";
    public const string Farmacia = "Farmacia";
    public const string Laboratorio = "Laboratorio";
    public const string RecursosHumanos = "RecursosHumanos";

    /// <summary>
    /// Roles predefinidos del sistema clínico y su descripción funcional.
    /// </summary>
    public static readonly IReadOnlyList<(string Name, string Descripcion)> Definitions =
    [
        (Administrador, "Acceso total al sistema, configuración, seguridad y parámetros."),
        (Medico, "Atención clínica, historia médica, diagnósticos y prescripciones."),
        (Recepcionista, "Recepción de pacientes, citas y registro de ingresos."),
        (Enfermeria, "Signos vitales, formularios de enfermería y seguimiento del paciente."),
        (Farmacia, "Dispensación de medicamentos y gestión de prescripciones."),
        (Laboratorio, "Solicitud y registro de resultados de estudios complementarios."),
        (RecursosHumanos, "Gestión de empleados, médicos y estructura organizacional."),
    ];
}
