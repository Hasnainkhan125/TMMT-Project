import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Globe, 
  Building2, 
  FileText, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  MapPin,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  Award,
  Flag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// UAE Government Statistics Data
const uaeStats = {
  population: {
    total: '11.35 million',
    male: '7.24 million (63.8%)',
    female: '4.11 million (36.2%)',
    expatriate: '10.04 million (88.5%)',
    emirati: '1.31 million (11.5%)',
  },
  visaProcessing: {
    averageTime: '24-72 hours',
    successRate: '98%',
    applicationsPerYear: '2.5+ million',
    processingCenters: '25+',
  }
};

const UAEStatisticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl flex items-center justify-center">
            <Flag className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              UAE Government Statistics
            </h1>
            <p className="text-xl text-text-secondary">
              Official Ministry of Interior Data Dashboard
            </p>
          </div>
        </div>
      </motion.div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">{uaeStats.population.total}</h3>
            <p className="text-sm font-medium text-foreground mb-1">Total Population</p>
            <p className="text-xs text-gray-500">UAE Residents & Citizens</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">{uaeStats.population.expatriate}</h3>
            <p className="text-sm font-medium text-foreground mb-1">Expatriate Population</p>
            <p className="text-xs text-gray-500">International Residents</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">{uaeStats.population.emirati}</h3>
            <p className="text-sm font-medium text-foreground mb-1">Emirati Citizens</p>
            <p className="text-xs text-gray-500">UAE Nationals</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">{uaeStats.visaProcessing.applicationsPerYear}</h3>
            <p className="text-sm font-medium text-foreground mb-1">Visa Applications</p>
            <p className="text-xs text-gray-500">Processed Annually</p>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="pt-8 pb-8 text-center">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">
            Official Government Services
          </h3>
          <p className="text-blue-700 text-lg mb-6">
            Access secure, efficient, and professional visa services
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4 rounded-xl">
            <FileText className="w-5 h-5 mr-2" />
            Apply for Visa
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UAEStatisticsDashboard;
