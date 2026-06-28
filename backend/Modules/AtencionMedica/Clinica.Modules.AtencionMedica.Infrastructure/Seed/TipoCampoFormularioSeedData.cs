using Clinica.Modules.AtencionMedica.Domain.Entities;
using TipoCampoFormularioEnum = Clinica.Modules.AtencionMedica.Domain.Enums.TipoCampoFormulario;

namespace Clinica.Modules.AtencionMedica.Infrastructure.Seed;

internal static class TipoCampoFormularioSeedData
{
    internal static IReadOnlyList<TipoCampoFormulario> Create()
    {
        return
        [
            Create(TipoCampoFormularioEnum.Texto, "Texto", "input", "string"),
            Create(TipoCampoFormularioEnum.TextoLargo, "Texto largo", "textarea", "string"),
            Create(TipoCampoFormularioEnum.Numero, "Número", "number", "int"),
            Create(TipoCampoFormularioEnum.Decimal, "Decimal", "number", "decimal", permiteValidaciones: true),
            Create(TipoCampoFormularioEnum.Fecha, "Fecha", "date", "date"),
            Create(TipoCampoFormularioEnum.FechaHora, "Fecha y hora", "datetime", "datetime"),
            Create(TipoCampoFormularioEnum.Hora, "Hora", "time", "time"),
            Create(TipoCampoFormularioEnum.Booleano, "Booleano", "checkbox", "bool", permiteValorDefecto: true),
            Create(TipoCampoFormularioEnum.Seleccion, "Selección", "select", "string", permiteOpciones: true, permiteValorDefecto: true),
            Create(TipoCampoFormularioEnum.MultiSeleccion, "Multi selección", "multiselect", "json", permiteOpciones: true, permiteMultiple: true),
            Create(TipoCampoFormularioEnum.Email, "Email", "email", "string", permiteValidaciones: true),
            Create(TipoCampoFormularioEnum.Telefono, "Teléfono", "tel", "string", permiteValidaciones: true),
            Create(TipoCampoFormularioEnum.Url, "URL", "url", "string", permiteValidaciones: true),
            Create(TipoCampoFormularioEnum.Archivo, "Archivo", "file", "string"),
            Create(TipoCampoFormularioEnum.Imagen, "Imagen", "image", "string"),
            Create(TipoCampoFormularioEnum.Firma, "Firma", "signature", "string"),
            Create(TipoCampoFormularioEnum.Json, "JSON", "json", "json", permiteValidaciones: true)
        ];
    }

    private static TipoCampoFormulario Create(
        TipoCampoFormularioEnum tipo,
        string nombre,
        string controlFrontend,
        string tipoDato,
        bool permiteOpciones = false,
        bool permiteValorDefecto = false,
        bool permiteValidaciones = false,
        bool permiteMultiple = false)
    {
        return new TipoCampoFormulario
        {
            Id = CreateDeterministicId(tipo),
            Codigo = tipo.ToString().ToUpperInvariant(),
            Nombre = nombre,
            ControlFrontend = controlFrontend,
            TipoDato = tipoDato,
            PermiteOpciones = permiteOpciones,
            PermiteValorDefecto = permiteValorDefecto,
            PermiteValidaciones = permiteValidaciones,
            PermiteMultiple = permiteMultiple,
            CreatedAt = DateTime.UtcNow
        };
    }

    private static Guid CreateDeterministicId(TipoCampoFormularioEnum tipo)
    {
        return Guid.Parse($"00000000-0000-0000-0001-{((int)tipo):D12}");
    }
}
