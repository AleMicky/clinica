using Clinica.Api.Modules.Recepcion.Admision.Dtos;
using Clinica.Api.Modules.Recepcion.Admision.Enums;
using Clinica.Api.Shared.Configuration;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Clinica.Api.Modules.Recepcion.Admision.Reports;

public sealed class AdmisionPdfDocument : IDocument
{
    private static readonly string Primary = Colors.Blue.Darken2;
    private static readonly string PrimaryDark = Colors.Blue.Darken3;
    private static readonly string Tint = Colors.Blue.Lighten5;
    private static readonly string TextDark = Colors.Grey.Darken3;
    private static readonly string TextMuted = Colors.Grey.Darken1;

    private readonly AdmisionResponse _admision;
    private readonly ClinicaOptions _clinica;

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
                    .FontFamily(Fonts.Arial)
                    .FontColor(TextDark));

                page.Header().Element(ComposeHeader);
                page.Content().Element(ComposeContent);
                page.Footer().Element(ComposeFooter);
            });
    }

    private void ComposeHeader(IContainer container)
    {
        container.Column(column =>
        {
            column.Spacing(12);

            column.Item().Background(PrimaryDark).CornerRadius(6)
                .Padding(16)
                .Row(row =>
                {
                    row.RelativeItem().Column(clinicCol =>
                    {
                        clinicCol.Item()
                            .Text(_clinica.Nombre)
                            .FontSize(17)
                            .Bold()
                            .FontColor(Colors.White);

                        var contacto = new List<string>(3);
                        if (!string.IsNullOrWhiteSpace(_clinica.Direccion))
                            contacto.Add(_clinica.Direccion);
                        if (!string.IsNullOrWhiteSpace(_clinica.Telefono))
                            contacto.Add($"Tel. {_clinica.Telefono}");
                        if (!string.IsNullOrWhiteSpace(_clinica.Nit))
                            contacto.Add($"NIT {_clinica.Nit}");

                        if (contacto.Count > 0)
                        {
                            clinicCol.Item().PaddingTop(3)
                                .Text(string.Join("   ·   ", contacto))
                                .FontSize(8)
                                .FontColor(Colors.Blue.Lighten4);
                        }
                    });

                    row.ConstantItem(12);

                    row.AutoItem().Background(Colors.White).CornerRadius(5)
                        .PaddingHorizontal(14).PaddingVertical(8)
                        .Column(col =>
                        {
                            col.Item()
                                .Text("COMPROBANTE DE ADMISIÓN")
                                .FontSize(7.5f)
                                .SemiBold()
                                .LetterSpacing(1)
                                .FontColor(TextMuted);

                            col.Item()
                                .Text(_admision.Numero)
                                .FontSize(14)
                                .Bold()
                                .FontColor(PrimaryDark);
                        });
                });

            column.Item().Row(row =>
            {
                row.RelativeItem().Element(e => InfoField(e, "FECHA Y HORA", _admision.FechaHora.ToString("dd/MM/yyyy HH:mm")));

                row.RelativeItem().Element(e => InfoField(e, "ATENDIDO POR", _admision.Recepcionista.NombreCompleto));

                row.RelativeItem(0.9f).Column(col =>
                {
                    col.Item().Text("ESTADO").FontSize(7.5f).Bold().FontColor(TextMuted);
                    col.Item().PaddingTop(2).Row(badgeRow =>
                    {
                        badgeRow.AutoItem().Element(EstadoBadge);
                    });
                });
            });
        });
    }

    private void ComposeContent(IContainer container)
    {
        container.PaddingVertical(14).Column(column =>
        {
            column.Spacing(14);

            ComposeDatosPaciente(column.Item());
            ComposeConvenio(column.Item());
            ComposeTablaDetalles(column.Item());
            ComposeTotales(column.Item());
            ComposeObservacion(column.Item());
        });
    }

    private void ComposeDatosPaciente(IContainer container)
    {
        var paciente = _admision.Paciente;
        var persona = paciente.Persona;

        var nombres = persona.ApellidoMaterno is null
            ? $"{persona.Nombres} {persona.ApellidoPaterno}"
            : $"{persona.Nombres} {persona.ApellidoPaterno} {persona.ApellidoMaterno}";

        var documento = persona.ExtensionDocumento is null
            ? persona.NumeroDocumento
            : $"{persona.NumeroDocumento} {persona.ExtensionDocumento}";

        Card(container).Column(column =>
        {
            column.Spacing(10);

            SectionTitle(column.Item(), "DATOS DEL PACIENTE");

            InfoGrid(column.Item(), 
            [
                ("NO. HISTORIA CLÍNICA", paciente.NumeroHistoriaClinica),
                ("NOMBRE COMPLETO", nombres),
                ("TIPO DOCUMENTO", persona.TipoDocumento),
                ("NÚMERO DOCUMENTO", documento),
            ]);
        });
    }

    private void ComposeConvenio(IContainer container)
    {
        if (_admision.Convenio is null)
            return;

        Card(container).Column(column =>
        {
            column.Spacing(10);

            SectionTitle(column.Item(), "CONVENIO");

            InfoGrid(column.Item(), 
            [
                ("CÓDIGO", _admision.Convenio.Codigo),
                ("NOMBRE", _admision.Convenio.Nombre),
            ]);
        });
    }

    private void ComposeTablaDetalles(IContainer container)
    {
        container.Column(column =>
        {
            column.Spacing(8);

            SectionTitle(column.Item(), "DETALLES DE LA ADMISIÓN");

            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(28);
                    columns.RelativeColumn(2);
                    columns.RelativeColumn(2);
                    columns.ConstantColumn(45);
                    columns.ConstantColumn(55);
                    columns.ConstantColumn(50);
                    columns.ConstantColumn(60);
                });

                table.Header(header =>
                {
                    header.Cell().Element(HeaderCell).AlignCenter().Text("#");
                    header.Cell().Element(HeaderCell).Text("SERVICIO");
                    header.Cell().Element(HeaderCell).Text("MÉDICO");
                    header.Cell().Element(HeaderCell).AlignCenter().Text("CANT.");
                    header.Cell().Element(HeaderCell).AlignRight().Text("PRECIO");
                    header.Cell().Element(HeaderCell).AlignRight().Text("DESC.");
                    header.Cell().Element(HeaderCell).AlignRight().Text("TOTAL");
                });

                var idx = 0;
                foreach (var detalle in _admision.Detalles)
                {
                    idx++;
                    var isAlt = idx % 2 == 0;

                    table.Cell().Element(cell => CellStyle(cell, isAlt))
                        .AlignCenter()
                        .Text(idx.ToString())
                        .FontSize(9)
                        .FontColor(TextMuted);

                    table.Cell().Element(cell => CellStyle(cell, isAlt))
                        .Column(col =>
                        {
                            col.Item()
                                .Text(detalle.Servicio.Nombre)
                                .FontSize(9.5f)
                                .Medium();
                            col.Item()
                                .Text(detalle.Servicio.Codigo)
                                .FontSize(7.5f)
                                .FontColor(TextMuted);
                        });

                    table.Cell().Element(cell => CellStyle(cell, isAlt))
                        .Text(GetMedicoNombre(detalle))
                        .FontSize(9.5f);

                    table.Cell().Element(cell => CellStyle(cell, isAlt))
                        .AlignCenter()
                        .Text(detalle.Cantidad.ToString("N2"))
                        .FontSize(9.5f);
                    table.Cell().Element(cell => CellStyle(cell, isAlt))
                        .AlignRight()
                        .Text(detalle.PrecioUnitario.ToString("N2"))
                        .FontSize(9.5f);
                    table.Cell().Element(cell => CellStyle(cell, isAlt))
                        .AlignRight()
                        .Text(detalle.Descuento.ToString("N2"))
                        .FontSize(9.5f);
                    table.Cell().Element(cell => CellStyle(cell, isAlt))
                        .AlignRight()
                        .Text(detalle.Total.ToString("N2"))
                        .FontSize(9.5f)
                        .SemiBold();
                }
            });
        });
    }

    private void ComposeTotales(IContainer container)
    {
        var total = _admision.Detalles.Sum(d => d.Total);
        var descuentoTotal = _admision.Detalles.Sum(d => d.Descuento);
        var subtotal = _admision.Detalles.Sum(d => d.Cantidad * d.PrecioUnitario);

        container.AlignRight().Width(230).Column(column =>
        {
            if (descuentoTotal > 0)
            {
                TotalRow(column.Item(), "Subtotal", subtotal.ToString("N2"));
                TotalRow(column.Item(), "Descuento", $"-{descuentoTotal:N2}", Colors.Red.Darken1);

                column.Item().PaddingVertical(4).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
            }

            column.Item()
                .Background(Primary).CornerRadius(5)
                .PaddingHorizontal(12).PaddingVertical(8)
                .Row(row =>
                {
                    row.RelativeItem()
                        .Text("TOTAL")
                        .FontSize(11)
                        .Bold()
                        .FontColor(Colors.White);
                    row.AutoItem()
                        .Text(total.ToString("N2"))
                        .FontSize(13)
                        .Bold()
                        .FontColor(Colors.White);
                });
        });
    }

    private void ComposeObservacion(IContainer container)
    {
        if (string.IsNullOrWhiteSpace(_admision.Observacion))
            return;

        container.Column(column =>
        {
            column.Spacing(8);

            SectionTitle(column.Item(), "OBSERVACIONES");

            column.Item()
                .Background(Colors.Amber.Lighten5).CornerRadius(5)
                .BorderLeft(3).BorderColor(Colors.Amber.Darken1)
                .Padding(10)
                .Text(_admision.Observacion)
                .FontSize(9.5f)
                .FontColor(Colors.Grey.Darken2);
        });
    }

    private void ComposeFooter(IContainer container)
    {
        container.PaddingTop(10).Column(column =>
        {
            column.Item().LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

            column.Item().PaddingTop(6).Row(row =>
            {
                row.RelativeItem()
                    .Text($"Generado el {DateTime.Now:dd/MM/yyyy HH:mm}")
                    .FontSize(8)
                    .FontColor(TextMuted);

                row.AutoItem().Text(text =>
                {
                    text.AlignRight();
                    text.Span("Página ").FontSize(8).FontColor(TextMuted);
                    text.CurrentPageNumber().FontSize(8).Bold().FontColor(Primary);
                    text.Span(" de ").FontSize(8).FontColor(TextMuted);
                    text.TotalPages().FontSize(8).Bold().FontColor(Primary);
                });
            });
        });
    }

    private static string GetMedicoNombre(AdmisionDetalleResponse detalle)
    {
        if (detalle.Medico?.Empleado is null)
            return "—";

        var nombre = detalle.Medico.Empleado.NombreCompleto;
        return string.IsNullOrWhiteSpace(detalle.Medico.MatriculaProfesional)
            ? nombre
            : $"{nombre} ({detalle.Medico.MatriculaProfesional})";
    }

    private void EstadoBadge(IContainer container)
    {
        (string Label, string TextColor, string BackgroundColor) style = _admision.Estado switch
        {
            EstadoAdmision.Registrada => ("REGISTRADA", Colors.Blue.Darken2, Colors.Blue.Lighten5),
            EstadoAdmision.Confirmada => ("CONFIRMADA", Colors.Teal.Darken2, Colors.Teal.Lighten5),
            EstadoAdmision.EnviadaVenta => ("ENVIADA A VENTA", Colors.Green.Darken2, Colors.Green.Lighten5),
            EstadoAdmision.Cancelada => ("CANCELADA", Colors.Red.Darken2, Colors.Red.Lighten5),
            _ => (_admision.Estado.ToString().ToUpperInvariant(), TextDark, Colors.Grey.Lighten4),
        };

        container.Background(style.BackgroundColor).CornerRadius(9)
            .Border(1).BorderColor(style.TextColor)
            .PaddingHorizontal(8).PaddingVertical(2)
            .Text(style.Label)
            .FontSize(8)
            .Bold()
            .FontColor(style.TextColor);
    }

    private static void SectionTitle(IContainer container, string title)
    {
        container.Row(row =>
        {
            row.AutoItem().Width(3).Background(Primary).CornerRadius(1.5f);
            row.RelativeItem().PaddingLeft(6)
                .Text(title)
                .FontSize(11)
                .Bold()
                .FontColor(PrimaryDark);
        });
    }

    private static void InfoField(IContainer container, string label, string value)
    {
        container.Column(col =>
        {
            col.Item()
                .Text(label)
                .FontSize(7.5f)
                .Bold()
                .FontColor(TextMuted);
            col.Item().PaddingTop(1)
                .Text(value)
                .FontSize(10)
                .Medium()
                .FontColor(TextDark);
        });
    }

    private static void InfoGrid(IContainer container, IReadOnlyList<(string Label, string Value)> fields)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.RelativeColumn();
                columns.RelativeColumn();
            });

            foreach (var (label, value) in fields)
            {
                table.Cell().PaddingVertical(4).PaddingRight(16)
                    .Element(e => InfoField(e, label, value));
            }
        });
    }

    private static void TotalRow(IContainer container, string label, string value, string? valueColor = null)
    {
        container.PaddingVertical(2).Row(row =>
        {
            row.RelativeItem()
                .Text(label)
                .FontSize(9.5f)
                .FontColor(TextMuted);
            row.AutoItem()
                .Text(value)
                .FontSize(9.5f)
                .FontColor(valueColor ?? TextDark);
        });
    }

    private static IContainer Card(IContainer container)
    {
        return container.Border(1)
            .BorderColor(Colors.Grey.Lighten2)
            .CornerRadius(6)
            .Background(Colors.White)
            .Padding(12);
    }

    private static IContainer HeaderCell(IContainer cell)
    {
        return cell.Background(Primary)
            .PaddingVertical(6).PaddingHorizontal(6)
            .AlignCenter()
            .DefaultTextStyle(text => text
                .FontSize(7.5f)
                .Bold()
                .FontColor(Colors.White));
    }

    private static IContainer CellStyle(IContainer cell, bool isAlt)
    {
        var styled = isAlt ? cell.Background(Tint) : cell;
        return styled.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5).PaddingHorizontal(6);
    }
}
