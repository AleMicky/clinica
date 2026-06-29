import { createFileRoute } from '@tanstack/react-router'

import { EnfermeriaPage } from '../../../../features/atencion-medica/views/EnfermeriaPage'

export const Route = createFileRoute('/_admin/atencion-medica/enfermeria/')({
    component: EnfermeriaPage,
})
