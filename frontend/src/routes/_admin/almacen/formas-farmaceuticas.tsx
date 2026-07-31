import { createFileRoute } from '@tanstack/react-router'
import { FormasFarmaceuticasView } from '../../../features/almacen/formas-farmaceuticas/views/FormasFarmaceuticasView'

export const Route = createFileRoute('/_admin/almacen/formas-farmaceuticas')({
  component: FormasFarmaceuticasView,
})
