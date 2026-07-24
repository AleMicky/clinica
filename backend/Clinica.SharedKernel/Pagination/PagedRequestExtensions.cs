namespace Clinica.SharedKernel.Pagination;

public static class PagedRequestExtensions
{
    private const int DefaultPage = 1;
    private const int DefaultPageSize = 10;
    private const int MaxPageSize = 100;

    public static (int Page, int PageSize) Normalize(this PagedRequest request)
    {
        var page = request.Page <= 0 ? DefaultPage : request.Page;
        var pageSize = request.PageSize <= 0
            ? DefaultPageSize
            : Math.Min(request.PageSize, MaxPageSize);

        return (page, pageSize);
    }
}
