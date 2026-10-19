namespace Clinica.Api.Modules.Quirofano.Cirugia.Enums;

public enum EstadoCirugia
{
    Programada = 1,
    EnPreparacion = 2,
    EnCurso = 3,
    Recuperacion = 4,
    Finalizada = 5,
    Cancelada = 6
}

public enum TipoCirugia
{
    Programada = 1,
    Urgencia = 2,
    Ambulatoria = 3
}

public enum TipoAnestesia
{
    General = 1,
    RegionalRaquidea = 2,
    Epidural = 3,
    LocalYSedacion = 4,
    Local = 5
}
