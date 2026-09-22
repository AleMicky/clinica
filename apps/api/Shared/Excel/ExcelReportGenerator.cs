using ClosedXML.Excel;

namespace Clinica.Api.Shared.Excel;

public sealed class ExcelReportGenerator : IExcelReportGenerator
{
    public byte[] Generate<T>(
        string title,
        IEnumerable<T> data,
        Action<ExcelReportBuilder<T>> configureColumns)
    {
        return Generate(new ExcelReportOptions { Title = title, SheetName = title }, data, configureColumns);
    }

    public byte[] Generate<T>(
        ExcelReportOptions options,
        IEnumerable<T> data,
        Action<ExcelReportBuilder<T>> configureColumns)
    {
        ArgumentNullException.ThrowIfNull(options);
        ArgumentNullException.ThrowIfNull(data);
        ArgumentNullException.ThrowIfNull(configureColumns);

        var builder = new ExcelReportBuilder<T>();
        configureColumns(builder);

        if (builder.Columns.Count == 0)
        {
            throw new InvalidOperationException("Debe configurar al menos una columna para generar el reporte Excel.");
        }

        using var workbook = new XLWorkbook();
        var sheetName = CleanSheetName(options.SheetName);
        var worksheet = workbook.Worksheets.Add(sheetName);

        var totalCols = builder.Columns.Count;
        var currentRow = 1;

        // 1. Título principal
        var titleCell = worksheet.Cell(currentRow, 1);
        titleCell.Value = options.Title;
        titleCell.Style.Font.Bold = true;
        titleCell.Style.Font.FontSize = 14;
        titleCell.Style.Font.FontColor = XLColor.FromHtml("#0F172A"); // Slate 900
        
        if (totalCols > 1)
        {
            worksheet.Range(currentRow, 1, currentRow, totalCols).Merge();
        }
        worksheet.Row(currentRow).Height = 24;
        currentRow++;

        // 2. Subtítulo / Metadatos
        var metadataParts = new List<string>();
        if (!string.IsNullOrWhiteSpace(options.Subtitle))
        {
            metadataParts.Add(options.Subtitle);
        }
        if (options.IncludeGenerationDate)
        {
            metadataParts.Add($"Generado: {DateTime.Now:dd/MM/yyyy HH:mm:ss}");
        }
        if (!string.IsNullOrWhiteSpace(options.GeneratedBy))
        {
            metadataParts.Add($"Usuario: {options.GeneratedBy}");
        }

        if (metadataParts.Count > 0)
        {
            var subtitleCell = worksheet.Cell(currentRow, 1);
            subtitleCell.Value = string.Join(" | ", metadataParts);
            subtitleCell.Style.Font.Italic = true;
            subtitleCell.Style.Font.FontSize = 9;
            subtitleCell.Style.Font.FontColor = XLColor.FromHtml("#64748B"); // Slate 500

            if (totalCols > 1)
            {
                worksheet.Range(currentRow, 1, currentRow, totalCols).Merge();
            }
            currentRow++;
        }

        // Espacio antes de la tabla
        currentRow++;

        var headerRowIndex = currentRow;
        worksheet.Row(headerRowIndex).Height = 24;

        var headerBgColor = XLColor.FromHtml(options.HeaderColor);
        var headerTextColor = XLColor.FromHtml(options.HeaderTextColor);

        // 3. Encabezados de columnas
        for (var i = 0; i < totalCols; i++)
        {
            var colDef = builder.Columns[i];
            var cell = worksheet.Cell(headerRowIndex, i + 1);

            cell.Value = colDef.Header;
            cell.Style.Font.Bold = true;
            cell.Style.Font.FontSize = 10;
            cell.Style.Font.FontColor = headerTextColor;
            cell.Style.Fill.BackgroundColor = headerBgColor;
            cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            cell.Style.Alignment.Horizontal = MapAlignment(colDef.Alignment);
            
            // Bordes del header
            cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            cell.Style.Border.OutsideBorderColor = headerBgColor;
        }

        currentRow++;

        // 4. Filas de datos
        var dataRowStart = currentRow;
        var zebraBgColor = XLColor.FromHtml("#F8FAFC"); // Slate 50
        var borderColor = XLColor.FromHtml("#E2E8F0"); // Slate 200

        var dataList = data.ToList();
        for (var r = 0; r < dataList.Count; r++)
        {
            var item = dataList[r];
            worksheet.Row(currentRow).Height = 20;
            var isZebra = options.ShowZebraRows && (r % 2 == 1);

            for (var c = 0; c < totalCols; c++)
            {
                var colDef = builder.Columns[c];
                var cell = worksheet.Cell(currentRow, c + 1);
                var rawValue = colDef.ValueSelector(item);

                SetCellValue(cell, rawValue);

                if (!string.IsNullOrWhiteSpace(colDef.NumberFormat))
                {
                    cell.Style.NumberFormat.Format = colDef.NumberFormat;
                }

                cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                cell.Style.Alignment.Horizontal = MapAlignment(colDef.Alignment);
                cell.Style.Font.FontSize = 9.5;

                if (isZebra)
                {
                    cell.Style.Fill.BackgroundColor = zebraBgColor;
                }

                cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                cell.Style.Border.OutsideBorderColor = borderColor;
            }

            currentRow++;
        }

        // 5. Filtros automáticos y paneles congelados
        if (options.FreezeHeader)
        {
            worksheet.SheetView.FreezeRows(headerRowIndex);
        }

        if (options.AutoFilter && dataList.Count > 0)
        {
            worksheet.Range(headerRowIndex, 1, currentRow - 1, totalCols).SetAutoFilter();
        }

        // 6. Ajuste de anchos de columnas
        for (var i = 0; i < totalCols; i++)
        {
            var colDef = builder.Columns[i];
            var col = worksheet.Column(i + 1);

            if (colDef.Width.HasValue)
            {
                col.Width = colDef.Width.Value;
            }
            else
            {
                col.AdjustToContents();
                // Asegurar un ancho mínimo razonable y algo de padding
                if (col.Width < 12)
                {
                    col.Width = 12;
                }
                else
                {
                    col.Width += 3;
                }
            }
        }

        // 7. Generar stream
        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    private static void SetCellValue(IXLCell cell, object? value)
    {
        switch (value)
        {
            case null:
                cell.Value = string.Empty;
                break;
            case string s:
                cell.Value = s;
                break;
            case int i:
                cell.Value = i;
                break;
            case long l:
                cell.Value = l;
                break;
            case decimal d:
                cell.Value = d;
                break;
            case double db:
                cell.Value = db;
                break;
            case float f:
                cell.Value = f;
                break;
            case bool b:
                cell.Value = b;
                break;
            case DateTime dt:
                cell.Value = dt;
                break;
            case DateOnly dOnly:
                cell.Value = dOnly.ToDateTime(TimeOnly.MinValue);
                break;
            default:
                cell.Value = value.ToString() ?? string.Empty;
                break;
        }
    }

    private static XLAlignmentHorizontalValues MapAlignment(ExcelColumnAlignment alignment)
    {
        return alignment switch
        {
            ExcelColumnAlignment.Center => XLAlignmentHorizontalValues.Center,
            ExcelColumnAlignment.Right => XLAlignmentHorizontalValues.Right,
            _ => XLAlignmentHorizontalValues.Left
        };
    }

    private static string CleanSheetName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return "Reporte";

        // Los nombres de hoja en Excel tienen un límite de 31 caracteres y no permiten ciertos caracteres: \ / ? * [ ] :
        var invalidChars = new[] { '\\', '/', '?', '*', '[', ']', ':' };
        var clean = string.Concat(name.Where(c => !invalidChars.Contains(c))).Trim();

        return clean.Length > 31 ? clean[..31] : (string.IsNullOrWhiteSpace(clean) ? "Reporte" : clean);
    }
}
