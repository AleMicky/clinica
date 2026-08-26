using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;

namespace Clinica.Api.Modules.Notificaciones.Hubs;

public sealed class CustomUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        return connection.User?.FindFirstValue("sub")
               ?? connection.User?.FindFirstValue(ClaimTypes.NameIdentifier);
    }
}