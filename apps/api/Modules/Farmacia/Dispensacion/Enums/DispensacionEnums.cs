namespace Clinica.Api.Modules.Farmacia.Dispensacion.Enums;

public enum TipoDispensacion
{
    VentaAmbulatoria = 1, // Venta en mostrador de farmacia / venta externa con pago en caja
    Hospitalaria = 2,     // Dispensación a paciente internado / cargo a piso
    Urgencia = 3          // Dispensación inmediata en emergencias / urgencias
}

public enum EstadoDispensacion
{
    PendientePago = 1,    // Preventa emitida; ticket entregado al paciente para pagar en Caja
    Pagado = 2,           // Cobrado exitosamente en Caja; listo para entrega física de fármacos
    Entregado = 3,        // Medicamentos entregados al paciente; stock descontado en almacén
    Anulado = 4           // Anulado / Cancelado
}
