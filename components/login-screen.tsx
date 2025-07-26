"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, Shield, Zap, BarChart3, AlertCircle } from "lucide-react"

interface LoginScreenProps {
  onLogin: () => void
  error?: string
}

export function LoginScreen({ onLogin, error }: LoginScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-600 p-3 rounded-2xl">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">KiteConnect Pro</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your modern investment dashboard powered by Zerodha Kite Connect API
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Features Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Trade with Confidence</h2>
              <p className="text-lg text-gray-600 mb-8">
                Access your Zerodha account with advanced portfolio management, real-time data, and intuitive analytics.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Secure Authentication</h3>
                  <p className="text-gray-600">
                    OAuth 2.0 integration with Zerodha ensures your data is always protected
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Portfolio Analytics</h3>
                  <p className="text-gray-600">
                    Comprehensive insights into your holdings, P&L, and performance metrics
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Real-time Updates</h3>
                  <p className="text-gray-600">Live market data and instant portfolio updates for informed decisions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                <CardDescription className="text-base">Connect your Zerodha account to get started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <Button
                    onClick={onLogin}
                    className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <img src="/placeholder.svg?height=24&width=24" alt="Zerodha" className="w-6 h-6 mr-3" />
                    Login with Zerodha
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-500">Secure login powered by Kite Connect 3.0</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-xs text-gray-500 space-y-2">
                    <p>• Your credentials are never stored on our servers</p>
                    <p>• All data is encrypted and transmitted securely</p>
                    <p>• You can revoke access anytime from your Zerodha console</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t">
          <p className="text-gray-500">Built with Kite Connect API • Not affiliated with Zerodha</p>
        </div>
      </div>
    </div>
  )
}
