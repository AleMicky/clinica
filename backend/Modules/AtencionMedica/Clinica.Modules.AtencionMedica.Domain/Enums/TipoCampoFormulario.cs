namespace Clinica.Modules.AtencionMedica.Domain.Enums;

public enum TipoCampoFormulario
{
    Texto = 1,
    TextoLargo = 2,

    Numero = 3,
    Decimal = 4,

    Fecha = 5,
    FechaHora = 6,
    Hora = 7,

    Booleano = 8,

    Seleccion = 9,
    MultiSeleccion = 10,

    Email = 11,
    Telefono = 12,

    Url = 13,

    Archivo = 14,
    Imagen = 15,

    Firma = 16,

    Json = 17
}