using Clinica.Api.Shared.Excel;

namespace Clinica.Api.Modules.Compras.Proveedor.Services;

public interface IProveedorImportacionService
{
    Task<ExcelImportResult> ImportarAsync(
        Stream archivo,
        CancellationToken cancellationToken = default);
}
