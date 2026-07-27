namespace Clinica.Modules.Laboratorio.Domain.Constants;

public static class SolicitudOrigenes
{
    public const string AtencionMedica = "ATENCION_MEDICA";
    public const string Paciente = "PACIENTE";
    public const string MedicoExterno = "MEDICO_EXTERNO";

    public static readonly string[] All =
    [
        AtencionMedica,
        Paciente,
        MedicoExterno
    ];
}
