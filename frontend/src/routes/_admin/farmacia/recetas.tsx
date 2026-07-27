import { createFileRoute } from '@tanstack/react-router'
import { RecetasView } from '../../../features/farmacia/recetas/views/RecetasView'

export const Route = createFileRoute('/_admin/farmacia/recetas')({
  component: RecetasView,
})
