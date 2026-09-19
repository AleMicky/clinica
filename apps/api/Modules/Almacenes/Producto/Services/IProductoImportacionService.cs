using Clinica.Api.Shared.Excel;

namespace Clinica.Api.Modules.Almacenes.Producto.Services;

public interface IProductoImportacionService
{
    Task<ExcelImportResult> ImportarAsync(
        Stream archivo,
        CancellationToken cancellationToken = default);
}
