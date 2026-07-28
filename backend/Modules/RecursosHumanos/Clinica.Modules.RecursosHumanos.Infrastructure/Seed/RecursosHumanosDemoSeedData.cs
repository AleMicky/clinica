namespace Clinica.Modules.RecursosHumanos.Infrastructure.Seed;

internal static class RecursosHumanosDemoSeedData
{
    /// <summary>
    /// Jerarquía demo (padres primero). Códigos estables para upsert idempotente.
    /// </summary>
    internal static readonly AreaSeed[] Areas =
    [
        new("ORG-001", "Clínica Demo", "ORG", null),

        new("DIR-001", "Dirección General", "DIR", "ORG-001"),
        new("DIR-002", "Dirección Médica", "DIR", "ORG-001"),

        new("ARE-001", "Administración", "ARE", "DIR-001"),
        new("ARE-002", "Atención en Salud", "ARE", "DIR-002"),

        new("DEP-001", "Finanzas y Cajas", "DEP", "ARE-001"),
        new("DEP-002", "Recursos Humanos", "DEP", "ARE-001"),
        new("DEP-010", "Enfermería", "DEP", "ARE-002"),
        new("DEP-011", "Consulta Externa", "DEP", "ARE-002"),
        new("DEP-012", "Laboratorio", "DEP", "ARE-002"),
        new("DEP-013", "Farmacia", "DEP", "ARE-002"),
        new("DEP-014", "Quirófano", "DEP", "ARE-002"),

        new("SER-001", "Cajas", "SER", "DEP-001"),
        new("SER-010", "Admisión", "SER", "DEP-011")
    ];

    internal static readonly DateOnly DemoFechaIngreso = new(2020, 1, 1);

    internal static readonly DemoEmpleadoSeed[] Empleados =
    [
        new("10000001", "EMP-00001", "DEP-011", "Médico General", "Médico"),
        new("10000002", "EMP-00002", "SER-010", "Secretaria Ejecutiva", "Recepcionista"),
        new("10000003", "EMP-00003", "DEP-010", "Licenciado en Enfermería", "Enfermero de Base"),
        new("10000004", "EMP-00004", "DEP-013", "Bioquímico Farmacéutico", "Farmacia"),
        new("10000005", "EMP-00005", "DEP-012", "Laboratorista", "Laboratorios"),
        new("10000006", "EMP-00006", "DEP-002", "Ingeniero Comercial", "Administrador")
    ];

    internal static readonly DemoMedicoSeed[] Medicos =
    [
        new(
            "10000001",
            "MP-10000001",
            "CMP-10001",
            "Medicina Interna",
            ["Ginecología y Obstetricia"])
    ];

    /// <summary>
    /// Responsables demo: área → código de empleado.
    /// </summary>
    internal static readonly (string AreaCodigo, string CodigoEmpleado)[] Responsables =
    [
        ("ORG-001", "EMP-00006"),
        ("DIR-001", "EMP-00006"),
        ("DIR-002", "EMP-00001"),
        ("ARE-001", "EMP-00006"),
        ("ARE-002", "EMP-00001"),
        ("DEP-002", "EMP-00006"),
        ("DEP-010", "EMP-00003"),
        ("DEP-011", "EMP-00001"),
        ("DEP-012", "EMP-00005"),
        ("DEP-013", "EMP-00004"),
        ("SER-010", "EMP-00002")
    ];

    internal static readonly DemoTurnoSeed[] Turnos =
    [
        new("MAN", "Turno Mañana", new TimeOnly(8, 0), new TimeOnly(14, 0), false, true, false),
        new("TAR", "Turno Tarde", new TimeOnly(14, 0), new TimeOnly(20, 0), false, true, false),
        new("NOC", "Turno Noche", new TimeOnly(20, 0), new TimeOnly(8, 0), true, true, true)
    ];

    /// <summary>
    /// Programaciones relativas a "hoy" (OffsetDias). Códigos estables para upsert.
    /// </summary>
    internal static readonly DemoProgramacionSeed[] Programaciones =
    [
        new("PROG-HOY-MAN", "EMP-00001", 0, "MAN", "DEP-011", "Médico", "Medicina Interna",
            EsMedicoTurno: true, AceptaConsultas: true, AceptaSinCita: true, MaxPacientes: 20,
            Estado: "ACTIVO", Observacion: "Médico de turno — consulta externa mañana",
            PermiteMultiplesMedicosTurno: false),
        new("PROG-HOY-TAR", "EMP-00001", 0, "TAR", "DEP-011", "Médico", "Medicina Interna",
            EsMedicoTurno: true, AceptaConsultas: true, AceptaSinCita: false, MaxPacientes: 15,
            Estado: "ACTIVO", Observacion: "Médico de turno — consulta externa tarde",
            PermiteMultiplesMedicosTurno: false),
        new("PROG-MAN-MAN", "EMP-00001", 1, "MAN", "DEP-011", "Médico", "Ginecología y Obstetricia",
            EsMedicoTurno: false, AceptaConsultas: true, AceptaSinCita: false, MaxPacientes: 12,
            Estado: "ACTIVO", Observacion: "Especialista del día (mañana)",
            PermiteMultiplesMedicosTurno: false),
        new("PROG-MAN-NOC", "EMP-00001", 1, "NOC", "DEP-011", "Médico", "Medicina Interna",
            EsMedicoTurno: true, AceptaConsultas: true, AceptaSinCita: true, MaxPacientes: 10,
            Estado: "ACTIVO", Observacion: "Guardia nocturna — permite múltiples médicos de turno",
            PermiteMultiplesMedicosTurno: true),
        new("PROG-HOY-ENF", "EMP-00003", 0, "MAN", "DEP-010", "Enfermero de Base", null,
            EsMedicoTurno: false, AceptaConsultas: false, AceptaSinCita: false, MaxPacientes: 30,
            Estado: "ACTIVO", Observacion: "Enfermería turno mañana",
            PermiteMultiplesMedicosTurno: false)
    ];

    internal sealed record AreaSeed(
        string Codigo,
        string Nombre,
        string TipoAreaCodigo,
        string? AreaPadreCodigo);

    internal sealed record DemoEmpleadoSeed(
        string NumeroDocumento,
        string CodigoEmpleado,
        string AreaCodigo,
        string ProfesionNombre,
        string CargoNombre);

    internal sealed record DemoMedicoSeed(
        string NumeroDocumento,
        string MatriculaProfesional,
        string? RegistroColegioMedico,
        string EspecialidadPrincipalNombre,
        string[] OtrasEspecialidades);

    internal sealed record DemoTurnoSeed(
        string Codigo,
        string Nombre,
        TimeOnly HoraInicio,
        TimeOnly HoraFin,
        bool CruceDia,
        bool Activo,
        bool PermiteMultiplesMedicosTurno);

    internal sealed record DemoProgramacionSeed(
        string CodigoSeed,
        string CodigoEmpleado,
        int OffsetDias,
        string TurnoCodigo,
        string AreaCodigo,
        string CargoNombre,
        string? EspecialidadNombre,
        bool EsMedicoTurno,
        bool AceptaConsultas,
        bool AceptaSinCita,
        int MaxPacientes,
        string Estado,
        string? Observacion,
        bool PermiteMultiplesMedicosTurno);
}
