namespace Clinica.Api.Shared.Excel;

public sealed class ExcelImportResult
{
    public int Total { get; set; }

    public int Importados { get; set; }

    public int Omitidos { get; set; }

    public int Errores => Errors.Count;

    public List<ExcelImportError> Errors { get; set; } = [];
}