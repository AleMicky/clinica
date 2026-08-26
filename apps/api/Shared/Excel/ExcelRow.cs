namespace Clinica.Api.Shared.Excel;

public class ExcelRow
{
    public int RowNumber { get; init; }

    public Dictionary<string, string> Values { get; init; } = new(StringComparer.OrdinalIgnoreCase);

    public string? Get(string column)
    {
        return Values.TryGetValue(column, out var value)
            ? value?.Trim()
            : null;
    }
}