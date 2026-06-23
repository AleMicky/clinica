namespace Clinica.SharedKernel.Pagination;

public class PagedResult<T>
{
    public IReadOnlyCollection<T> Items { get; set; } = [];
    public int TotalRecords { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }

    private int TotalPages =>  PageSize <= 0 ? 0 : (int)Math.Ceiling(TotalRecords / (double)PageSize);

    public bool HasPreviousPage => Page > 1;

    public bool HasNextPage => Page < TotalPages;
}