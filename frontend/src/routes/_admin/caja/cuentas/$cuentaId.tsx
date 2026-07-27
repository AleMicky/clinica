import { createFileRoute } from '@tanstack/react-router'

import { CuentaDetailView } from '../../../../features/caja/views/CuentaDetailView'

export const Route = createFileRoute('/_admin/caja/cuentas/$cuentaId')({
    component: CuentaDetailPage,
})

function CuentaDetailPage() {
    const { cuentaId } = Route.useParams()
    return <CuentaDetailView cuentaId={cuentaId} />
}
