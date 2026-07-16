import { createFileRoute } from '@tanstack/react-router'
import { FormulariosView } from '../../../features/atencion-medica/views/FormulariosView'
import { requireAdmin } from '../../../shared/utils/auth-guards'

type FormulariosSearch = {
    formularioId?: string
}

export const Route = createFileRoute('/_admin/atenciones/formularios/$tipoAtencionId')({
    beforeLoad: () => {
        requireAdmin()
    },
    validateSearch: (search: Record<string, unknown>): FormulariosSearch => ({
        formularioId:
            typeof search.formularioId === 'string' && search.formularioId.length > 0
                ? search.formularioId
                : undefined,
    }),
    component: FormulariosRoute,
})

function FormulariosRoute() {
    const { tipoAtencionId } = Route.useParams()
    const { formularioId } = Route.useSearch()
    return (
        <FormulariosView
            key={tipoAtencionId}
            tipoAtencionId={tipoAtencionId}
            formularioId={formularioId}
        />
    )
}
