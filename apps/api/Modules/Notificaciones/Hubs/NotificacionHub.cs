using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Clinica.Api.Modules.Notificaciones.Hubs;

[Authorize]
public class NotificacionHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var usuarioId = Context.UserIdentifier;

        if (!string.IsNullOrWhiteSpace(usuarioId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"usuario:{usuarioId}");
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var usuarioId = Context.UserIdentifier;

        if (!string.IsNullOrWhiteSpace(usuarioId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"usuario:{usuarioId}");
        }

        await base.OnDisconnectedAsync(exception);
    }
}