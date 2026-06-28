import '@tanstack/react-table'

declare module '@tanstack/react-table' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData, TValue> {
        align?: 'left' | 'center' | 'right'
        headerAlign?: 'left' | 'center' | 'right'
    }
}
