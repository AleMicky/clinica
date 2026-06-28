using Clinica.Modules.AtencionMedica.Application.TiposCampoFormulario;
using Clinica.SharedKernel.Crud;

namespace Clinica.Modules.AtencionMedica.Application.Abstractions;

public interface ITipoCampoFormularioService : ICrudService<Guid,
    TipoCampoFormularioResponse,
    CreateTipoCampoFormularioRequest,
    UpdateTipoCampoFormularioRequest>
{
}
