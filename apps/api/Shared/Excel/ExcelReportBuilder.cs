namespace Clinica.Api.Shared.Excel;

public sealed class ExcelColumnDefinition<T>
{
    public required string Header { get; set; }
    public required Func<T, object?> ValueSelector { get; set; }
    public ExcelColumnAlignment Alignment { get; set; } = ExcelColumnAlignment.Left;
    public string? NumberFormat { get; set; }
    public double? Width { get; set; }
}

public sealed class ExcelReportBuilder<T>
{
    private readonly List<ExcelColumnDefinition<T>> _columns = [];

    public IReadOnlyList<ExcelColumnDefinition<T>> Columns => _columns;

    public ExcelReportBuilder<T> AddColumn(
        string header,
        Func<T, object?> valueSelector,
        ExcelColumnAlignment alignment = ExcelColumnAlignment.Left,
        string? numberFormat = null,
        double? width = null)
    {
        _columns.Add(new ExcelColumnDefinition<T>
        {
            Header = header,
            ValueSelector = valueSelector,
            Alignment = alignment,
            NumberFormat = numberFormat,
            Width = width
        });
        return this;
    }

    public ExcelReportBuilder<T> AddDateColumn(
        string header,
        Func<T, object?> valueSelector,
        string format = "dd/MM/yyyy",
        double? width = null)
    {
        return AddColumn(header, valueSelector, ExcelColumnAlignment.Center, format, width);
    }

    public ExcelReportBuilder<T> AddDateTimeColumn(
        string header,
        Func<T, object?> valueSelector,
        string format = "dd/MM/yyyy HH:mm",
        double? width = null)
    {
        return AddColumn(header, valueSelector, ExcelColumnAlignment.Center, format, width);
    }

    public ExcelReportBuilder<T> AddCurrencyColumn(
        string header,
        Func<T, object?> valueSelector,
        string format = "#,##0.00",
        double? width = null)
    {
        return AddColumn(header, valueSelector, ExcelColumnAlignment.Right, format, width);
    }

    public ExcelReportBuilder<T> AddNumberColumn(
        string header,
        Func<T, object?> valueSelector,
        string format = "#,##0",
        double? width = null)
    {
        return AddColumn(header, valueSelector, ExcelColumnAlignment.Right, format, width);
    }

    public ExcelReportBuilder<T> AddBooleanColumn(
        string header,
        Func<T, bool?> valueSelector,
        string trueText = "Sí",
        string falseText = "No",
        double? width = null)
    {
        return AddColumn(
            header,
            item =>
            {
                var val = valueSelector(item);
                return val.HasValue ? (val.Value ? trueText : falseText) : string.Empty;
            },
            ExcelColumnAlignment.Center,
            null,
            width);
    }
}
