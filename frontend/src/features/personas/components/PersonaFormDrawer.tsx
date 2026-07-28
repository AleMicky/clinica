import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Button, Drawer, Flex, Form, Grid, Typography } from 'antd'

import { PersonaFormFields } from './PersonaFormFields'
import {
    personaDefaultValues,
    personaSchema,
    type PersonaFormValues,
} from '../schemas/persona.schema'
import type { Persona } from '../types/persona.types'

const { Text } = Typography
const { useBreakpoint } = Grid

type PersonaFormDrawerProps = {
    open: boolean
    persona: Persona | null
    loading: boolean
    onClose: () => void
    onSubmit: (values: PersonaFormValues) => Promise<void>
}

export function PersonaFormDrawer({
    open,
    persona,
    loading,
    onClose,
    onSubmit,
}: PersonaFormDrawerProps) {
    const screens = useBreakpoint()
    const drawerWidth = screens.md ? 640 : '95%'

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
        if (!open || !persona) return

        form.reset()
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
    }, [open, persona, form])

    const handleClose = () => {
        if (loading) return
        onClose()
    }

    return (
        <Drawer
            title={persona ? `Editar persona · ${persona.nombreCompleto}` : 'Editar persona'}
            open={open}
            onClose={handleClose}
            width={drawerWidth}
            destroyOnHidden
            className="usuario-drawer"
            footer={
                <Flex justify="flex-end" gap={8} className="usuario-drawer__footer">
                    <Button onClick={handleClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        type="primary"
                        loading={loading}
                        onClick={() => void form.handleSubmit()}
                    >
                        Guardar
                    </Button>
                </Flex>
            }
        >
            <Form
                layout="vertical"
                requiredMark
                size="small"
                className="usuario-drawer__form usuario-drawer__form--compact"
            >
                <Text type="secondary" className="usuario-drawer__required-hint">
                    Los campos marcados con <Text type="danger">*</Text> son obligatorios.
                </Text>
                <PersonaFormFields form={form} loading={loading} variant="sections" />
            </Form>
        </Drawer>
    )
}
