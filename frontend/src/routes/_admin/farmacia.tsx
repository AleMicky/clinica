import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppRole } from '../../shared/constants/app-roles'
import { requireRoles } from '../../shared/utils/auth-guards'

export const Route = createFileRoute('/_admin/farmacia')({
  beforeLoad: () => {
    requireRoles([AppRole.Admin, AppRole.Farmacia])
  },
  component: () => <Outlet />,
})
