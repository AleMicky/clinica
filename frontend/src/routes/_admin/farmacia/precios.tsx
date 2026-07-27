import { createFileRoute } from '@tanstack/react-router'
import { PreciosFarmaciaView } from '../../../features/farmacia/precios/views/PreciosView'

export const Route = createFileRoute('/_admin/farmacia/precios')({
  component: PreciosFarmaciaView,
})
