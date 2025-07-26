"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MarginsCard } from "@/components/margins-card"
import {
  TrendingUp,
  RefreshCw,
  LogOut,
  User,
  Wallet,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

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

interface DashboardProps {
  profile: UserProfile
  holdings: Holding[]
  onLogout: () => void
  onRefresh: () => void
  loading: boolean
}

export function Dashboard({ profile, holdings, onLogout, onRefresh, loading }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "holdings" | "margins" | "profile">("overview")

  // Calculate portfolio metrics
  const totalInvestment = holdings.reduce((sum, holding) => sum + holding.quantity * holding.average_price, 0)

  const currentValue = holdings.reduce(
    (sum, holding) => sum + holding.quantity * (holding.last_price || holding.average_price),
    0,
  )

  const totalPnL = currentValue - totalInvestment
  const pnlPercentage = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN").format(num)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">KiteConnect Pro</h1>
                <p className="text-sm text-gray-500">Welcome back, {profile.user_name || profile.user_id}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-white p-1 rounded-lg border w-fit">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("overview")}
            className="flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </Button>
          <Button
            variant={activeTab === "holdings" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("holdings")}
            className="flex items-center space-x-2"
          >
            <PieChart className="h-4 w-4" />
            <span>Holdings</span>
          </Button>
          <Button
            variant={activeTab === "margins" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("margins")}
            className="flex items-center space-x-2"
          >
            <Wallet className="h-4 w-4" />
            <span>Margins</span>
          </Button>
          <Button
            variant={activeTab === "profile" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("profile")}
            className="flex items-center space-x-2"
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Portfolio Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalInvestment)}</div>
                  <p className="text-xs text-muted-foreground">Across {holdings.length} holdings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(currentValue)}</div>
                  <p className="text-xs text-muted-foreground">Live market value</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
                  {totalPnL >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(totalPnL)}
                  </div>
                  <p className={`text-xs ${totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {pnlPercentage >= 0 ? "+" : ""}
                    {pnlPercentage.toFixed(2)}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Holdings</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{holdings.length}</div>
                  <p className="text-xs text-muted-foreground">Active positions</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Holdings */}
            <Card>
              <CardHeader>
                <CardTitle>Top Holdings</CardTitle>
                <CardDescription>Your largest positions by value</CardDescription>
              </CardHeader>
              <CardContent>
                {holdings.length > 0 ? (
                  <div className="space-y-4">
                    {holdings
                      .sort(
                        (a, b) =>
                          b.quantity * (b.last_price || b.average_price) -
                          a.quantity * (a.last_price || a.average_price),
                      )
                      .slice(0, 5)
                      .map((holding, index) => {
                        const currentValue = holding.quantity * (holding.last_price || holding.average_price)
                        const investedValue = holding.quantity * holding.average_price
                        const pnl = currentValue - investedValue
                        const pnlPercent = (pnl / investedValue) * 100

                        return (
                          <div
                            key={holding.instrument_token}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="bg-blue-100 p-2 rounded-lg">
                                <span className="text-sm font-bold text-blue-600">
                                  {holding.tradingsymbol.substring(0, 2)}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold">{holding.tradingsymbol}</p>
                                <p className="text-sm text-gray-500">
                                  {formatNumber(holding.quantity)} shares • {holding.exchange}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(currentValue)}</p>
                              <p className={`text-sm ${pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {pnl >= 0 ? "+" : ""}
                                {formatCurrency(pnl)} ({pnlPercent.toFixed(2)}%)
                              </p>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No holdings found</p>
                    <p className="text-sm text-gray-400">Your portfolio will appear here once you have positions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Holdings Tab */}
        {activeTab === "holdings" && (
          <Card>
            <CardHeader>
              <CardTitle>All Holdings</CardTitle>
              <CardDescription>Complete list of your current positions</CardDescription>
            </CardHeader>
            <CardContent>
              {holdings.length > 0 ? (
                <div className="space-y-4">
                  {holdings.map((holding) => {
                    const currentValue = holding.quantity * (holding.last_price || holding.average_price)
                    const investedValue = holding.quantity * holding.average_price
                    const pnl = currentValue - investedValue
                    const pnlPercent = (pnl / investedValue) * 100

                    return (
                      <div key={holding.instrument_token} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <span className="text-sm font-bold text-blue-600">
                                {holding.tradingsymbol.substring(0, 2)}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{holding.tradingsymbol}</h3>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{holding.exchange}</Badge>
                                {holding.product && <Badge variant="secondary">{holding.product}</Badge>}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{formatCurrency(currentValue)}</p>
                            <p className={`text-sm font-medium ${pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {pnl >= 0 ? "+" : ""}
                              {formatCurrency(pnl)} ({pnlPercent.toFixed(2)}%)
                            </p>
                          </div>
                        </div>

                        <Separator className="my-3" />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Quantity</p>
                            <p className="font-semibold">{formatNumber(holding.quantity)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Avg Price</p>
                            <p className="font-semibold">{formatCurrency(holding.average_price)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Current Price</p>
                            <p className="font-semibold">
                              {formatCurrency(holding.last_price || holding.average_price)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Invested</p>
                            <p className="font-semibold">{formatCurrency(investedValue)}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Holdings Found</h3>
                  <p className="text-gray-500 mb-4">You don't have any current positions in your portfolio.</p>
                  <Button variant="outline" onClick={onRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Holdings
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Margins Tab */}
        {activeTab === "margins" && <MarginsCard />}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your Zerodha account details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">User ID</p>
                      <p className="font-medium">{profile.user_id}</p>
                    </div>
                    {profile.user_name && (
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{profile.user_name}</p>
                      </div>
                    )}
                    {profile.email && (
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{profile.email}</p>
                      </div>
                    )}
                    {profile.broker && (
                      <div>
                        <p className="text-sm text-gray-500">Broker</p>
                        <p className="font-medium">{profile.broker}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Trading Permissions</h3>
                  <div className="space-y-3">
                    {profile.exchanges && profile.exchanges.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Exchanges</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.exchanges.map((exchange) => (
                            <Badge key={exchange} variant="outline">
                              {exchange}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {profile.products && profile.products.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Products</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.products.map((product) => (
                            <Badge key={product} variant="secondary">
                              {product}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {profile.order_types && profile.order_types.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Order Types</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.order_types.map((orderType) => (
                            <Badge key={orderType} variant="outline">
                              {orderType}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Security Information</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• Your session is secured with OAuth 2.0 authentication</p>
                  <p>• All API calls are encrypted and transmitted securely</p>
                  <p>• Access token expires at 6 AM daily (regulatory requirement)</p>
                  <p>• You can revoke access anytime from your Zerodha console</p>
                  <p>• No sensitive data is stored on our servers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
