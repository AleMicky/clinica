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
    return useQuery({
        retry: false,
        ...options,

        throwOnError: (error) => {
            notify.error('Error', getApiErrorMessage(error))

            return false
        },
    })
}