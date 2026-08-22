import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Gift,
  CreditCard,
  Settings,
  User,
  Bell,
  Plus,
  TrendingUp,
  Award,
  Zap,
  Star,
  Crown,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApplications, type EnhancedVisaApplication } from '@/hooks/useApplications';
import { useAuth } from '@/contexts/AuthContext';
import StartApplicationDialog from '@/components/Applications/StartApplicationDialog';

const ApplicantPortfolio: React.FC = () => {
  const { user } = useAuth();
  const { applications, userDetails, stats, loading } = useApplications();
  const [activeTab, setActiveTab] = useState('applications');
  const [showStartApplication, setShowStartApplication] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<EnhancedVisaApplication | null>(null);

  // Calculate user level and rewards
  const totalApplications = stats.total || 0;
  const approvedApplications = stats.approved || 0;
  const userLevel = Math.min(5, Math.floor(approvedApplications / 3) + 1);
  const nextLevelProgress = ((approvedApplications % 3) / 3) * 100;
  const rewardPoints = approvedApplications * 50 + totalApplications * 10;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
      case 'under_review':
        return { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
      case 'docs_required':
        return { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
      default:
        return { icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-light to-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
       {/* Header with User Info and Rewards */}
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
>
  <div className="flex items-center gap-4">
    <div className="relative">
      <Avatar className="h-16 w-16 ring-2 ring-[#14235E]/20 dark:ring-white/20">
        <AvatarImage src={userDetails?.avatar} />
        <AvatarFallback className="bg-[#14235E] dark:bg-white text-white dark:text-[#14235E] text-xl font-bold">
          {userDetails?.firstName?.[0]}{userDetails?.lastName?.[0]}
        </AvatarFallback>
      </Avatar>
      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900" />
    </div>
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
        Welcome back, {userDetails?.firstName || user?.name || 'User'}!
      </h1>
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <Badge className="bg-[#14235E]/10 dark:bg-white/10 text-[#14235E] dark:text-white border-[#14235E]/20 dark:border-white/20">
          <Crown className="w-3 h-3 mr-1" />
          Level {userLevel} Member
        </Badge>
        <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-700">
          <Sparkles className="w-3 h-3 mr-1" />
          {rewardPoints} Points
        </Badge>
      </div>
    </div>
  </div>

  <div className="flex gap-2">
    <Button 
      variant="outline" 
      size="sm"
      className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl"
    >
      <Bell className="w-4 h-4 mr-2" />
      <span className="hidden sm:inline">Notifications</span>
    </Button>
    <Button 
      className="bg-[#14235E] dark:bg-white text-white dark:text-[#14235E] hover:bg-[#14235E]/90 dark:hover:bg-white/90 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
      onClick={() => setShowStartApplication(true)}
    >
      <Plus className="w-4 h-4 mr-2" />
      New Application
    </Button>
  </div>
</motion.div>

{/* Level Progress */}
{userLevel < 5 && (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
  >
    <Card className="border-[#14235E]/20 dark:border-white/10 bg-[#14235E]/5 dark:bg-white/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#14235E] dark:text-white" />
            <span className="font-medium text-gray-900 dark:text-white">Level Progress</span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {approvedApplications % 3}/3 applications to Level {userLevel + 1}
          </span>
        </div>
        <Progress 
          value={nextLevelProgress} 
          className="h-2 bg-gray-200 dark:bg-gray-700 [&>div]:bg-[#14235E] dark:[&>div]:bg-white" 
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Complete {3 - (approvedApplications % 3)} more application(s) to unlock Level {userLevel + 1} benefits!
        </p>
      </CardContent>
    </Card>
  </motion.div>
)}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-background border border-primary/30 p-1">
            <TabsTrigger value="applications" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <FileText className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Applications</span>
              <span className="sm:hidden">Apps</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <Eye className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Documents</span>
              <span className="sm:hidden">Docs</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <CreditCard className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Payments</span>
              <span className="sm:hidden">Pay</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-black">
              <User className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-primary/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary">Total</p>
                      <p className="text-2xl font-bold text-foreground">{stats.total || 0}</p>
                    </div>
                    <FileText className="w-8 h-8 text-primary opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700">In Progress</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.under_review || 0}</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700">Approved</p>
                      <p className="text-2xl font-bold text-green-900">{stats.approved || 0}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-700">Action Needed</p>
                      <p className="text-2xl font-bold text-orange-900">{stats.docs_required || 0}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-orange-600 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Applications List */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {applications.length === 0 ? (
                  <Card className="border-dashed border-2 border-primary/30">
                    <CardContent className="p-12 text-center">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-primary opacity-30" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No applications yet</h3>
                      <p className="text-text-secondary mb-4">Start your first visa application today!</p>
                      <Button className="bg-primary hover:bg-primary/90 text-black" onClick={() => setShowStartApplication(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Application
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  applications.map((app, index) => {
                    const config = getStatusConfig(app.status);
                    const StatusIcon = config.icon;
                    const hasResultDocs = (app as any).resultDocuments && (app as any).resultDocuments.length > 0;

                    return (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className={`border-2 ${config.border} ${config.bg} hover:shadow-lg transition-all cursor-pointer`}>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-start gap-3">
                                  <div className={`p-2 rounded-lg ${config.bg} border ${config.border}`}>
                                    <StatusIcon className={`w-5 h-5 ${config.color}`} />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h3 className="font-semibold text-foreground">
                                        {app.applicationType.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                      </h3>
                                      <Badge className={`${config.bg} ${config.color} border ${config.border}`}>
                                        {app.status.replace('_', ' ')}
                                      </Badge>
                                      {hasResultDocs && (
                                        <Badge className="bg-primary/10 text-primary border-primary/30">
                                          <Zap className="w-3 h-3 mr-1" />
                                          Results Available
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-sm text-text-secondary">
                                      <div className="flex items-center gap-1">
                                        <FileText className="w-3 h-3" />
                                        <span>{app.attachments?.length || 0} documents</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                                      </div>
                                      {hasResultDocs && (
                                        <div className="flex items-center gap-1">
                                          <CheckCircle className="w-3 h-3 text-green-600" />
                                          <span className="text-green-600">{(app as any).resultDocuments.length} result docs</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedApplication(app)}
                                  className="hover:bg-primary hover:text-black"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                                {hasResultDocs && (
                                  <Button
                                    size="sm"
                                    className="bg-primary hover:bg-primary/90 text-black"
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Results
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  All Documents
                </CardTitle>
                <CardDescription>
                  View and download all your uploaded documents and results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-text-secondary">No documents yet. Start an application to upload documents.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {applications.map((app) => (
                      <div key={app.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-foreground">
                            {app.applicationType.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </h4>
                          <Badge variant="outline">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </Badge>
                        </div>

                        {/* Submitted Documents */}
                        {app.attachments && app.attachments.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-text-secondary mb-2">Submitted Documents</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {app.attachments.map((doc: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-surface-light rounded-lg border border-border">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" />
                                    <span className="text-sm">{doc.filename || 'Document'}</span>
                                  </div>
                                  <Button variant="ghost" size="sm">
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Result Documents */}
                        {(app as any).resultDocuments && (app as any).resultDocuments.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Result Documents
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {(app as any).resultDocuments.map((doc: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <div>
                                      <p className="text-sm font-medium text-green-900">{doc.label || 'Result Document'}</p>
                                      <p className="text-xs text-green-700">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-900">
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Payment Methods
                  </CardTitle>
                  <CardDescription>Manage your payment methods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" size="lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Credit/Debit Card
                  </Button>
                  <p className="text-xs text-text-secondary">Securely save your cards for faster checkout</p>
                </CardContent>
              </Card>

              {/* Rewards */}
              <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <Gift className="w-5 h-5" />
                    Rewards & Discounts
                  </CardTitle>
                  <CardDescription className="text-amber-700">
                    You've earned {rewardPoints} reward points!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-amber-200">
                    <div>
                      <p className="font-semibold text-amber-900">5% Level Discount</p>
                      <p className="text-sm text-amber-700">On your next application</p>
                    </div>
                    <Star className="w-8 h-8 text-amber-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-amber-200">
                    <div>
                      <p className="font-semibold text-amber-900">{rewardPoints} Points</p>
                      <p className="text-sm text-amber-700">Redeem for discounts</p>
                    </div>
                    <Award className="w-8 h-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Track all your payments and invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-text-secondary">No payment history yet</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Profile Settings
                </CardTitle>
                <CardDescription>Manage your account and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile Details
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="w-4 h-4 mr-2" />
                  Notification Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Start Application Dialog */}
      {showStartApplication && (
        <StartApplicationDialog
          open={showStartApplication}
          onOpenChange={setShowStartApplication}
        />
      )}
    </div>
  );
};

export default ApplicantPortfolio;

