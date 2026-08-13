using Clinica.Api.Modules.Recepcion.Admision.Dtos;
using Clinica.Api.Shared.Configuration;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Clinica.Api.Modules.Recepcion.Admision.Reports;

public sealed class AdmisionPdfDocument : IDocument
{
    private readonly AdmisionResponse _admision;
    private readonly ClinicaOptions _clinica;

    private static readonly IReadOnlyList<string> EstadoLabels =
    [
        "", "Registrada", "Pendiente de Pago",
        "Pagada", "En Atención", "Finalizada", "Cancelada"
    ];

    public AdmisionPdfDocument(AdmisionResponse admision, ClinicaOptions clinica)
    {
        _admision = admision;
        _clinica = clinica;
    }

    public void Compose(IDocumentContainer container)
    {
        container
            .Page(page =>
            {
                page.Margin(36, Unit.Point);

                page.DefaultTextStyle(text => text
                    .FontSize(10)
                    .FontFamily(Fonts.Arial));

                page.Header().Element(ComposeHeader);
                page.Content().Element(ComposeContent);
                page.Footer().Element(ComposeFooter);
            });
    }

    private void ComposeHeader(IContainer container)
    {
        container.Column(column =>
        {
            column.Spacing(4);

            column.Item().Row(row =>
            {
                row.RelativeItem().Column(clinicCol =>
                {
                    clinicCol.Item()
                        .Text(_clinica.Nombre)
                        .FontSize(18)
                        .Bold()
                        .FontColor(Colors.Blue.Darken2);

                    if (!string.IsNullOrWhiteSpace(_clinica.Direccion))
                        clinicCol.Item().Text(_clinica.Direccion);

                    if (!string.IsNullOrWhiteSpace(_clinica.Telefono))
                        clinicCol.Item().Text($"Tel: {_clinica.Telefono}");

                    if (!string.IsNullOrWhiteSpace(_clinica.Nit))
                        clinicCol.Item().Text($"NIT: {_clinica.Nit}");
                });

                row.ConstantItem(200).AlignRight().Column(col =>
                {
                    col.Item()
                        .Text("COMPROBANTE DE ADMISIÓN")
                        .FontSize(14)
                        .Bold()
                        .FontColor(Colors.Grey.Darken2);

                    col.Item()
                        .Text(_admision.Numero)
                        .FontSize(12)
                        .Bold();
                });
            });

            column.Item().PaddingTop(8).LineHorizontal(1).LineColor(Colors.Grey.Lighten1);

            column.Item().PaddingTop(8).Grid(grid =>
            {
                grid.Spacing(8);
                grid.VerticalSpacing(4);
                grid.Columns(2);

                grid.Item(1).Column(infoCol =>
                {
                    infoCol.Item()
                        .Text("Fecha y Hora")
                        .Bold()
                        .FontColor(Colors.Grey.Darken1);
                    infoCol.Item().Text(_admision.FechaHora.ToString("dd/MM/yyyy HH:mm"));
                });

                grid.Item(1).Column(infoCol =>
                {
                    infoCol.Item()
                        .Text("Estado")
                        .Bold()
                        .FontColor(Colors.Grey.Darken1);
                    infoCol.Item().Text(GetEstadoLabel(_admision.Estado));
                });
            });
        });
    }

    private void ComposeContent(IContainer container)
    {
        container.PaddingVertical(16).Column(column =>
        {
            column.Spacing(16);

            ComposeDatosPaciente(column.Item());
            ComposeConvenio(column.Item());
            ComposeTablaDetalles(column.Item());
            ComposeTotales(column.Item());
            ComposeObservacion(column.Item());
        });
    }

    private void ComposeDatosPaciente(IContainer container)
    {
        container.Border(1).BorderColor(Colors.Grey.Lighten2).Padding(10).Column(column =>
        {
            column.Spacing(4);

            column.Item()
                .Text("DATOS DEL PACIENTE")
                .FontSize(11)
                .Bold()
                .FontColor(Colors.Blue.Darken2);

            var paciente = _admision.Paciente;
            var persona = paciente.Persona;

            column.Item().Grid(grid =>
            {
                grid.Spacing(8);
                grid.VerticalSpacing(4);
                grid.Columns(2);

                grid.Item(1).Column(col =>
                {
                    col.Item()
                        .Text("No. Historia Clínica")
                        .Bold()
                        .FontColor(Colors.Grey.Darken1);
                    col.Item().Text(paciente.NumeroHistoriaClinica);
                });

                grid.Item(1).Column(col =>
                {
                    var nombres = persona.ApellidoMaterno is null
                        ? $"{persona.Nombres} {persona.ApellidoPaterno}"
                        : $"{persona.Nombres} {persona.ApellidoPaterno} {persona.ApellidoMaterno}";
                    col.Item()
                        .Text("Nombre Completo")
                        .Bold()
                        .FontColor(Colors.Grey.Darken1);
                    col.Item().Text(nombres);
                });

                grid.Item(1).Column(col =>
                {
                    col.Item()
                        .Text("Tipo Documento")
                        .Bold()
                        .FontColor(Colors.Grey.Darken1);
                    col.Item().Text(persona.TipoDocumento);
                });

                grid.Item(1).Column(col =>
                {
                    var documento = persona.ExtensionDocumento is null
                        ? persona.NumeroDocumento
                        : $"{persona.NumeroDocumento} {persona.ExtensionDocumento}";
                    col.Item()
                        .Text("Número Documento")
                        .Bold()
                        .FontColor(Colors.Grey.Darken1);
                    col.Item().Text(documento);
                });
            });
        });
    }

    private void ComposeConvenio(IContainer container)
    {
        if (_admision.Convenio is null)
            return;

        container.Border(1).BorderColor(Colors.Grey.Lighten2).Padding(10).Column(column =>
        {
            column.Spacing(4);

            column.Item()
                .Text("CONVENIO")
                .FontSize(11)
                .Bold()
                .FontColor(Colors.Blue.Darken2);

            column.Item().Grid(grid =>
            {
                grid.Spacing(8);
                grid.Columns(2);

                grid.Item(1).Column(col =>
                {
                    col.Item()
                        .Text("Código")
                        .Bold()
                        .FontColor(Colors.Grey.Darken1);
                    col.Item().Text(_admision.Convenio.Codigo);
                });

                grid.Item(1).Column(col =>
                {
                    col.Item()
                        .Text("Nombre")
                        .Bold()
                        .FontColor(Colors.Grey.Darken1);
                    col.Item().Text(_admision.Convenio.Nombre);
                });
            });
        });
    }

    private void ComposeTablaDetalles(IContainer container)
    {
        container.Column(column =>
        {
            column.Spacing(8);

            column.Item()
                .Text("DETALLES DE LA ADMISIÓN")
                .FontSize(11)
                .Bold()
                .FontColor(Colors.Blue.Darken2);

            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(40);
                    columns.RelativeColumn(2);
                    columns.RelativeColumn(2);
                    columns.ConstantColumn(50);
                    columns.ConstantColumn(60);
                    columns.ConstantColumn(50);
                    columns.ConstantColumn(60);
                });

                table.Header(header =>
                {
                    header.Cell().Element(HeaderCell).Text("#");
                    header.Cell().Element(HeaderCell).Text("Servicio");
                    header.Cell().Element(HeaderCell).Text("Médico");
                    header.Cell().Element(HeaderCell).AlignCenter().Text("Cant.");
                    header.Cell().Element(HeaderCell).AlignRight().Text("Precio");
                    header.Cell().Element(HeaderCell).AlignRight().Text("Desc.");
                    header.Cell().Element(HeaderCell).AlignRight().Text("Total");
                });

                var idx = 0;
                foreach (var detalle in _admision.Detalles)
                {
                    idx++;
                    var isAlt = idx % 2 == 0;

                    table.Cell().Element(cell => CellStyle(cell, isAlt))
                        .AlignCenter()
                        .Text(idx.ToString());
                    table.Cell().Element(cell => CellStyle(cell, isAlt))
                        .Column(col =>
                        {
                            col.Item()
                                .Text(detalle.Servicio.Codigo)
                                .FontSize(8)
                                .FontColor(Colors.Grey.Darken1);
                            col.Item().Text(detalle.Servicio.Nombre).FontSize(9);
                        });

                    var medicoNombre = string.Empty;
                    if (detalle.Medico?.Empleado is not null)
                    {
                        medicoNombre = detalle.Medico.Empleado.NombreCompleto;
                        if (!string.IsNullOrWhiteSpace(detalle.Medico.MatriculaProfesional))
                            medicoNombre = $"{medicoNombre} ({detalle.Medico.MatriculaProfesional})";
                    }

                    table.Cell().Element(cell => CellStyle(cell, isAlt))
                        .Column(col =>
                        {
                            if (!string.IsNullOrWhiteSpace(medicoNombre))
                            {
                                col.Item().Text(medicoNombre).FontSize(9);
                            }
                            else
                            {
                                col.Item()
                                    .Text("—")
                                    .FontColor(Colors.Grey.Lighten1);
                            }
                        });

                    table.Cell().Element(cell => CellStyle(cell, isAlt))
                        .AlignCenter()
                        .Text(detalle.Cantidad.ToString("N2"));
                    table.Cell().Element(cell => CellStyle(cell, isAlt))
                        .AlignRight()
                        .Text(detalle.PrecioUnitario.ToString("N2"));
                    table.Cell().Element(cell => CellStyle(cell, isAlt))
                        .AlignRight()
                        .Text(detalle.Descuento.ToString("N2"));
                    table.Cell().Element(cell => CellStyle(cell, isAlt))
                        .AlignRight()
                        .Text(detalle.Total.ToString("N2"));
                }
            });
        });
    }

    private static IContainer CellStyle(IContainer cell, bool isAlt)
    {
        if (isAlt)
            cell.Background(Colors.Grey.Lighten5);
        return cell.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(6);
    }

    private static IContainer HeaderCell(IContainer cell)
    {
        return cell.BorderBottom(2).BorderTop(1)
            .BorderColor(Colors.Grey.Lighten1)
            .Background(Colors.Grey.Lighten4)
            .Padding(6)
            .AlignCenter()
            .DefaultTextStyle(text => text
                .FontSize(8)
                .Bold());
    }

    private void ComposeTotales(IContainer container)
    {
        var total = _admision.Detalles.Sum(d => d.Total);
        var descuentoTotal = _admision.Detalles.Sum(d => d.Descuento);
        var subtotal = _admision.Detalles.Sum(d => d.Cantidad * d.PrecioUnitario);

        container.AlignRight().Width(200).Column(column =>
        {
            column.Spacing(4);

            if (descuentoTotal > 0)
            {
                column.Item().Row(row =>
                {
                    row.RelativeItem()
                        .Text("Subtotal:")
                        .FontColor(Colors.Grey.Darken1);
                    row.ConstantItem(80)
                        .AlignRight()
                        .Text(subtotal.ToString("N2"));
                });

                column.Item().Row(row =>
                {
                    row.RelativeItem()
                        .Text("Descuento:")
                        .FontColor(Colors.Grey.Darken1);
                    row.ConstantItem(80)
                        .AlignRight()
                        .Text(descuentoTotal.ToString("N2"));
                });
            }

            column.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten1);

            column.Item().Row(row =>
            {
                row.RelativeItem()
                    .Text("TOTAL:")
                    .FontSize(12)
                    .Bold();
                row.ConstantItem(80)
                    .AlignRight()
                    .Text(total.ToString("N2"))
                    .FontSize(13)
                    .FontColor(Colors.Blue.Darken2)
                    .Bold();
            });
        });
    }

    private void ComposeObservacion(IContainer container)
    {
        if (string.IsNullOrWhiteSpace(_admision.Observacion))
            return;

        container.PaddingTop(16).Column(column =>
        {
            column.Spacing(4);

            column.Item()
                .Text("OBSERVACIONES")
                .FontSize(11)
                .Bold()
                .FontColor(Colors.Blue.Darken2);

            column.Item()
                .Border(1)
                .BorderColor(Colors.Grey.Lighten2)
                .Padding(8)
                .Text(_admision.Observacion);
        });
    }

    private void ComposeFooter(IContainer container)
    {
        container.PaddingTop(16).Column(column =>
        {
            column.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten1);

            column.Item().PaddingTop(6).Row(row =>
            {
                row.RelativeItem()
                    .Text($"Generado el {DateTime.Now:dd/MM/yyyy HH:mm}")
                    .FontSize(8)
                    .FontColor(Colors.Grey.Darken1);

                row.ConstantItem(120)
                    .AlignRight()
                    .Text(text =>
                    {
                        text.CurrentPageNumber()
                            .FontSize(8)
                            .FontColor(Colors.Grey.Darken1);
                        text.Span(" / ")
                            .FontSize(8)
                            .FontColor(Colors.Grey.Darken1);
                        text.TotalPages()
                            .FontSize(8)
                            .FontColor(Colors.Grey.Darken1);
                    });
            });
        });
    }

    private static string GetEstadoLabel(Entity.EstadoAdmision estado) =>
        (int)estado is > 0 and < 7
            ? EstadoLabels[(int)estado]
            : estado.ToString();
}