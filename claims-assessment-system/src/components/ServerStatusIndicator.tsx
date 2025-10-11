'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react'

interface ServerStatusIndicatorProps {
  apiUrl?: string
  className?: string
}

export default function ServerStatusIndicator({ 
  apiUrl = 'http://localhost:8000', 
  className = '' 
}: ServerStatusIndicatorProps) {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkServerStatus = async () => {
    try {
      setStatus('checking')
      const response = await fetch(`${apiUrl}/docs`, { 
        method: 'HEAD',
        mode: 'no-cors' // This will help avoid CORS issues for basic connectivity check
      })
      setStatus('connected')
      setLastChecked(new Date())
    } catch (error) {
      setStatus('disconnected')
      setLastChecked(new Date())
    }
  }

  useEffect(() => {
    checkServerStatus()
    const interval = setInterval(checkServerStatus, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [apiUrl])

  const getStatusInfo = () => {
    switch (status) {
      case 'checking':
        return {
          icon: Wifi,
          color: 'text-yellow-600 bg-yellow-100',
          text: 'Checking...',
          dot: 'bg-yellow-500'
        }
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-600 bg-green-100',
          text: 'AI Server Connected',
          dot: 'bg-green-500'
        }
      case 'disconnected':
        return {
          icon: WifiOff,
          color: 'text-red-600 bg-red-100',
          text: 'AI Server Offline',
          dot: 'bg-red-500'
        }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <div className={`inline-flex items-center px-3 py-2 rounded-lg ${statusInfo.color} ${className}`}>
      <StatusIcon className="h-4 w-4 mr-2" />
      <span className="text-sm font-medium">{statusInfo.text}</span>
      <div className={`w-2 h-2 rounded-full ml-2 ${statusInfo.dot} ${status === 'checking' ? 'animate-pulse' : ''}`}></div>
      
      {lastChecked && (
        <span className="text-xs ml-2 opacity-75">
          {lastChecked.toLocaleTimeString()}
        </span>
      )}
    </div>
  )
}
