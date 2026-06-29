import { useEffect, useRef } from 'react'
import {
    useQuery,
    type UseQueryOptions,
    type QueryKey,
} from '@tanstack/react-query'

import { notify } from '../utils/notify'
import { getApiErrorMessage } from '../utils/api-error'

export function useAppQuery<
    TQueryFnData,
    TError = Error,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
>(
    options: UseQueryOptions<
        TQueryFnData,
        TError,
        TData,
        TQueryKey
    >,
) {
    const notifiedErrorRef = useRef<unknown>(null)

    const result = useQuery({
        retry: false,
        ...options,
    })

    useEffect(() => {
        if (!result.error || result.error === notifiedErrorRef.current) return

        notifiedErrorRef.current = result.error
        notify.error('Error', getApiErrorMessage(result.error))
    }, [result.error])

    return result
}