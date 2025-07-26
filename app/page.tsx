"use client"

import { useState, useEffect } from "react"
import { LoginScreen } from "@/components/login-screen"
import { Dashboard } from "@/components/dashboard"
import { LoadingScreen } from "@/components/loading-screen"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  user_id: string
  user_name?: string
  email?: string
  broker?: string
  exchanges?: string[]
  products?: string[]
  order_types?: string[]
}

interface Holding {
  tradingsymbol: string
  exchange: string
  instrument_token: number
  quantity: number
  average_price: number
  last_price?: number
  pnl?: number
  product?: string
  t1_quantity?: number
  realised_quantity?: number
  authorised_quantity?: number
  authorised_date?: string
  opening_quantity?: number
  collateral_quantity?: number
  collateral_type?: string
}

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { toast } = useToast()

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        // Auto-fetch holdings if user is authenticated
        await fetchHoldings()
      } else if (response.status === 401) {
        // Not authenticated
        setProfile(null)
      } else {
        throw new Error("Failed to fetch profile")
      }
    } catch (err) {
      console.error("Auth check error:", err)
      setError(err instanceof Error ? err.message : "Authentication check failed")
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = () => {
    setLoading(true)
    window.location.href = "/api/login"
  }

  const fetchHoldings = async () => {
    try {
      const response = await fetch("/api/holdings")
      if (response.ok) {
        const data = await response.json()
        setHoldings(Array.isArray(data) ? data : [])
      } else {
        throw new Error("Failed to fetch holdings")
      }
    } catch (err) {
      console.error("Holdings fetch error:", err)
      toast({
        title: "Error",
        description: "Failed to fetch holdings",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/logout", { method: "POST" })

      if (response.ok) {
        setProfile(null)
        setHoldings([])
        toast({
          title: "Success",
          description: "Logged out successfully",
        })
      } else {
        throw new Error("Logout failed")
      }
    } catch (err) {
      console.error("Logout error:", err)
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    await checkAuthStatus()
    toast({
      title: "Success",
      description: "Data refreshed successfully",
    })
  }

  if (loading && !profile) {
    return <LoadingScreen />
  }

  if (!profile) {
    return <LoginScreen onLogin={handleLogin} error={error} />
  }

  return (
    <Dashboard
      profile={profile}
      holdings={holdings}
      onLogout={handleLogout}
      onRefresh={refreshData}
      loading={loading}
    />
  )
}
