namespace Clinica.Api.Shared.Exceptions;

public class NotFoundException : Exception
{
    public NotFoundException(string message)
        : base(message)
    {
    }

    public NotFoundException(string entity, object id)
        : base($"{entity} con identificador '{id}' no fue encontrado.")
    {
    }
}