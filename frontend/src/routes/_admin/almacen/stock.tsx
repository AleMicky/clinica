import { createFileRoute } from '@tanstack/react-router'
import { StockAlmacenView } from '../../../features/almacen/stock/views/StockView'

export const Route = createFileRoute('/_admin/almacen/stock')({
  component: StockAlmacenView,
})
