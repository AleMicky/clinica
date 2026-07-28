namespace Clinica.Modules.RecursosHumanos.Application.ProgramacionDiaria;

public readonly record struct TurnoVentana(DateTime Inicio, DateTime Fin)
{
    public bool SeTraslapaCon(TurnoVentana otra) =>
        Inicio < otra.Fin && otra.Inicio < Fin;
}

public static class TurnoVentanaHelper
{
    public static TurnoVentana Crear(DateOnly fecha, TimeOnly horaInicio, TimeOnly horaFin, bool cruceDia)
    {
        var inicio = fecha.ToDateTime(horaInicio);
        var fin = cruceDia
            ? fecha.AddDays(1).ToDateTime(horaFin)
            : fecha.ToDateTime(horaFin);

        return new TurnoVentana(inicio, fin);
    }

    public static bool ContieneHora(TurnoVentana ventana, DateTime instante) =>
        instante >= ventana.Inicio && instante < ventana.Fin;

    public static bool ContieneHora(DateOnly fecha, TimeOnly horaInicio, TimeOnly horaFin, bool cruceDia, DateTime instante)
    {
        var ventana = Crear(fecha, horaInicio, horaFin, cruceDia);
        return ContieneHora(ventana, instante);
    }
}
