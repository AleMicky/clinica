import { createFileRoute } from '@tanstack/react-router'

import { TiposAreaView } from '../../../features/recursos-humanos/tipos-area/views/TiposAreaView'

export const Route = createFileRoute('/_admin/recursos-humanos/tipos-area')({
    component: TiposAreaView,
})
