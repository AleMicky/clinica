using Clinica.Api.Shared.Exceptions;
using Microsoft.AspNetCore.Identity;

namespace Clinica.Api.Shared.Extensions;

public static class IdentityExtensions
{
    public static void EnsureSuccess(this IdentityResult result)
    {
        if (result.Succeeded)
            return;

        throw new BusinessException(
            string.Join(
                Environment.NewLine,
                result.Errors.Select(x => x.Description)));
    }
}