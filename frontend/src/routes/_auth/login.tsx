import { createFileRoute } from '@tanstack/react-router'
import { LoginView } from '../../features/auth/views/LoginView'

export const Route = createFileRoute('/_auth/login')({
    component: LoginView,
})