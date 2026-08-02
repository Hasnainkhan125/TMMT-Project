import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Building2, 
  Globe, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  Calendar,
  MapPin,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Shield,
  Star,
  Flag,
  Crown,
  Zap,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

// UAE Government Statistics Data
const UAE_STATISTICS = {
  population: {
    total: 10100000,
    nationals: 1200000,
    expatriates: 8900000,
    growthRate: 1.5,
    density: 121
  },
  demographics: {
    ageGroups: {
      '0-14': 14.2,
      '15-24': 11.8,
      '25-54': 67.3,
      '55-64': 4.8,
      '65+': 1.9
    },
    genderRatio: {
      male: 67.1,
      female: 32.9
    }
  },
  economy: {
    gdp: 507.5, // Billion USD
    gdpGrowth: 3.4,
    perCapita: 50000,
    unemployment: 2.8
  },
  immigration: {
    totalVisas: 8500000,
    newVisas: 1250000,
    renewals: 3200000,
    cancellations: 850000,
    processingTime: {
      average: 3.2, // days
      fastest: 1,
      slowest: 7
    }
  },
  services: {
    familyVisa: {
      total: 1250000,
      approved: 1180000,
      pending: 45000,
      rejected: 25000,
      processingTime: 2.8
    },
    employmentVisa: {
      total: 3200000,
      approved: 3050000,
      pending: 120000,
      rejected: 30000,
      processingTime: 3.5
    },
    goldenVisa: {
      total: 150000,
      approved: 145000,
      pending: 3000,
      rejected: 2000,
      processingTime: 4.2
    }
  },
  regions: {
    dubai: { population: 3500000, visas: 2800000 },
    abuDhabi: { population: 2800000, visas: 2200000 },
    sharjah: { population: 1800000, visas: 1400000 },
    ajman: { population: 500000, visas: 400000 },
    ummAlQuwain: { population: 300000, visas: 250000 },
    rasAlKhaimah: { population: 400000, visas: 320000 },
    fujairah: { population: 250000, visas: 200000 }
  }
};

// Recent Activity Data
const RECENT_ACTIVITIES = [
  {
    id: 1,
    type: 'visa_approved',
    title: 'Family Visa Approved',
    description: 'Ahmed Al Mansouri - Spouse Visa approved in 2.1 days',
    timestamp: '2 hours ago',
    status: 'success',
    icon: CheckCircle
  },
  {
    id: 2,
    type: 'document_uploaded',
    title: 'Documents Received',
    description: 'Sarah Johnson uploaded required documents for Employment Visa',
    timestamp: '4 hours ago',
    status: 'info',
    icon: FileText
  },
  {
    id: 3,
    type: 'application_submitted',
    title: 'New Application',
    description: 'Mohammed Al Rashid submitted Golden Visa application',
    timestamp: '6 hours ago',
    status: 'pending',
    icon: Clock
  },
  {
    id: 4,
    type: 'visa_renewed',
    title: 'Visa Renewed',
    description: 'Fatima Al Zaabi - Residence Visa renewed successfully',
    timestamp: '8 hours ago',
    status: 'success',
    icon: CheckCircle
  },
  {
    id: 5,
    type: 'document_verified',
    title: 'Documents Verified',
    description: 'Omar Al Suwaidi - All documents verified and approved',
    timestamp: '12 hours ago',
    status: 'success',
    icon: Shield
  }
];

// Performance Metrics
const PERFORMANCE_METRICS = {
  efficiency: {
    processingSpeed: 94.2,
    accuracy: 98.7,
    customerSatisfaction: 96.5,
    digitalAdoption: 89.3
  },
  targets: {
    processingSpeed: 95,
    accuracy: 99,
    customerSatisfaction: 97,
    digitalAdoption: 90
  }
};

const UAEStatisticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly');

  // Format numbers with UAE locale
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-AE').format(num);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate percentage change
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'info':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'warning':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      default:
        return 'text-text-secondary bg-surface border-border';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'info':
        return <FileText className="w-4 h-4" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 p-6 pt-[7%]">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Flag className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground font-display">
                UAE Government Statistics
              </h1>
              <p className="text-xl text-text-secondary">
                Ministry of Interior - Immigration & Citizenship Services
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Live Data
            </Badge>
            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date().toLocaleDateString('en-AE', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Button>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-l-4 border-l-blue-500 bg-background shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Total Population</p>
                    <p className="text-2xl font-bold text-foreground">{formatNumber(UAE_STATISTICS.population.total)}</p>
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      +{UAE_STATISTICS.population.growthRate}% this year
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-l-4 border-l-green-500 bg-background shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Active Visas</p>
                    <p className="text-2xl font-bold text-foreground">{formatNumber(UAE_STATISTICS.immigration.totalVisas)}</p>
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      {UAE_STATISTICS.immigration.processingTime.average} days avg
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-l-4 border-l-yellow-500 bg-background shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary">GDP (Billion)</p>
                    <p className="text-2xl font-bold text-foreground">${UAE_STATISTICS.economy.gdp}B</p>
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      +{UAE_STATISTICS.economy.gdpGrowth}% growth
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-l-4 border-l-purple-500 bg-background shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Service Rating</p>
                    <p className="text-2xl font-bold text-foreground">{PERFORMANCE_METRICS.efficiency.customerSatisfaction}%</p>
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      Excellent Service
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-background p-1 rounded-xl shadow-lg mb-8">
          <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
          <TabsTrigger value="immigration" className="rounded-lg">Immigration</TabsTrigger>
          <TabsTrigger value="demographics" className="rounded-lg">Demographics</TabsTrigger>
          <TabsTrigger value="performance" className="rounded-lg">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          {/* Population Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-background shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <Users className="w-6 h-6 text-blue-600" />
                  Population Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                        <span className="font-medium">UAE Nationals</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{formatNumber(UAE_STATISTICS.population.nationals)}</div>
                        <div className="text-sm text-blue-600">
                          {((UAE_STATISTICS.population.nationals / UAE_STATISTICS.population.total) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                        <span className="font-medium">Expatriates</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{formatNumber(UAE_STATISTICS.population.expatriates)}</div>
                        <div className="text-sm text-green-600">
                          {((UAE_STATISTICS.population.expatriates / UAE_STATISTICS.population.total) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto relative">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="2"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeDasharray={`${(UAE_STATISTICS.population.nationals / UAE_STATISTICS.population.total) * 100}, 100`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {((UAE_STATISTICS.population.nationals / UAE_STATISTICS.population.total) * 100).toFixed(1)}%
                            </div>
                            <div className="text-sm text-text-secondary">Nationals</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Regional Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-background shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <MapPin className="w-6 h-6 text-green-600" />
                  Regional Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(UAE_STATISTICS.regions).map(([region, data], index) => (
                    <motion.div
                      key={region}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className="p-4 border rounded-xl hover:shadow-md transition-all duration-200"
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold text-foreground capitalize">
                          {region.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatNumber(data.population)}
                        </div>
                        <div className="text-sm text-text-secondary">
                          {formatNumber(data.visas)} active visas
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-background shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <Activity className="w-6 h-6 text-purple-600" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {RECENT_ACTIVITIES.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className="flex items-center gap-4 p-4 border rounded-xl hover:bg-surface-light transition-all duration-200"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(activity.status).split(' ')[1]}`}>
                        {getStatusIcon(activity.status)}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{activity.title}</div>
                        <div className="text-sm text-text-secondary">{activity.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">{activity.timestamp}</div>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Immigration Tab */}
        <TabsContent value="immigration" className="space-y-8">
          {/* Visa Processing Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-background shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Visa Processing Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(UAE_STATISTICS.services).map(([service, data], index) => (
                    <motion.div
                      key={service}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                      className="p-6 border rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                      <div className="text-center mb-4">
                        <div className="text-lg font-bold text-foreground capitalize">
                          {service.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-3xl font-bold text-blue-600">
                          {formatNumber(data.total)}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">Approved</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-green-600">{formatNumber(data.approved)}</span>
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                              {((data.approved / data.total) * 100).toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">Pending</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-yellow-600">{formatNumber(data.pending)}</span>
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              {((data.pending / data.total) * 100).toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">Processing Time</span>
                          <span className="font-semibold text-blue-600">{data.processingTime} days</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Processing Efficiency */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-background shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <Target className="w-6 h-6 text-green-600" />
                  Processing Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Average Processing Time</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {UAE_STATISTICS.immigration.processingTime.average} days
                      </span>
                    </div>
                    <Progress 
                      value={((UAE_STATISTICS.immigration.processingTime.average / 7) * 100)} 
                      className="h-3"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1 day (Fastest)</span>
                      <span>7 days (Slowest)</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {UAE_STATISTICS.immigration.processingTime.fastest} day
                        </div>
                        <div className="text-sm text-blue-600">Fastest Processing</div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-xl">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {UAE_STATISTICS.immigration.processingTime.slowest} days
                        </div>
                        <div className="text-sm text-green-600">Maximum Processing Time</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="space-y-8">
          {/* Age Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-background shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                  Age Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(UAE_STATISTICS.demographics.ageGroups).map(([ageGroup, percentage], index) => (
                    <motion.div
                      key={ageGroup}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className="flex items-center gap-4"
                    >
                      <div className="w-20 text-sm font-medium text-foreground">{ageGroup} years</div>
                      <div className="flex-1">
                        <Progress value={percentage} className="h-3" />
                      </div>
                      <div className="w-16 text-right font-semibold text-foreground">{percentage}%</div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Gender Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-background shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <PieChart className="w-6 h-6 text-pink-600" />
                  Gender Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto relative mb-4">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          strokeDasharray={`${UAE_STATISTICS.demographics.genderRatio.male}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {UAE_STATISTICS.demographics.genderRatio.male}%
                          </div>
                          <div className="text-sm text-blue-600">Male</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto relative mb-4">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#ec4899"
                          strokeWidth="2"
                          strokeDasharray={`${UAE_STATISTICS.demographics.genderRatio.female}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-pink-600">
                            {UAE_STATISTICS.demographics.genderRatio.female}%
                          </div>
                          <div className="text-sm text-pink-600">Female</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-8">
          {/* Key Performance Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-background shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-foreground">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  Key Performance Indicators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(PERFORMANCE_METRICS.efficiency).map(([metric, value], index) => {
                    const target = PERFORMANCE_METRICS.targets[metric as keyof typeof PERFORMANCE_METRICS.targets];
                    const percentage = (value / target) * 100;
                    const isOnTarget = percentage >= 100;
                    
                    return (
                      <motion.div
                        key={metric}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                        className="p-6 border rounded-xl hover:shadow-lg transition-all duration-300"
                      >
                        <div className="text-center mb-4">
                          <div className="text-lg font-bold text-foreground capitalize">
                            {metric.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div className="text-3xl font-bold text-blue-600">
                            {value}%
                          </div>
                          <div className="text-sm text-text-secondary">
                            Target: {target}%
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-text-secondary">Progress</span>
                            <span className={`text-sm font-semibold ${isOnTarget ? 'text-green-600' : 'text-yellow-600'}`}>
                              {isOnTarget ? 'On Target' : 'Below Target'}
                            </span>
                          </div>
                          
                          <Progress value={Math.min(percentage, 100)} className="h-3" />
                          
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>0%</span>
                            <span>{target}%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Service Excellence */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground font-display">Service Excellence</h3>
                    <p className="text-text-secondary">UAE Government Commitment to Quality</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {PERFORMANCE_METRICS.efficiency.processingSpeed}%
                    </div>
                    <div className="text-sm text-text-secondary">Processing Speed</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {PERFORMANCE_METRICS.efficiency.accuracy}%
                    </div>
                    <div className="text-sm text-text-secondary">Accuracy Rate</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {PERFORMANCE_METRICS.efficiency.customerSatisfaction}%
                    </div>
                    <div className="text-sm text-text-secondary">Customer Satisfaction</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center text-gray-500"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-4 h-4" />
          <span className="text-sm">Official UAE Government Service</span>
        </div>
        <p className="text-xs">
          Data updated in real-time • Ministry of Interior • United Arab Emirates
        </p>
      </motion.div>
    </div>
  );
};

export default UAEStatisticsDashboard;
