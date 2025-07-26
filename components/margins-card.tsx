"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, Wallet, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MarginData {
  enabled: boolean
  net: number
  available: {
    adhoc_margin: number
    cash: number
    opening_balance: number
    live_balance: number
    collateral: number
    intraday_payin: number
  }
  utilised: {
    debits: number
    exposure: number
    m2m_realised: number
    m2m_unrealised: number
    option_premium: number
    payout: number
    span: number
    holding_sales: number
    turnover: number
    liquid_collateral: number
    stock_collateral: number
    delivery: number
  }
}

interface MarginsData {
  equity?: MarginData
  commodity?: MarginData
}

export function MarginsCard() {
  const [margins, setMargins] = useState<MarginsData | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchMargins = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/margins")
      if (response.ok) {
        const data = await response.json()
        setMargins(data)
      } else if (response.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please login again to view margins",
          variant: "destructive",
        })
      } else {
        throw new Error("Failed to fetch margins")
      }
    } catch (error) {
      console.error("Error fetching margins:", error)
      toast({
        title: "Error",
        description: "Failed to fetch margin information",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMargins()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const renderMarginSegment = (segment: string, data: MarginData) => (
    <div key={segment} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold capitalize">{segment}</h3>
        <Badge variant={data.enabled ? "default" : "secondary"}>{data.enabled ? "Enabled" : "Disabled"}</Badge>
      </div>

      {data.enabled && (
        <>
          {/* Net Balance */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Net Available</span>
              </div>
              <span className="text-xl font-bold text-blue-600">{formatCurrency(data.net)}</span>
            </div>
          </div>

          {/* Available Funds */}
          <div>
            <h4 className="font-medium mb-3 text-green-700">Available Funds</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Cash</p>
                <p className="font-semibold">{formatCurrency(data.available.cash)}</p>
              </div>
              <div>
                <p className="text-gray-500">Opening Balance</p>
                <p className="font-semibold">{formatCurrency(data.available.opening_balance)}</p>
              </div>
              <div>
                <p className="text-gray-500">Live Balance</p>
                <p className="font-semibold">{formatCurrency(data.available.live_balance)}</p>
              </div>
              <div>
                <p className="text-gray-500">Collateral</p>
                <p className="font-semibold">{formatCurrency(data.available.collateral)}</p>
              </div>
              {data.available.intraday_payin > 0 && (
                <div>
                  <p className="text-gray-500">Intraday Payin</p>
                  <p className="font-semibold">{formatCurrency(data.available.intraday_payin)}</p>
                </div>
              )}
              {data.available.adhoc_margin > 0 && (
                <div>
                  <p className="text-gray-500">Adhoc Margin</p>
                  <p className="font-semibold">{formatCurrency(data.available.adhoc_margin)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Utilised Funds */}
          <div>
            <h4 className="font-medium mb-3 text-red-700">Utilised Funds</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Total Debits</p>
                <p className="font-semibold text-red-600">{formatCurrency(data.utilised.debits)}</p>
              </div>
              {data.utilised.span > 0 && (
                <div>
                  <p className="text-gray-500">SPAN Margin</p>
                  <p className="font-semibold">{formatCurrency(data.utilised.span)}</p>
                </div>
              )}
              {data.utilised.exposure > 0 && (
                <div>
                  <p className="text-gray-500">Exposure Margin</p>
                  <p className="font-semibold">{formatCurrency(data.utilised.exposure)}</p>
                </div>
              )}
              {data.utilised.m2m_realised !== 0 && (
                <div>
                  <p className="text-gray-500">Realised M2M</p>
                  <p className={`font-semibold ${data.utilised.m2m_realised >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(data.utilised.m2m_realised)}
                  </p>
                </div>
              )}
              {data.utilised.m2m_unrealised !== 0 && (
                <div>
                  <p className="text-gray-500">Unrealised M2M</p>
                  <p
                    className={`font-semibold ${data.utilised.m2m_unrealised >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatCurrency(data.utilised.m2m_unrealised)}
                  </p>
                </div>
              )}
              {data.utilised.option_premium > 0 && (
                <div>
                  <p className="text-gray-500">Option Premium</p>
                  <p className="font-semibold">{formatCurrency(data.utilised.option_premium)}</p>
                </div>
              )}
              {data.utilised.holding_sales > 0 && (
                <div>
                  <p className="text-gray-500">Holding Sales</p>
                  <p className="font-semibold">{formatCurrency(data.utilised.holding_sales)}</p>
                </div>
              )}
              {data.utilised.delivery > 0 && (
                <div>
                  <p className="text-gray-500">Delivery Margin</p>
                  <p className="font-semibold">{formatCurrency(data.utilised.delivery)}</p>
                </div>
              )}
              {data.utilised.liquid_collateral > 0 && (
                <div>
                  <p className="text-gray-500">Liquid Collateral</p>
                  <p className="font-semibold">{formatCurrency(data.utilised.liquid_collateral)}</p>
                </div>
              )}
              {data.utilised.stock_collateral > 0 && (
                <div>
                  <p className="text-gray-500">Stock Collateral</p>
                  <p className="font-semibold">{formatCurrency(data.utilised.stock_collateral)}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Funds & Margins</span>
            </CardTitle>
            <CardDescription>Your available funds and margin utilization</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchMargins} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !margins ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading margin information...</span>
          </div>
        ) : margins ? (
          <div className="space-y-8">
            {margins.equity && renderMarginSegment("equity", margins.equity)}
            {margins.equity && margins.commodity && <Separator />}
            {margins.commodity && renderMarginSegment("commodity", margins.commodity)}
          </div>
        ) : (
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Unable to load margin information</p>
            <Button variant="outline" onClick={fetchMargins} className="mt-4 bg-transparent">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
