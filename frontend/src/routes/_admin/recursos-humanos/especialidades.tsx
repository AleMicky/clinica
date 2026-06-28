import { createFileRoute } from '@tanstack/react-router'
import { CatalogoRrhhView } from '../../../features/recursos-humanos/views/CatalogoRrhhView'

export const Route = createFileRoute('/_admin/recursos-humanos/especialidades')({
    component: () => <CatalogoRrhhView section="especialidades" />,
})
