import { createFileRoute } from '@tanstack/react-router'
import { CatalogosView } from '../../../features/catalogos/views/CatalogosView'
import { requireAdmin } from '../../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/catalogos/')({
    beforeLoad: () => {
        requireAdmin()
    },
    component: CatalogosView,
})
