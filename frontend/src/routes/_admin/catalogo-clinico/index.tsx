import { createFileRoute } from '@tanstack/react-router'
import { CatalogoClinicoView } from '../../../features/catalogo-clinico/views/CatalogoClinicoView'
import { requireAdmin } from '../../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/catalogo-clinico/')({
    beforeLoad: () => {
        requireAdmin()
    },
    component: CatalogoClinicoView,
})
