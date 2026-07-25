import { createFileRoute } from '@tanstack/react-router'

import { UnidadesMedidaView } from '../../../features/parametros/unidades-medida/views/UnidadesMedidaView'

export const Route = createFileRoute('/_admin/parametros/unidades-medida')({
    component: UnidadesMedidaView,
})
