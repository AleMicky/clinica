import { useState } from 'react'

export function useCrudModalState<T>() {
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<T | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const openCreate = () => {
        setEditing(null)
        setOpen(true)
    }

    const openEdit = (item: T) => {
        setEditing(item)
        setOpen(true)
    }

    const close = (isSaving = false) => {
        if (isSaving) return
        setOpen(false)
        setEditing(null)
    }

    return {
        open,
        editing,
        deletingId,
        setDeletingId,
        openCreate,
        openEdit,
        close,
    }
}
