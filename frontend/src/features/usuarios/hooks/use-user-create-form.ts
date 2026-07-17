import { useEffect, useState } from 'react'
import { useForm, useStore } from '@tanstack/react-form'

import {
    createUsuarioPersonaDefaultValues,
    createUsuarioPersonaSchema,
    type CreateUsuarioPersonaFormValues,
} from '../schemas/usuario-persona.schema'
import { CREATE_STEPS } from '../constants/user-form.constants'
import { usersService } from '../services/users.service'
import { applyFieldErrors } from '../utils/form-errors'
import { generateSuggestedUserName } from '../utils/user-credentials'
import {
    validateAccesoStep,
    validatePersonaStep,
} from '../utils/user-form.validation'

const USER_NAME_TAKEN_MESSAGE = 'Este usuario ya existe.'

function resolveUserName(values: CreateUsuarioPersonaFormValues) {
    return values.userName?.trim() || values.numeroDocumento?.trim() || ''
}

type UseUserCreateFormOptions = {
    open: boolean
    onCreate: (values: CreateUsuarioPersonaFormValues) => Promise<void>
}

export function useUserCreateForm({ open, onCreate }: UseUserCreateFormOptions) {
    const [currentStep, setCurrentStep] = useState(0)
    const [userNameManuallyEdited, setUserNameManuallyEdited] = useState(false)
    const [checkingUserName, setCheckingUserName] = useState(false)

    const form = useForm({
        defaultValues: createUsuarioPersonaDefaultValues,
        validators: {
            onSubmit: createUsuarioPersonaSchema,
        },
        onSubmit: async ({ value }) => {
            const userName = resolveUserName(value)
            const taken = await usersService.isUserNameTaken(userName)

            if (taken) {
                applyFieldErrors(form, { userName: USER_NAME_TAKEN_MESSAGE })
                setCurrentStep(1)
                return
            }

            await onCreate(value)
        },
    })

    const values = useStore(form.store, (state) => state.values)

    useEffect(() => {
        if (!open) return

        form.reset()
        setCurrentStep(0)
        setUserNameManuallyEdited(false)
        setCheckingUserName(false)
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

    const ensureUserNameIsUnique = async (candidate: string) => {
        setCheckingUserName(true)

        try {
            const taken = await usersService.isUserNameTaken(candidate)

            if (taken) {
                applyFieldErrors(form, { userName: USER_NAME_TAKEN_MESSAGE })
                return false
            }

            return true
        } finally {
            setCheckingUserName(false)
        }
    }

    const handleNextStep = async () => {
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

            const userName = resolveUserName(values)
            const isUnique = await ensureUserNameIsUnique(userName)
            if (!isUnique) return
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
        checkingUserName,
        handleNextStep,
        handlePrevStep,
        handleSubmit: () => void form.handleSubmit(),
        markUserNameManual: () => setUserNameManuallyEdited(true),
        resetUserNameManual: () => setUserNameManuallyEdited(false),
    }
}
