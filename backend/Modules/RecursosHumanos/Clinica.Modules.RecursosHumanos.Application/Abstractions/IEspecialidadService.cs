using Clinica.Modules.RecursosHumanos.Application.Especialidades;
using Clinica.SharedKernel.Crud;

namespace Clinica.Modules.RecursosHumanos.Application.Abstractions;

public interface IEspecialidadService : ICrudService<Guid,
    EspecialidadResponse,
    CreateEspecialidadRequest,
    UpdateEspecialidadRequest>
{
}
