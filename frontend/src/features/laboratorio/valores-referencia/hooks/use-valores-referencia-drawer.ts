import { useState } from 'react'

import { useCrudModalState } from '../../../../shared/hooks/use-crud-modal-state'
import type { Parametro } from '../../parametros/types/parametro.types'
import type { ValorReferenciaFormValues } from '../schemas/valor-referencia.schema'
import type { ValorReferencia } from '../types/valor-referencia.types'
import {
    useCreateValorReferencia,
    useDeleteValorReferencia,
    useUpdateValorReferencia,
    useValoresReferencia,
} from './valores-referencia.hooks'

export function useValoresReferenciaDrawer() {
    const [parametro, setParametro] = useState<Parametro | null>(null)
    const modal = useCrudModalState<ValorReferencia>()

    const { data, isFetching } = useValoresReferencia(
        {
            page: 1,
            pageSize: 100,
            parametroId: parametro?.id,
        },
        Boolean(parametro),
    )

    const createMutation = useCreateValorReferencia()
    const updateMutation = useUpdateValorReferencia()
    const deleteMutation = useDeleteValorReferencia()

    const isSaving = createMutation.isPending || updateMutation.isPending
    const items = data?.items ?? []

    const open = (selected: Parametro) => {
        setParametro(selected)
    }

    const close = () => {
        if (isSaving) return
        setParametro(null)
        modal.close()
    }

    const handleSubmit = async (values: ValorReferenciaFormValues) => {
        if (!parametro) return

        const payload = {
            parametroId: parametro.id,
            sexo: values.sexo || null,
            edadMin: values.edadMin ?? null,
            edadMax: values.edadMax ?? null,
            valorMin: values.valorMin ?? null,
            valorMax: values.valorMax ?? null,
            valorTexto: values.valorTexto || null,
            activo: values.activo,
        }

        if (modal.editing) {
            await updateMutation.mutateAsync({
                id: modal.editing.id,
                data: payload,
            })
        } else {
            await createMutation.mutateAsync(payload)
        }
        modal.close()
    }

    const handleDelete = async (item: ValorReferencia) => {
        modal.setDeletingId(item.id)
        try {
            await deleteMutation.mutateAsync(item.id)
        } finally {
            modal.setDeletingId(null)
        }
    }

    return {
        open: Boolean(parametro),
        parametro,
        loading: isFetching,
        items,
        openDrawer: open,
        closeDrawer: close,
        table: {
            onEdit: modal.openEdit,
            onDelete: handleDelete,
            deletingId: modal.deletingId,
        },
        formModal: {
            open: modal.open,
            entity: modal.editing,
            isSaving,
            openCreateModal: modal.openCreate,
            closeModal: () => modal.close(isSaving),
            handleSubmit,
        },
    }
}
