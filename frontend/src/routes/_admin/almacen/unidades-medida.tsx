import { createFileRoute } from '@tanstack/react-router'
import { UnidadesMedidaAlmacenView } from '../../../features/almacen/unidades-medida/views/UnidadesMedidaView'

export const Route = createFileRoute('/_admin/almacen/unidades-medida')({
  component: UnidadesMedidaAlmacenView,
})
