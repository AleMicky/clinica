import { Button, Drawer, Flex, Form, Grid, Steps } from 'antd'

import { PersonaFormFields } from '../../personas/components/PersonaFormFields'
import { CREATE_STEPS } from '../constants/user-form.constants'
import { useUserCreateForm } from '../hooks/use-user-create-form'
import type { CreateUsuarioPersonaFormValues } from '../schemas/usuario-persona.schema'
import { UserAccesoFields } from './UserAccesoFields'
import { UserCreateSummary } from './UserCreateSummary'

const { useBreakpoint } = Grid

type UserCreateDrawerProps = {
    open: boolean
    roleOptions: string[]
    loading: boolean
    onClose: () => void
    onCreate: (values: CreateUsuarioPersonaFormValues) => Promise<void>
}

export function UserCreateDrawer({
    open,
    roleOptions,
    loading,
    onClose,
    onCreate,
}: UserCreateDrawerProps) {
    const screens = useBreakpoint()
    const drawerWidth = screens.md ? 640 : '95%'

    const {
        form,
        values,
        currentStep,
        isLastStep,
        checkingUserName,
        handleNextStep,
        handlePrevStep,
        handleSubmit,
        markUserNameManual,
        resetUserNameManual,
    } = useUserCreateForm({ open, onCreate })

    const handleClose = () => {
        if (loading || checkingUserName) return
        onClose()
    }

    const isBusy = loading || checkingUserName

    return (
        <Drawer
            title="Nuevo usuario"
            open={open}
            onClose={handleClose}
            width={drawerWidth}
            destroyOnHidden
            className="usuario-drawer"
            footer={
                <Flex
                    justify="space-between"
                    align="center"
                    className="usuario-drawer__footer"
                >
                    <div>
                        {currentStep > 0 ? (
                            <Button onClick={handlePrevStep} disabled={isBusy}>
                                Anterior
                            </Button>
                        ) : null}
                    </div>
                    <Flex gap={8}>
                        <Button onClick={handleClose} disabled={isBusy}>
                            Cancelar
                        </Button>
                        {isLastStep ? (
                            <Button
                                type="primary"
                                loading={loading}
                                onClick={handleSubmit}
                            >
                                Crear
                            </Button>
                        ) : (
                            <Button
                                type="primary"
                                onClick={() => void handleNextStep()}
                                loading={checkingUserName}
                                disabled={loading}
                            >
                                Siguiente
                            </Button>
                        )}
                    </Flex>
                </Flex>
            }
        >
            <Steps
                current={currentStep}
                items={CREATE_STEPS}
                size="small"
                className="usuario-drawer__steps"
            />

            <Form
                layout="vertical"
                className="usuario-drawer__form usuario-drawer__form--compact"
                size="small"
            >
                {currentStep === 0 ? (
                    <div className="usuario-drawer__step">
                        <PersonaFormFields
                            form={form}
                            loading={isBusy}
                            variant="sections"
                        />
                    </div>
                ) : null}

                {currentStep === 1 ? (
                    <UserAccesoFields
                        form={form}
                        loading={isBusy}
                        roleOptions={roleOptions}
                        personaHint={{
                            numeroDocumento: values.numeroDocumento,
                            nombres: values.nombres,
                            apellidoPaterno: values.apellidoPaterno,
                        }}
                        onUserNameManualEdit={markUserNameManual}
                        onUserNameRegenerate={resetUserNameManual}
                    />
                ) : null}

                {currentStep === 2 ? <UserCreateSummary values={values} /> : null}
            </Form>
        </Drawer>
    )
}
