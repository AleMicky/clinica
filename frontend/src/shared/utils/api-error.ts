import { AxiosError } from 'axios'
import type { ApiResponse } from '../types/api-response.types'

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const response = error.response?.data as ApiResponse<unknown> | undefined
    const status = error.response?.status

    if (status === 403) {
      return (
        response?.message ||
        'No tienes permisos para realizar esta acción.'
      )
    }

    return (
      response?.message ||
      'Ocurrió un error al procesar la solicitud.'
    )
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Ocurrió un error inesperado.'
}