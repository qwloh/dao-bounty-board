import React, { useMemo } from 'react';
import { useQuery } from 'react-query';

import { queryClient } from '../queryClient';
import { querykeys } from './queryKeys';

interface LoadingData {
  visible: boolean
  text: string
}

export const useLoading = () => {
  const defaultValues = {
    visible: false,
    text: 'Loading...',
  } as LoadingData
  const { data, ...rest } = useQuery<LoadingData>(
    querykeys.loading(),
    async () => {
      return defaultValues
    },
    {
      cacheTime: Infinity,
      staleTime: Infinity,
    },
  )
  const isNotLoading = () => queryClient.invalidateQueries(querykeys.loading())
  const isLoading = (str?: string) =>
    queryClient.setQueryData(querykeys.loading(), {
      visible: true,
      text: str || defaultValues.text,
    })

  const loadingState = useMemo(() => data || defaultValues, [
    JSON.stringify(data || defaultValues),
  ])

  return useMemo(
    () => ({
      loading: loadingState?.visible,
      text: loadingState?.text,
      isLoading,
      isNotLoading,
    }),
    [JSON.stringify(loadingState)],
  )
}
