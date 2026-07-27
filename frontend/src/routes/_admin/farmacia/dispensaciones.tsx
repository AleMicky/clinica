import { createFileRoute } from '@tanstack/react-router'
import { DispensacionesView } from '../../../features/farmacia/dispensaciones/views/DispensacionesView'

export const Route = createFileRoute('/_admin/farmacia/dispensaciones')({
  component: DispensacionesView,
})
