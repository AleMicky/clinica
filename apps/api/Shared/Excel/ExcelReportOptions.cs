namespace Clinica.Api.Shared.Excel;

public sealed class ExcelReportOptions
{
    public string Title { get; set; } = "Reporte";
    public string? Subtitle { get; set; }
    public string SheetName { get; set; } = "Reporte";
    public string HeaderColor { get; set; } = "#1E40AF"; // Blue 800
    public string HeaderTextColor { get; set; } = "#FFFFFF";
    public bool IncludeGenerationDate { get; set; } = true;
    public string? GeneratedBy { get; set; }
    public bool ShowZebraRows { get; set; } = true;
    public bool AutoFilter { get; set; } = true;
    public bool FreezeHeader { get; set; } = true;
}
