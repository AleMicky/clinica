using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Clinica.Api.Shared.Json;

public sealed class DateOnlyJsonConverter : JsonConverter<DateOnly>
{
    private static readonly string[] Formats =
    [
        "yyyy-MM-dd",
        "dd-MM-yyyy",
        "dd/MM/yyyy",
        "yyyy/MM/dd",
        "d-M-yyyy",
        "d/M/yyyy",
        "yyyy-M-d",
        "yyyy/M/d",
        "yyyy-MM-ddTHH:mm:ss.fffZ",
        "yyyy-MM-ddTHH:mm:ssZ",
        "yyyy-MM-ddTHH:mm:ss"
    ];

    public override DateOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            var str = reader.GetString();
            if (string.IsNullOrWhiteSpace(str))
            {
                return default;
            }

            foreach (var format in Formats)
            {
                if (DateOnly.TryParseExact(str, format, CultureInfo.InvariantCulture, DateTimeStyles.None, out var dateOnlyExact))
                {
                    return dateOnlyExact;
                }
            }

            if (DateTime.TryParse(str, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var dateTime))
            {
                return DateOnly.FromDateTime(dateTime);
            }

            if (DateOnly.TryParse(str, CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedDateOnly))
            {
                return parsedDateOnly;
            }
        }

        throw new JsonException($"El valor no se pudo convertir a DateOnly.");
    }

    public override void Write(Utf8JsonWriter writer, DateOnly value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));
    }
}
