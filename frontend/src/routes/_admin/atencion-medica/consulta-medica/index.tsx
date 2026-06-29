import { createFileRoute } from '@tanstack/react-router'

import { ConsultaMedicaPage } from '../../../../features/atencion-medica/views/ConsultaMedicaPage'

export const Route = createFileRoute('/_admin/atencion-medica/consulta-medica/')({
    component: ConsultaMedicaPage,
})
