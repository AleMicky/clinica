using System.Text.Json;
using System.Text.Json.Serialization;

namespace Clinica.Api.Shared.Json;

public sealed class DateOnlyNullableJsonConverter : JsonConverter<DateOnly?>
{
    private static readonly DateOnlyJsonConverter InnerConverter = new();

    public override DateOnly? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
        {
            return null;
        }

        if (reader.TokenType == JsonTokenType.String && string.IsNullOrWhiteSpace(reader.GetString()))
        {
            return null;
        }

        return InnerConverter.Read(ref reader, typeof(DateOnly), options);
    }

    public override void Write(Utf8JsonWriter writer, DateOnly? value, JsonSerializerOptions options)
    {
        if (value.HasValue)
        {
            InnerConverter.Write(writer, value.Value, options);
        }
        else
        {
            writer.WriteNullValue();
        }
    }
}
