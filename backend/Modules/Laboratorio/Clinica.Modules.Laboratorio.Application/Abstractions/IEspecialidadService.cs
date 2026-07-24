using Clinica.Modules.Laboratorio.Application.Especialidades;
using Clinica.SharedKernel.Crud;

namespace Clinica.Modules.Laboratorio.Application.Abstractions;

public interface IEspecialidadService : ICrudService<Guid,
    EspecialidadResponse,
    CreateEspecialidadRequest,
    UpdateEspecialidadRequest>
{
}
