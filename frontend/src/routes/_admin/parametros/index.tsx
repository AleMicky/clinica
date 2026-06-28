import { createFileRoute } from '@tanstack/react-router'
import { CatalogosView } from '../../../features/parametros/catalogos/views/CatalogosView'

export const Route = createFileRoute('/_admin/parametros/')({
    component: CatalogosView,
})
