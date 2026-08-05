namespace Clinica.Api.Shared.Exceptions;

public class ValidationException(IReadOnlyDictionary<string, string[]> errors)
    : Exception("Uno o más datos no son válidos.")
{
    public IReadOnlyDictionary<string, string[]> Errors { get; } = errors;

    public ValidationException(string field, string message)
        : this(new Dictionary<string, string[]>
        {
            [field] = [message]
        })
    {
    }
}