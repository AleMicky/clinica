import { useEffect, useState } from 'react'
import { useForm, useStore } from '@tanstack/react-form'

import {
    createUsuarioPersonaDefaultValues,
    createUsuarioPersonaSchema,
    type CreateUsuarioPersonaFormValues,
} from '../schemas/usuario-persona.schema'
import { CREATE_STEPS } from '../constants/user-form.constants'
import { applyFieldErrors } from '../utils/form-errors'
import { generateSuggestedUserName } from '../utils/user-credentials'
import {
    validateAccesoStep,
    validatePersonaStep,
} from '../utils/user-form.validation'

type UseUserCreateFormOptions = {
    open: boolean
    onCreate: (values: CreateUsuarioPersonaFormValues) => Promise<void>
}

export function useUserCreateForm({ open, onCreate }: UseUserCreateFormOptions) {
    const [currentStep, setCurrentStep] = useState(0)
    const [userNameManuallyEdited, setUserNameManuallyEdited] = useState(false)

    const form = useForm({
        defaultValues: createUsuarioPersonaDefaultValues,
        validators: {
            onSubmit: createUsuarioPersonaSchema,
        },
        onSubmit: async ({ value }) => {
            await onCreate(value)
        },
    })

    const values = useStore(form.store, (state) => state.values)

    useEffect(() => {
        if (!open) return

        form.reset()
        setCurrentStep(0)
        setUserNameManuallyEdited(false)
    }, [open, form])

    useEffect(() => {
        if (userNameManuallyEdited) return

        const suggested = generateSuggestedUserName({
            numeroDocumento: values.numeroDocumento,
            nombres: values.nombres,
            apellidoPaterno: values.apellidoPaterno,
        })

        if (suggested) {
            form.setFieldValue('userName', suggested)
        }
    }, [
        values.numeroDocumento,
        values.nombres,
        values.apellidoPaterno,
        userNameManuallyEdited,
        form,
    ])

    const handleNextStep = () => {
        if (currentStep === 0) {
            const result = validatePersonaStep(values)
            if (!result.valid) {
                applyFieldErrors(form, result.fieldErrors)
                return
            }
        }

        if (currentStep === 1) {
            const result = validateAccesoStep(values)
            if (!result.valid) {
                applyFieldErrors(form, result.fieldErrors)
                return
            }
        }

        setCurrentStep((prev) => Math.min(prev + 1, CREATE_STEPS.length - 1))
    }

    const handlePrevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0))
    }

    return {
        form,
        values,
        currentStep,
        isLastStep: currentStep >= CREATE_STEPS.length - 1,
        handleNextStep,
        handlePrevStep,
        handleSubmit: () => void form.handleSubmit(),
        markUserNameManual: () => setUserNameManuallyEdited(true),
        resetUserNameManual: () => setUserNameManuallyEdited(false),
    }
}
