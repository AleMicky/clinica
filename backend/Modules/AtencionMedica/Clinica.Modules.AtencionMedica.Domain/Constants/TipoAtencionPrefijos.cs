namespace Clinica.Modules.AtencionMedica.Domain.Constants;

public static class TipoAtencionPrefijos
{
    private static readonly Dictionary<string, string> Map = new(StringComparer.OrdinalIgnoreCase)
    {
        ["CONSULTA_EXTERNA"] = "CE",
        ["EMERGENCIA"] = "EM",
        ["INTERNACION"] = "IN"
    };

    public static string ObtenerPrefijo(string tipoAtencionCodigo)
    {
        if (Map.TryGetValue(tipoAtencionCodigo, out var prefijo))
            return prefijo;

        var abreviatura = new string(tipoAtencionCodigo
            .Split('_', StringSplitOptions.RemoveEmptyEntries)
            .Select(part => part[0])
            .ToArray());

        return string.IsNullOrWhiteSpace(abreviatura) ? "AT" : abreviatura.ToUpperInvariant();
    }
}
