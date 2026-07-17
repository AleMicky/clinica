import { memo } from 'react'
import { Modal, Typography } from 'antd'

import type { User } from '../types/user.types'

type DeleteUserModalProps = {
    user: User | null
    open: boolean
    loading?: boolean
    onCancel: () => void
    onConfirm: () => void
}

export const DeleteUserModal = memo(function DeleteUserModal({
    user,
    open,
    loading = false,
    onCancel,
    onConfirm,
}: DeleteUserModalProps) {
    return (
        <Modal
            title="Eliminar usuario"
            open={open}
            onCancel={onCancel}
            onOk={onConfirm}
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true, loading }}
            cancelButtonProps={{ disabled: loading }}
            destroyOnHidden
            centered
        >
            <Typography.Paragraph style={{ marginBottom: 0 }}>
                ¿Desea desactivar al usuario{' '}
                <Typography.Text strong>
                    {user ? `"${user.userName}"` : ''}
                </Typography.Text>
                ? Esta acción marcará la cuenta como inactiva.
            </Typography.Paragraph>
        </Modal>
    )
})
