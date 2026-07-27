using Clinica.Modules.Laboratorio.Application.LaboratoriosExternos;
using Clinica.SharedKernel.Crud;

namespace Clinica.Modules.Laboratorio.Application.Abstractions;

public interface ILaboratorioExternoService : ICrudService<Guid,
    LaboratorioExternoResponse,
    CreateLaboratorioExternoRequest,
    UpdateLaboratorioExternoRequest>
{
}
