import { useState } from 'react'

import { useCrudModalState } from '../../../../shared/hooks/use-crud-modal-state'
import type { PruebaPrecioFormValues } from '../schemas/prueba-precio.schema'
import type { PruebaPrecio } from '../types/prueba-precio.types'
import type { Prueba } from '../types/prueba.types'
import {
    useCreatePruebaPrecio,
    useDeletePruebaPrecio,
    usePruebaPrecios,
    useUpdatePruebaPrecio,
} from './prueba-precios.hooks'

export function usePruebaPreciosDrawer() {
    const [prueba, setPrueba] = useState<Prueba | null>(null)
    const modal = useCrudModalState<PruebaPrecio>()

    const { data, isFetching } = usePruebaPrecios(
        {
            page: 1,
            pageSize: 100,
            pruebaId: prueba?.id,
        },
        Boolean(prueba),
    )

    const createMutation = useCreatePruebaPrecio()
    const updateMutation = useUpdatePruebaPrecio()
    const deleteMutation = useDeletePruebaPrecio()

    const isSaving = createMutation.isPending || updateMutation.isPending
    const items = data?.items ?? []

    const open = (selected: Prueba) => {
        setPrueba(selected)
    }

    const close = () => {
        if (isSaving) return
        setPrueba(null)
        modal.close()
    }

    const handleSubmit = async (values: PruebaPrecioFormValues) => {
        if (!prueba) return

        const payload = {
            pruebaId: prueba.id,
            importeFacturado: values.importeFacturado,
            costoLaboratorio: values.costoLaboratorio,
            costoDerivacion: values.costoDerivacion,
            fechaInicio: values.fechaInicio,
            fechaFin: values.fechaFin || null,
            motivoCambio: values.motivoCambio,
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

    const handleDelete = async (precio: PruebaPrecio) => {
        modal.setDeletingId(precio.id)
        try {
            await deleteMutation.mutateAsync(precio.id)
        } finally {
            modal.setDeletingId(null)
        }
    }

    return {
        open: Boolean(prueba),
        prueba,
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
