'use client'

import { useEffect, useRef, useCallback } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileOptions) => string
      remove: (widgetId: string) => void
      reset: (widgetId: string) => void
    }
    onloadTurnstileCallback?: () => void
  }
}

interface TurnstileOptions {
  sitekey: string
  callback?: (token: string) => void
  'error-callback'?: () => void
  'expired-callback'?: () => void
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
}

interface TurnstileProps {
  onVerify: (token: string) => void
  onError?: () => void
  onExpire?: () => void
  className?: string
}

export function Turnstile({ onVerify, onError, onExpire, className }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const scriptLoadedRef = useRef(false)

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile) return

    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current)
    }

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    if (!siteKey) {
      console.error('Turnstile site key not configured')
      return
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
      'error-callback': onError,
      'expired-callback': onExpire,
      theme: 'light',
      size: 'normal',
    })
  }, [onVerify, onError, onExpire])

  useEffect(() => {
    if (!scriptLoadedRef.current && !document.getElementById('turnstile-script')) {
      const script = document.createElement('script')
      script.id = 'turnstile-script'
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback'
      script.async = true
      script.defer = true

      window.onloadTurnstileCallback = () => {
        scriptLoadedRef.current = true
        renderWidget()
      }

      document.head.appendChild(script)
    } else if (window.turnstile) {
      renderWidget()
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
      }
    }
  }, [renderWidget])

  return (
    <div
      ref={containerRef}
      className={className}
      data-testid="turnstile-widget"
    />
  )
}

export function useTurnstile() {
  const tokenRef = useRef<string | null>(null)

  const handleVerify = useCallback((token: string) => {
    tokenRef.current = token
  }, [])

  const handleExpire = useCallback(() => {
    tokenRef.current = null
  }, [])

  const handleError = useCallback(() => {
    tokenRef.current = null
  }, [])

  const getToken = useCallback(() => tokenRef.current, [])
  const isVerified = useCallback(() => tokenRef.current !== null, [])

  return {
    handleVerify,
    handleExpire,
    handleError,
    getToken,
    isVerified,
  }
}