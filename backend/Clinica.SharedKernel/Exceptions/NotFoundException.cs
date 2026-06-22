namespace Clinica.SharedKernel.Exceptions;

public sealed class NotFoundException : Exception
{
    public NotFoundException(string message)
        : base(message)
    {
    }

    public NotFoundException(string entityName, object id)
        : base($"{entityName} con id '{id}' no encontrado.")
    {
    }
}