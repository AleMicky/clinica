
import { createFileRoute } from '@tanstack/react-router'
import { AuthLayout } from '../layouts/AuthLayout'
import { redirectIfAuthenticated } from '../shared/utils/auth-guards'

export const Route = createFileRoute('/_auth')({
  beforeLoad: () => {
    redirectIfAuthenticated()
  },
  component: AuthLayout,
})