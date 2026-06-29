using System.Text;

namespace Clinica.Modules.Personas.Application.Pacientes;

public static class HistoriaClinicaGenerator
{
    public static string Generate(
        string nombres,
        string apellidoPaterno,
        string? apellidoMaterno,
        string numeroDocumento)
    {
        var iniciales = BuildIniciales(nombres, apellidoPaterno, apellidoMaterno);
        var documento = numeroDocumento.Trim();

        return $"{iniciales}{documento}";
    }

    private static string BuildIniciales(
        string nombres,
        string apellidoPaterno,
        string? apellidoMaterno)
    {
        var builder = new StringBuilder(3);

        AppendInitial(builder, GetFirstWord(nombres));
        AppendInitial(builder, apellidoPaterno);
        AppendInitial(builder, apellidoMaterno);

        return builder.ToString();
    }

    private static string GetFirstWord(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return string.Empty;

        return value.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault()
               ?? string.Empty;
    }

    private static void AppendInitial(StringBuilder builder, string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return;

        var letter = value.Trim()[0];
        builder.Append(char.ToUpperInvariant(letter));
    }
}
