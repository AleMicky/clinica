import { createFileRoute } from '@tanstack/react-router'
import { SolicitudesAlmacenView } from '../../../features/almacen/solicitudes/views/SolicitudesView'

export const Route = createFileRoute('/_admin/almacen/solicitudes')({
  component: SolicitudesAlmacenView,
})
