using Clinica.Modules.Laboratorio.Application.Pruebas;
using Clinica.SharedKernel.Crud;

namespace Clinica.Modules.Laboratorio.Application.Abstractions;

public interface IPruebaService : ICrudService<Guid,
    PruebaResponse,
    CreatePruebaRequest,
    UpdatePruebaRequest>
{
}
