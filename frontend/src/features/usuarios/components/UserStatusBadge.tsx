import { memo } from 'react'

import { StatusBadge } from '../../../shared/components/ui/status-badge/StatusBadge'

type UserStatusBadgeProps = {
    activo: boolean
}

export const UserStatusBadge = memo(function UserStatusBadge({ activo }: UserStatusBadgeProps) {
    return <StatusBadge active={activo} />
})
