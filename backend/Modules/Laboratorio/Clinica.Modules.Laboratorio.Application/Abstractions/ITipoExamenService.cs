using Clinica.Modules.Laboratorio.Application.TiposExamen;
using Clinica.SharedKernel.Crud;

namespace Clinica.Modules.Laboratorio.Application.Abstractions;

public interface ITipoExamenService : ICrudService<Guid,
    TipoExamenResponse,
    CreateTipoExamenRequest,
    UpdateTipoExamenRequest>
{
}
