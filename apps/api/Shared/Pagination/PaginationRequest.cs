namespace Clinica.Api.Shared.Pagination;

public sealed record PaginationRequest(
    int Page = 1,
    int PageSize = 20)
{
    public int ValidPage => Page < 1 ? 1 : Page;

    public int ValidPageSize =>
        PageSize switch
        {
            < 1 => 20,
            > 1000 => 1000,
            _ => PageSize
        };
}