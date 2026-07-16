import { createFileRoute } from '@tanstack/react-router'
import { FormulariosView } from '../../../features/atencion-medica/views/FormulariosView'
import { requireAdmin } from '../../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/atenciones/formularios/$tipoAtencionId')({
    beforeLoad: () => {
        requireAdmin()
    },
    component: FormulariosRoute,
})

function FormulariosRoute() {
    const { tipoAtencionId } = Route.useParams()
    return <FormulariosView tipoAtencionId={tipoAtencionId} />
}
