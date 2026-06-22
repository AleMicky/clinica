namespace Clinica.SharedKernel.Pagination;

public class PagedResult<T>
{
    public IReadOnlyCollection<T> Items { get; set; } = [];
    public int TotalRecords { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}