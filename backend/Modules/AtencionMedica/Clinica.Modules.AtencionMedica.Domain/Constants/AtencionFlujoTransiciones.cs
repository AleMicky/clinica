namespace Clinica.Modules.AtencionMedica.Domain.Constants;

public static class AtencionFlujoTransiciones
{
    public static readonly IReadOnlyDictionary<string, (string EtapaRequerida, string ActionCode)> SalidaPorEstado =
        new Dictionary<string, (string, string)>(StringComparer.OrdinalIgnoreCase)
        {
            [AtencionEstados.Recepcion] = (AtencionEtapasFlujo.Recepcion, "ENVIAR_TRIAJE"),
            [AtencionEstados.Triaje] = (AtencionEtapasFlujo.Triaje, "ENVIAR_ENFERMERIA"),
            [AtencionEstados.Enfermeria] = (AtencionEtapasFlujo.Enfermeria, "ENVIAR_MEDICO"),
            [AtencionEstados.ConsultaMedica] = (AtencionEtapasFlujo.ConsultaMedica, "ENVIAR_CAJA")
        };
}
