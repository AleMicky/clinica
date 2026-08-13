using Clinica.Api.Modules.Recepcion.Admision.Dtos;
using Clinica.Api.Modules.Recepcion.Admision.Reports;
using Clinica.Api.Shared.Configuration;
using Microsoft.Extensions.Options;
using QuestPDF.Fluent;

namespace Clinica.Api.Modules.Recepcion.Admision.Services;

public sealed class AdmisionPdfService(
    AdmisionService admisionService,
    IOptions<ClinicaOptions> clinicaOptions
)
{
    public async Task<byte[]> GenerarAsync(
        int admisionId,
        CancellationToken cancellationToken = default)
    {
        var admision = await admisionService.ObtenerAsync(
            admisionId,
            cancellationToken);

        var document = new AdmisionPdfDocument(admision, clinicaOptions.Value);

        return document.GeneratePdf();
    }

    public async Task<(byte[] Content, string FileName)> GenerarConNombreAsync(
        int admisionId,
        CancellationToken cancellationToken = default)
    {
        var admision = await admisionService.ObtenerAsync(
            admisionId,
            cancellationToken);

        var document = new AdmisionPdfDocument(admision, clinicaOptions.Value);

        var content = document.GeneratePdf();
        var fileName = $"admision-{admision.Numero}.pdf";

        return (content, fileName);
    }
}