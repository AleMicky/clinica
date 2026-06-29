import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Form, Modal } from 'antd'

import { PersonaFormFields } from './PersonaFormFields'
import {
    personaDefaultValues,
    personaSchema,
    type PersonaFormValues,
} from '../schemas/persona.schema'
import type { Persona } from '../types/persona.types'

type PersonaFormModalProps = {
    open: boolean
    persona: Persona | null
    loading: boolean
    title?: string
    onClose: () => void
    onSubmit: (values: PersonaFormValues) => Promise<void>
}

export function PersonaFormModal({
    open,
    persona,
    loading,
    title,
    onClose,
    onSubmit,
}: PersonaFormModalProps) {
    const isEditing = persona !== null

    const form = useForm({
        defaultValues: personaDefaultValues,
        validators: {
            onSubmit: personaSchema,
        },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    useEffect(() => {
        if (!open) return

        form.reset()

        if (persona) {
            form.setFieldValue('tipoDocumentoId', persona.tipoDocumentoId)
            form.setFieldValue('numeroDocumento', persona.numeroDocumento)
            form.setFieldValue('extensionDocumentoId', persona.extensionDocumentoId ?? '')
            form.setFieldValue('complementoDocumento', persona.complementoDocumento ?? '')
            form.setFieldValue('nombres', persona.nombres)
            form.setFieldValue('apellidoPaterno', persona.apellidoPaterno)
            form.setFieldValue('apellidoMaterno', persona.apellidoMaterno)
            form.setFieldValue('fechaNacimiento', persona.fechaNacimiento)
            form.setFieldValue('sexoId', persona.sexoId)
            form.setFieldValue('estadoCivilId', persona.estadoCivilId)
            form.setFieldValue('telefono', persona.telefono)
            form.setFieldValue('direccion', persona.direccion)
        }
    }, [open, persona, form])

    const handleClose = () => {
        if (loading) return
        onClose()
    }

    return (
        <Modal
            title={title ?? (isEditing ? 'Editar persona' : 'Nueva persona')}
            open={open}
            onCancel={handleClose}
            onOk={() => void form.handleSubmit()}
            okText={isEditing ? 'Guardar' : 'Registrar'}
            cancelText="Cancelar"
            confirmLoading={loading}
            destroyOnHidden
            width={720}
            className="rrhh-form-modal"
        >
            <Form layout="vertical" requiredMark={false} size="small">
                <PersonaFormFields form={form} loading={loading} />
            </Form>
        </Modal>
    )
}
