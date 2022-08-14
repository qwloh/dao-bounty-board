

import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query'
import { useLocalStorage } from './useLocalStorage(experimental)'
import { queryClient } from '../queryClient';
type ITheme = 'light' | 'dark'



export function useTheme () {
  const { data: theme } = useQuery<ITheme>(['theme'], () => {
    const value = localStorage.getItem('theme')
    return value ? JSON.parse(value)  as ITheme : 'dark'
  })

  return useMemo(() => ({
    theme,
    setTheme: (theme: ITheme) => {
      queryClient.setQueryData(['theme'], theme)
      localStorage.setItem('theme', JSON.stringify(theme))
    }
  }), [theme])
}