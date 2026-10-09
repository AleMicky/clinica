using Clinica.Api.Shared.Excel;

namespace Clinica.Api.Modules.Parametros.UnidadesMedida.Services;

public interface IUnidadesMedidaImportacionService
{
    Task<ExcelImportResult> ImportarAsync(
        Stream archivo,
        CancellationToken cancellationToken = default);
}
