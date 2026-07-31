import { createFileRoute } from '@tanstack/react-router'
import { TransferenciasAlmacenView } from '../../../features/almacen/transferencias/views/TransferenciasView'

export const Route = createFileRoute('/_admin/almacen/transferencias')({
  component: TransferenciasAlmacenView,
})
