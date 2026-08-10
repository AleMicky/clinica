namespace Clinica.Api.Shared.Extensions;

public static class StringExtensions
{
    public static string? TrimOrNull(this string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }

    public static string? TrimUpperOrNull(this string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value
                .Trim()
                .ToUpperInvariant();
    }

    public static string TrimRequired(this string value)
    {
        return value.Trim();
    }

    public static string TrimUpperRequired(this string value)
    {
        return value
            .Trim()
            .ToUpperInvariant();
    }

    public static string TrimUpper(this string value)
    {
        return value
            .Trim()
            .ToUpperInvariant();
    }
}