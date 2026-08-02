import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Send, RadioReceiver as Receive, Clock, CheckCircle, XCircle, RefreshCw, Wallet, DollarSign, BarChart3, Activity } from 'lucide-react';
import { InvestorHolding, TransferRequest, InvestmentOrder } from '@/lib/investor';

const Portfolio = () => {
  const [selectedHolding, setSelectedHolding] = useState<string | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  // Mock data
  const holdings: InvestorHolding[] = [
    {
      tokenId: 'scr',
      symbol: 'SCR',
      name: 'Stellar Cash Reserve',
      quantity: 1250,
      currentPrice: 98.50,
      totalValue: 123125,
      purchasePrice: 100.00,
      gainLoss: -1875,
      gainLossPercentage: -1.5,
      lastUpdated: '2024-12-02T10:30:00Z',
      performance: { day: -0.2, week: 1.8, month: -1.5, year: 4.2 }
    },
    {
      tokenId: 'gbb',
      symbol: 'GBB',
      name: 'Green Brew Bond',
      quantity: 500,
      currentPrice: 102.75,
      totalValue: 51375,
      purchasePrice: 100.00,
      gainLoss: 1375,
      gainLossPercentage: 2.75,
      lastUpdated: '2024-12-02T10:30:00Z',
      performance: { day: 0.1, week: 0.8, month: 2.75, year: 8.1 }
    }
  ];

  const transferRequests: TransferRequest[] = [
    {
      id: 'tr-001',
      type: 'sent',
      tokenSymbol: 'SCR',
      tokenName: 'Stellar Cash Reserve',
      quantity: 100,
      fromAddress: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
      toAddress: '0x8d12A197cB00D4747a1fe03395095ce2A5CC6819',
      status: 'pending',
      requestDate: '2024-12-01T14:30:00Z'
    },
    {
      id: 'tr-002',
      type: 'received',
      tokenSymbol: 'GBB',
      tokenName: 'Green Brew Bond',
      quantity: 50,
      fromAddress: '0x23B987D96D37Fc8C6c8C3c9621bEb12f8B4182Bc',
      toAddress: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
      status: 'completed',
      requestDate: '2024-11-28T09:15:00Z',
      completedDate: '2024-11-29T11:20:00Z'
    }
  ];

  const orders: InvestmentOrder[] = [
    {
      id: 'ord-001',
      tokenSymbol: 'SCR',
      tokenName: 'Stellar Cash Reserve',
      quantity: 250,
      pricePerToken: 98.50,
      totalAmount: 24625,
      paymentMethod: 'USDT',
      status: 'minted',
      orderDate: '2024-11-25T16:45:00Z',
      confirmationDate: '2024-11-26T10:30:00Z',
      transactionHash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z'
    },
    {
      id: 'ord-002',
      tokenSymbol: 'GBB',
      tokenName: 'Green Brew Bond',
      quantity: 100,
      pricePerToken: 102.00,
      totalAmount: 10200,
      paymentMethod: 'USD',
      status: 'pending',
      orderDate: '2024-12-01T12:00:00Z'
    }
  ];

  const totalPortfolioValue = holdings.reduce((sum, holding) => sum + holding.totalValue, 0);
  const totalGainLoss = holdings.reduce((sum, holding) => sum + holding.gainLoss, 0);
  const totalGainLossPercentage = (totalGainLoss / (totalPortfolioValue - totalGainLoss)) * 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'minted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-surface text-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'minted':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'refunded':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Portfolio Dashboard</h1>
          <p className="text-text-secondary">Manage your security token investments and track performance</p>
        </motion.div>

        {/* Portfolio Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-background/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Total Portfolio Value</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${totalPortfolioValue.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Total Gain/Loss</p>
                  <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${totalGainLoss >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {totalGainLoss >= 0 ? 
                    <TrendingUp className="h-6 w-6 text-green-600" /> : 
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Performance</p>
                  <p className={`text-2xl font-bold ${totalGainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalGainLossPercentage >= 0 ? '+' : ''}{totalGainLossPercentage.toFixed(2)}%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="holdings" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="holdings">Holdings</TabsTrigger>
              <TabsTrigger value="transfers">Transfer Requests</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>

            {/* Holdings Tab */}
            <TabsContent value="holdings" className="space-y-6">
              <div className="grid gap-6">
                {holdings.map((holding) => (
                  <Card key={holding.tokenId} className="bg-background/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                            {holding.symbol}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">{holding.name}</h3>
                            <p className="text-sm text-text-secondary">{holding.quantity} tokens</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-foreground">
                              ${holding.totalValue.toLocaleString()}
                            </p>
                            <div className="flex items-center space-x-1">
                              {holding.gainLoss >= 0 ? (
                                <ArrowUpRight className="h-4 w-4 text-green-600" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4 text-red-600" />
                              )}
                              <span className={`text-sm font-medium ${
                                holding.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {holding.gainLoss >= 0 ? '+' : ''}${holding.gainLoss.toLocaleString()} 
                                ({holding.gainLossPercentage >= 0 ? '+' : ''}{holding.gainLossPercentage.toFixed(2)}%)
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedHolding(selectedHolding === holding.tokenId ? null : holding.tokenId)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            onClick={() => {/* Handle invest */}}
                          >
                            Invest More
                          </Button>
                        </div>
                      </div>

                      {selectedHolding === holding.tokenId && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-border pt-4 mt-4"
                        >
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div>
                              <p className="text-sm text-text-secondary">Current Price</p>
                              <p className="text-lg font-semibold">${holding.currentPrice}</p>
                            </div>
                            <div>
                              <p className="text-sm text-text-secondary">Purchase Price</p>
                              <p className="text-lg font-semibold">${holding.purchasePrice}</p>
                            </div>
                            <div>
                              <p className="text-sm text-text-secondary">24h Change</p>
                              <p className={`text-lg font-semibold ${
                                holding.performance.day >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {holding.performance.day >= 0 ? '+' : ''}{holding.performance.day.toFixed(2)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-text-secondary">1Y Performance</p>
                              <p className={`text-lg font-semibold ${
                                holding.performance.year >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {holding.performance.year >= 0 ? '+' : ''}{holding.performance.year.toFixed(2)}%
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <h4 className="font-semibold text-foreground">Invest More</h4>
                              <div className="space-y-3">
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select payment method" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="USDT">USDT</SelectItem>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="ETH">ETH</SelectItem>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input
                                  type="number"
                                  placeholder="Enter amount"
                                  value={investmentAmount}
                                  onChange={(e) => setInvestmentAmount(e.target.value)}
                                />
                                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  Confirm Investment
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h4 className="font-semibold text-foreground">Performance Chart</h4>
                              <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                                <Activity className="h-8 w-8 text-blue-600" />
                                <span className="ml-2 text-blue-600">Performance visualization</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Transfer Requests Tab */}
            <TabsContent value="transfers" className="space-y-6">
              <Card className="bg-background/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Transfer Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transferRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${
                            request.type === 'sent' ? 'bg-red-100' : 'bg-green-100'
                          }`}>
                            {request.type === 'sent' ? 
                              <Send className="h-4 w-4 text-red-600" /> : 
                              <Receive className="h-4 w-4 text-green-600" />
                            }
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {request.type === 'sent' ? 'Sent' : 'Received'} {request.quantity} {request.tokenSymbol}
                            </p>
                            <p className="text-sm text-text-secondary">{request.tokenName}</p>
                            <p className="text-xs text-slate-500">
                              {request.type === 'sent' ? 'To: ' : 'From: '}
                              {request.type === 'sent' ? 
                                `${request.toAddress.slice(0, 6)}...${request.toAddress.slice(-4)}` :
                                `${request.fromAddress.slice(0, 6)}...${request.fromAddress.slice(-4)}`
                              }
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(request.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(request.status)}
                              <span className="capitalize">{request.status}</span>
                            </div>
                          </Badge>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(request.requestDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="space-y-6">
              <Card className="bg-background/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Transaction History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-slate-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Transaction history will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <Card className="bg-background/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Investment Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                            {order.tokenSymbol}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {order.quantity} {order.tokenSymbol} tokens
                            </p>
                            <p className="text-sm text-text-secondary">{order.tokenName}</p>
                            <p className="text-xs text-slate-500">
                              ${order.pricePerToken} per token • Total: ${order.totalAmount.toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-500">
                              Payment: {order.paymentMethod}
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge className={getStatusColor(order.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(order.status)}
                              <span className="capitalize">{order.status}</span>
                            </div>
                          </Badge>
                          <p className="text-xs text-slate-500">
                            {new Date(order.orderDate).toLocaleDateString()}
                          </p>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            {order.status === 'pending' && (
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Portfolio;