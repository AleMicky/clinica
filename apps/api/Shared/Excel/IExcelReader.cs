namespace Clinica.Api.Shared.Excel;

public interface IExcelReader
{
    List<ExcelRow> Read(
        Stream stream,
        int sheetIndex = 1);
}