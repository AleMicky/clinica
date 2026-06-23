namespace Clinica.SharedKernel.Responses;

public sealed class ApiResponse<T>
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;
    public T? Data { get; init; }
    public DateTime Timestamp { get; init; } = DateTime.UtcNow;
}