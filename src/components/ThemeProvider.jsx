import React, { useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'

export function ThemeProvider({ children }) {
  const { effectiveTheme } = useTheme()

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(effectiveTheme)
  }, [effectiveTheme])

  return <>{children}</>
}
