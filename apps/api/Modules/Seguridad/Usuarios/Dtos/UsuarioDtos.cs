namespace Clinica.Api.Modules.Seguridad.Usuarios.Dtos;

public abstract record UsuarioRequest
{
    public required string UserName { get; init; }
    public required string Email { get; init; }
    public required UsuarioPersonaRequest Persona { get; init; }
    public List<string> Roles { get; init; } = [];
    public bool Activo { get; init; } = true;
}

public sealed record CreateUsuarioRequest : UsuarioRequest
{
    public required string Password { get; init; }
}

public sealed record UpdateUsuarioRequest
{
    public required string UserName { get; init; }
    public required string Email { get; init; }
    public List<string> Roles { get; init; } = [];
    public bool Activo { get; init; } = true;
};

public sealed record UsuarioPersonaRequest
{
    public required string Nombres { get; init; }
    public required string ApellidoPaterno { get; init; }
    public string? ApellidoMaterno { get; init; }

    public DateOnly FechaNacimiento { get; init; }

    public string? Telefono { get; init; }
    public string? Direccion { get; init; }

    public required string TipoDocumento { get; init; }
    public required string NumeroDocumento { get; init; }

    public string? ExtensionDocumento { get; init; }
    public string? ComplementoDocumento { get; init; }

    public string? Genero { get; init; }
    public string? EstadoCivil { get; init; }
}

public sealed record UsuarioResponse
{
    public int Id { get; init; }

    public string Email { get; init; } = string.Empty;
    public string UserName { get; init; } = string.Empty;

    public bool Activo { get; init; }
    public bool DebeCambiarPassword { get; init; }

    public List<string> Roles { get; init; } = [];

    public required UsuarioPersonaResponse Persona { get; init; }
}

public sealed record UsuarioPersonaResponse
{
    public int Id { get; init; }

    public string Nombres { get; init; } = string.Empty;
    public string ApellidoPaterno { get; init; } = string.Empty;
    public string? ApellidoMaterno { get; init; }

    public DateOnly FechaNacimiento { get; init; }

    public string? Telefono { get; init; }
    public string? Direccion { get; init; }

    public string TipoDocumento { get; init; } = string.Empty;
    public string NumeroDocumento { get; init; } = string.Empty;

    public string? ExtensionDocumento { get; init; }
    public string? ComplementoDocumento { get; init; }

    public string? Genero { get; init; }
    public string? EstadoCivil { get; init; }
}