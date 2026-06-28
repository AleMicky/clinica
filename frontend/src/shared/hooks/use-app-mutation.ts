import {
    useMutation,
    type UseMutationOptions,
  } from '@tanstack/react-query'
  
  export function useAppMutation<
    TData,
    TVariables = void,
  >(
    options: UseMutationOptions<
      TData,
      Error,
      TVariables
    >,
  ) {
    return useMutation(options)
  }