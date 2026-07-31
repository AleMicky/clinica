import { createFileRoute } from '@tanstack/react-router'
import { AlmacenesCatalogView } from '../../../features/almacen/almacenes/views/AlmacenesView'

export const Route = createFileRoute('/_admin/almacen/almacenes')({
  component: AlmacenesCatalogView,
})
