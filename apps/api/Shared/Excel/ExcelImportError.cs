namespace Clinica.Api.Shared.Excel;

public sealed class ExcelImportError
{
    public int Row { get; set; }

    public string? Column { get; set; }

    public string? Value { get; set; }

    public string Message { get; set; } = string.Empty;
}