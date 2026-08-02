"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, PieChartIcon, BarChart3, Activity, Calendar, Download, RefreshCw } from 'lucide-react'
import { Layout } from "./Layout"

const portfolioData = [
  { month: "Jan", value: 8400, growth: 2.1 },
  { month: "Feb", value: 9200, growth: 9.5 },
  { month: "Mar", value: 8800, growth: -4.3 },
  { month: "Apr", value: 10200, growth: 15.9 },
  { month: "May", value: 11800, growth: 15.7 },
  { month: "Jun", value: 12450, growth: 5.5 },
]

const allocationData = [
  { name: "Green Bonds", value: 45, color: "#10B981" },
  { name: "Real Estate", value: 30, color: "#3B82F6" },
  { name: "Tech Equity", value: 15, color: "#8B5CF6" },
  { name: "Commodities", value: 10, color: "#F59E0B" },
]

const performanceData = [
  { token: "GBB", return: 8.5, risk: "Low", allocation: 45 },
  { token: "REIT", return: 12.3, risk: "Medium", allocation: 30 },
  { token: "TECH", return: 15.7, risk: "High", allocation: 15 },
  { token: "GOLD", return: 6.2, risk: "Low", allocation: 10 },
]

const transactionData = [
  { date: "2024-01", volume: 15000, count: 12 },
  { date: "2024-02", volume: 18500, count: 15 },
  { date: "2024-03", volume: 22000, count: 18 },
  { date: "2024-04", volume: 19500, count: 14 },
  { date: "2024-05", volume: 25000, count: 20 },
  { date: "2024-06", volume: 28000, count: 22 },
]

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState("6M")
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
  }

  const exportData = () => {
    // Implement export functionality
    console.log("Exporting analytics data...")
  }

  return (
    <Layout>

    <div className="space-y-6 mt-[10%] m-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Analytics</h1>
          <p className="text-muted-foreground">Comprehensive analysis of your investment performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1M">1 Month</SelectItem>
              <SelectItem value="3M">3 Months</SelectItem>
              <SelectItem value="6M">6 Months</SelectItem>
              <SelectItem value="1Y">1 Year</SelectItem>
              <SelectItem value="ALL">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Return</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+18.2%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.42</div>
            <p className="text-xs text-muted-foreground">Risk-adjusted return</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volatility</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.8%</div>
            <p className="text-xs text-muted-foreground">30-day volatility</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-5.2%</div>
            <p className="text-xs text-muted-foreground">Peak to trough</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="transactions">Transaction Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Value Over Time</CardTitle>
                <CardDescription>Your portfolio performance for the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={portfolioData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Portfolio Value']} />
                    <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Growth Rate</CardTitle>
                <CardDescription>Month-over-month growth percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={portfolioData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'Growth Rate']} />
                    <Bar dataKey="growth" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Token Performance Comparison</CardTitle>
              <CardDescription>Individual token returns and risk metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.map((token) => (
                  <div key={token.token} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                        {token.token.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium">{token.token}</p>
                        <p className="text-sm text-muted-foreground">{token.allocation}% allocation</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge
                        variant="outline"
                        className={`${
                          token.risk === "Low"
                            ? "border-green-300 text-green-700"
                            : token.risk === "Medium"
                              ? "border-yellow-300 text-yellow-700"
                              : "border-red-300 text-red-700"
                        }`}
                      >
                        {token.risk} Risk
                      </Badge>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+{token.return}%</p>
                        <p className="text-sm text-muted-foreground">Annual Return</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
                <CardDescription>Current portfolio distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Allocation Details</CardTitle>
                <CardDescription>Breakdown by asset class</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allocationData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{item.value}%</p>
                        <p className="text-sm text-muted-foreground">
                          ${((item.value / 100) * 12450).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Risk Metrics</CardTitle>
                <CardDescription>Portfolio risk analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Value at Risk (95%)</span>
                    <span className="font-bold text-red-600">-$892</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Beta</span>
                    <span className="font-bold">0.85</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Alpha</span>
                    <span className="font-bold text-green-600">+2.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Information Ratio</span>
                    <span className="font-bold">1.12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tracking Error</span>
                    <span className="font-bold">4.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>Risk contribution by asset</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={performanceData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="token" type="category" />
                    <Tooltip />
                    <Bar dataKey="allocation" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Volume Analysis</CardTitle>
              <CardDescription>Monthly transaction volume and frequency</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={transactionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="volume" fill="#8884d8" />
                  <Line yAxisId="right" type="monotone" dataKey="count" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </Layout>

  )
}

export default AnalyticsPage
