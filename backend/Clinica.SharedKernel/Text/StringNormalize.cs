namespace Clinica.SharedKernel.Text;

public static class StringNormalize
{
    public static string Required(string value) => value.Trim();

    public static string? Optional(string? value)
    {
        if (value is null)
            return null;

        var trimmed = value.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }
}
