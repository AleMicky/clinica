using Clinica.Modules.RecursosHumanos.Application.Profesiones;
using Clinica.SharedKernel.Crud;

namespace Clinica.Modules.RecursosHumanos.Application.Abstractions;

public interface IProfesionService : ICrudService<Guid,
    ProfesionResponse,
    CreateProfesionRequest,
    UpdateProfesionRequest>
{
}
