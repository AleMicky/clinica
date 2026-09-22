namespace Clinica.Api.Shared.Excel;

public interface IExcelReportGenerator
{
    byte[] Generate<T>(
        ExcelReportOptions options,
        IEnumerable<T> data,
        Action<ExcelReportBuilder<T>> configureColumns);

    byte[] Generate<T>(
        string title,
        IEnumerable<T> data,
        Action<ExcelReportBuilder<T>> configureColumns);
}
