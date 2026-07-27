import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppRole } from '../../shared/constants/app-roles'
import { requireRoles } from '../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/compras')({
  beforeLoad: () => {
    requireRoles([AppRole.Admin])
  },
  component: () => <Outlet />,
})
