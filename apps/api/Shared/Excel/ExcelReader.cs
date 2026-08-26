namespace Clinica.Api.Shared.Excel;

using ClosedXML.Excel;

public sealed class ExcelReader : IExcelReader
{
    public List<ExcelRow> Read(Stream stream, int sheetIndex = 1)
    {
        using var workbook = new XLWorkbook(stream);
        var worksheet = workbook.Worksheet(sheetIndex);
        var range = worksheet.RangeUsed();

        if (range is null)
            return [];

        var headerRow = range.FirstRow();

        var headers = headerRow
            .CellsUsed()
            .ToDictionary(
                x => x.Address.ColumnNumber,
                x => x.GetString().Trim(),
                EqualityComparer<int>.Default);

        var result = new List<ExcelRow>();

        foreach (var row in range.RowsUsed().Skip(1))
        {
            var values = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

            foreach (var header in headers)
            {
                var value = row
                    .Cell(header.Key)
                    .GetFormattedString()
                    .Trim();

                values[header.Value] = value;
            }

            result.Add(new ExcelRow
            {
                RowNumber = row.RowNumber(),
                Values = values
            });
        }

        return result;
    }
}