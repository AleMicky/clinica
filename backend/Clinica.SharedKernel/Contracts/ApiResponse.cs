namespace Clinica.SharedKernel.Contracts;

public record ApiResponse<T>(
    bool Success,
    string? Message,
    T? Data,
    IReadOnlyList<string>? Errors = null)
{
    public static ApiResponse<T> Ok(T data, string? message = null) =>
        new(true, message, data);

    public static ApiResponse<T> Fail(string message, IReadOnlyList<string>? errors = null) =>
        new(false, message, default, errors);
}
