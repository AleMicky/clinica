namespace Clinica.SharedKernel.Pagination;

public class PagedResult<T>
{
    public IReadOnlyCollection<T> Items { get; init; } = [];
    public int TotalRecords { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }

    public int TotalPages =>
        PageSize <= 0 ? 0 : (int)Math.Ceiling(TotalRecords / (double)PageSize);

    public bool HasPreviousPage => Page > 1;

    public bool HasNextPage => Page < TotalPages;

    public PagedResult()
    {
    }

    public PagedResult(
        IReadOnlyCollection<T> items,
        int totalRecords,
        int page,
        int pageSize)
    {
        Items = items;
        TotalRecords = totalRecords;
        Page = page;
        PageSize = pageSize;
    }
}