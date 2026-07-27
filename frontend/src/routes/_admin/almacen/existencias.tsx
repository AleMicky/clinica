import { createFileRoute } from '@tanstack/react-router'
import { ExistenciasAlmacenView } from '../../../features/almacen/existencias/views/ExistenciasView'

export const Route = createFileRoute('/_admin/almacen/existencias')({
  component: ExistenciasAlmacenView,
})
