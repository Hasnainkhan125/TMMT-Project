'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  FileText,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Crown,
  Sparkles,
  Zap,
  Phone,
  Mail,
  MessageSquare,
  HelpCircle,
  Building2,
  Shield,
  Heart,
  UserCheck,
  PieChart as PieChartIcon,
  User,
  History,
  Menu,
  X,
  ArrowUpRight,
  ArrowRight,
  LayoutDashboard,
  FolderOpen,
  LogOut,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users,
  BookOpen,
  BellRing,
  Search,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useApplications,
  type EnhancedVisaApplication,
} from '@/hooks/useApplications';
import { useAuth } from '@/contexts/AuthContext';
import StartApplicationDialog from '@/components/Applications/StartApplicationDialog';
import {
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import ExpandedApplicationCard from '@/components/ApplicationCard/ExpandedApplicationCard';
import LiveChatWidget from '@/components/LiveChat/LiveChatWidget';

// Import your existing components
import ProfilePage from './ProfilePage';
import DocumentPage from './DocumentPage';
import CompliancePage from './CompliancePage';

// Navigation Items with icons
const NAV_ITEMS = [
  { path: '/user/dashboard', label: 'Dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { path: '/user/documents', label: 'Documents', icon: FolderOpen, key: 'documents' },
  { path: '/investor/compliance', label: 'Compliance', icon: Shield, key: 'compliance' },
  { path: '/user/profile', label: 'Profile', icon: User, key: 'profile' },
];

const GOV_SERVICES = [
  {
    key: 'mohre',
    label: 'MOHRE',
    sub: 'Labour affairs',
    url: 'https://www.mohre.gov.ae',
    icon: Building2,
  },
  {
    key: 'gdrfa',
    label: 'GDRFA',
    sub: 'Residency & entry',
    url: 'https://www.gdrfad.gov.ae',
    icon: Shield,
  },
  {
    key: 'icp',
    label: 'ICP',
    sub: 'Identity & citizenship',
    url: 'https://smartservices.icp.gov.ae',
    icon: UserCheck,
  },
  {
    key: 'moh',
    label: 'MOH',
    sub: 'Health authority',
    url: 'https://www.moh.gov.ae',
    icon: Heart,
  },
];

type TabKey = 'dashboard' | 'documents' | 'compliance' | 'profile';

const AdvancedInvestorPortfolio = () => {
  const { t } = useTranslation();
  const { signOut, user } = useAuth();
  const { applications, userDetails, stats, loading, fetchApplications } =
    useApplications();
  const location = useLocation();
  const navigate = useNavigate();
  
  const getTabFromPath = (path: string): TabKey => {
    if (path.includes('/user/documents')) return 'documents';
    if (path.includes('/investor/compliance')) return 'compliance';
    if (path.includes('/user/profile')) return 'profile';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<TabKey>(getTabFromPath(location.pathname));
  const [showStartApplication, setShowStartApplication] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<EnhancedVisaApplication | null>(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [expandedApplicationIds, setExpandedApplicationIds] = useState<Set<string>>(new Set());
  const [checks, setChecks] = useState<any[]>([]);
  const [checksLoading, setChecksLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
  };

  useEffect(() => {
    const fetchChecks = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) { setChecksLoading(false); return; }
        const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
        const res = await fetch(`${base}/api/v1/checks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setChecks(data.data?.checks || []);
        }
      } catch {} finally {
        setChecksLoading(false);
      }
    };
    fetchChecks();
  }, []);

  const handleDocumentDownload = async (attachment: any, app: any) => {
    try {
      const token = localStorage.getItem('authToken') || '';
      const applicationId = app?._id || app?.id;
      const response = await fetch(
        `${apiBase}/api/v1/visa/${applicationId}/attachments/${attachment._id}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.originalName || attachment.path;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(t('success.downloaded'));
    } catch (error) {
      toast.error(t('errors.fileUploadError'));
    }
  };

  const handleViewResultDocument = (doc: any, app: any) => {
    try {
      if (doc.path && doc.path.startsWith('http')) {
        window.open(doc.path, '_blank');
      } else if (doc.path) {
        const fileUrl = `${apiBase}/uploads/applications/${app?._id || app?.id}/${doc.path}`;
        window.open(fileUrl, '_blank');
      } else {
        toast.error('Document path is missing');
      }
    } catch (error) {
      console.error('View error:', error);
      toast.error(t('errors.general'));
    }
  };

  const totalApplications = stats.total || 0;
  const approvedApplications = stats.approved || 0;
  const userLevel = Math.min(5, Math.floor(approvedApplications / 3) + 1);
  const rewardPoints = approvedApplications * 50 + totalApplications * 10;

  const urgentApplications = applications.filter(
    app =>
      app.status === 'docs_required' ||
      app.attachments?.some(
        (att: any) => att.status === 'rejected' || att.isRequested
      )
  );

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-950/30',
          border: 'border-emerald-200 dark:border-emerald-800/50',
          label: 'Approved',
        };
      case 'under_review':
        return {
          icon: Clock,
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-950/30',
          border: 'border-blue-200 dark:border-blue-800/50',
          label: 'Under Review',
        };
      case 'docs_required':
        return {
          icon: AlertCircle,
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-950/30',
          border: 'border-amber-200 dark:border-amber-800/50',
          label: 'Docs Required',
        };
      case 'submitted':
        return {
          icon: Clock,
          color: 'text-purple-600 dark:text-purple-400',
          bg: 'bg-purple-50 dark:bg-purple-950/30',
          border: 'border-purple-200 dark:border-purple-800/50',
          label: 'Submitted',
        };
      default:
        return {
          icon: FileText,
          color: 'text-gray-600 dark:text-gray-400',
          bg: 'bg-gray-50 dark:bg-gray-800/30',
          border: 'border-gray-200 dark:border-gray-700',
          label: status.replace('_', ' '),
        };
    }
  };

  const handleViewApplication = (app: EnhancedVisaApplication) => {
    setSelectedApplication(app);
    setShowApplicationDetails(true);
  };

  const chartData = {
    statusDistribution: Object.entries(stats)
      .filter(([key]) => key !== 'total')
      .map(([status, count]) => ({
        name: status.replace('_', ' ').toUpperCase(),
        value: count,
      }))
      .filter(item => item.value > 0),
    monthlyTrend: [
      { month: 'Jan', applications: 12, approved: 8, pending: 4 },
      { month: 'Feb', applications: 19, approved: 14, pending: 5 },
      { month: 'Mar', applications: 15, approved: 11, pending: 4 },
      { month: 'Apr', applications: 22, approved: 18, pending: 4 },
      { month: 'May', applications: 18, approved: 15, pending: 3 },
      { month: 'Jun', applications: 25, approved: 20, pending: 5 },
    ],
  };

  const COLORS = ['#0D1F3C', '#1a2a4a', '#2a3a5a', '#3a4a6a', '#4a5a7a', '#5a6a8a'];

  const STAT_CARDS = [
    {
      key: 'total',
      label: 'Total Applications',
      value: stats.total || 0,
      icon: FileText,
      trend: '+12%',
      trendUp: true,
      color: 'from-[#0D1F3C] to-[#1a2a4a]',
    },
    {
      key: 'under_review',
      label: 'In Progress',
      value: stats.under_review || 0,
      icon: Clock,
      trend: '+5%',
      trendUp: true,
      color: 'from-blue-500 to-blue-600',
    },
    {
      key: 'approved',
      label: 'Approved',
      value: stats.approved || 0,
      icon: CheckCircle,
      trend: '+18%',
      trendUp: true,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      key: 'docs_required',
      label: 'Pending Action',
      value: stats.docs_required || 0,
      icon: AlertCircle,
      trend: '-3%',
      trendUp: false,
      color: 'from-amber-500 to-amber-600',
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  // Dashboard Content
  const DashboardContent = () => (
    <>


      {urgentApplications.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-amber-200 bg-amber-50/80 dark:border-amber-900/40 dark:bg-amber-950/20 rounded-2xl shadow-sm">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    {urgentApplications.length} Action
                    {urgentApplications.length > 1 ? 's' : ''} Required
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300/80">
                    Documents needed for your applications
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-900/30 w-full rounded-lg sm:w-auto"
              >
                View All
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Cards - Modern Premium */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {STAT_CARDS.map(({ key, label, value, icon: Icon, trend, trendUp, color }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group"
          >
            <Card className="rounded-2xl border-0 bg-white dark:bg-black/40 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:shadow-black/5 dark:hover:shadow-white/5">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-text-secondary truncate text-xs font-medium uppercase tracking-wide sm:text-sm">
                      {label}
                    </p>
                    <p className="text-foreground mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                      {value}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-xs">
                      <span className={trendUp ? 'text-emerald-600' : 'text-rose-600'}>
                        {trend}
                      </span>
                      <span className="text-text-secondary">vs last month</span>
                    </div>
                  </div>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-lg shadow-${color.split(' ')[1]}/25`}>
                    <Icon className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

    {/* Charts Section - Modern Premium */}
<div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
  {/* Status Distribution Chart */}
  <Card className="rounded-2xl border border-gray-100/50 dark:border-white/5 bg-white dark:bg-black/40 backdrop-blur-sm ">
    <CardHeader className="pb-2">
      <CardTitle className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A3269] to-[#1a2a4a] shadow-md shadow-[#0A3269]/20">
          <PieChartIcon className="h-4 w-4 text-white" />
        </div>
        <span className="dark:text-white">Status Distribution</span>
        <Badge className="ml-auto bg-gray-100/80 dark:bg-white/10 text-gray-600 dark:text-gray-400 border-0 text-[9px] font-medium px-2 py-0.5 rounded-full">
          {chartData.statusDistribution.length} statuses
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent>
      {chartData.statusDistribution.length > 0 ? (
        <div className="relative">
          <ResponsiveContainer width="100%" height={260}>
            <RechartsPie>
              <Pie
                data={chartData.statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value, percent }) => 
                  `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                }
                labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                labelStyle={{ fill: 'var(--foreground)', fontSize: 11 }}
              >
                {chartData.statusDistribution.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke="var(--background)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  backdropFilter: 'blur(8px)',
                  padding: '8px 12px'
                }}
                formatter={(value, name) => [`${value} applications`, name]}
              />
            </RechartsPie>
          </ResponsiveContainer>
          {/* Center Label */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {chartData.statusDistribution.reduce((sum, item) => sum + item.value, 0)}
            </p>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
            <PieChartIcon className="h-6 w-6 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">No data to display</p>
        </div>
      )}
    </CardContent>
  </Card>

  {/* Application Trend Chart */}
  <Card className="rounded-2xl border border-gray-100/50 dark:border-white/5 bg-white dark:bg-black/40 backdrop-blur-sm">
    <CardHeader className="pb-2">
      <CardTitle className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/20">
          <TrendingUp className="h-4 w-4 text-white" />
        </div>
        <span className="dark:text-white">Application Trend</span>
        <Badge className="ml-auto bg-emerald-100/80 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-0 text-[9px] font-medium px-2 py-0.5 rounded-full">
          +12% growth
        </Badge>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData.monthlyTrend}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0D1F3C" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0D1F3C" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="trendFillDark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4A8ABF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4A8ABF" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" opacity={0.4} className="dark:stroke-gray-700" />
          <XAxis 
            dataKey="month" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
            className="dark:[&_tick]:fill-gray-400"
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            width={30} 
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
            className="dark:[&_tick]:fill-gray-400"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255,255,255,0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              backdropFilter: 'blur(8px)',
              padding: '8px 12px'
            }}
            formatter={(value) => [`${value} applications`, 'Total']}
          />
          <Area
            type="monotone"
            dataKey="applications"
            stroke="#0D1F3C"
            strokeWidth={2.5}
            fill="url(#trendFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
</div>

      {/* Applications Section - Modern Premium */}
      <Card className="rounded-2xl border-0 bg-white dark:bg-black/40 backdrop-blur-sm shadow-sm">
        <CardHeader className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0D1F3C]/10 dark:bg-white/10">
                <FileText className="h-4 w-4 text-[#0D1F3C] dark:text-white" />
              </div>
              Your Applications
            </CardTitle>
            <CardDescription>
              Track and manage all your visa applications
            </CardDescription>
          </div>
       
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="border-[#0D1F3C]/20 dark:border-white/10 rounded-2xl border border-dashed py-12 text-center">
              <FileText className="text-[#0D1F3C] dark:text-white mx-auto mb-4 h-14 w-14 opacity-30 sm:h-16 sm:w-16" />
              <h3 className="text-foreground mb-2 text-lg font-semibold">
                No applications yet
              </h3>
              <p className="text-text-secondary mb-4 px-4">
                Start your first visa application today!
              </p>
              <Button
                className="bg-[#0D1F3C] hover:bg-[#1a2a4a] rounded-xl text-white shadow-lg shadow-[#0D1F3C]/25"
                onClick={() => setShowStartApplication(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Application
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {applications.map((app: any, index) => {
                  const appId = app._id || app.id;
                  return (
                    <ExpandedApplicationCard
                      key={appId}
                      application={app}
                      isExpanded={expandedApplicationIds.has(appId)}
                      onToggle={() => {
                        setExpandedApplicationIds(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(appId)) {
                            newSet.delete(appId);
                          } else {
                            newSet.add(appId);
                          }
                          return newSet;
                        });
                      }}
                      onDocumentView={(doc) => handleViewResultDocument(doc, app)}
                      onDocumentDownload={(doc) => handleDocumentDownload(doc, app)}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Government Services & Support - Modern Premium */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        <Card className="rounded-2xl border-0 bg-white dark:bg-black/40 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0D1F3C]/10 dark:bg-white/10">
                <Building2 className="h-4 w-4 text-[#0D1F3C] dark:text-white" />
              </div>
              Government Services
            </CardTitle>
            <CardDescription>
              Quick links to UAE government portals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {GOV_SERVICES.map(({ key, label, sub, url, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => window.open(url, '_blank')}
                  className="group relative flex flex-col items-start gap-2.5 overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0D1F3C]/20 dark:hover:border-white/20 hover:shadow-lg hover:shadow-[#0D1F3C]/5 dark:hover:shadow-white/5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0D1F3C]/10 dark:bg-white/10">
                    <Icon className="h-5 w-5 text-[#0D1F3C] dark:text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-foreground text-sm font-semibold leading-tight">
                      {label}
                    </p>
                    <p className="text-text-secondary text-[11px] leading-tight">
                      {sub}
                    </p>
                  </div>
                  <ArrowUpRight className="absolute right-3 top-3 h-3.5 w-3.5 text-text-secondary/40 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#0D1F3C] dark:group-hover:text-white" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-white dark:bg-black/40 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0D1F3C]/10 dark:bg-white/10">
                <HelpCircle className="h-4 w-4 text-[#0D1F3C] dark:text-white" />
              </div>
              Help & Support
            </CardTitle>
            <CardDescription>
              Get assistance when you need it
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/knowledge" className="block">
              <button className="group flex w-full items-center gap-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0D1F3C]/20 dark:hover:border-white/20 hover:shadow-lg hover:shadow-[#0D1F3C]/5 dark:hover:shadow-white/5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <BookOpen className="h-4 w-4" />
                </div>
                <span className="text-foreground flex-1 text-sm font-medium">
                  Knowledge Hub
                </span>
                <ArrowRight className="h-4 w-4 text-text-secondary/40 transition-all group-hover:translate-x-0.5 group-hover:text-[#0D1F3C] dark:group-hover:text-white" />
              </button>
            </Link>
            <button
              onClick={() => toast.info('Opening live chat...')}
              className="group flex w-full items-center gap-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0D1F3C]/20 dark:hover:border-white/20 hover:shadow-lg hover:shadow-[#0D1F3C]/5 dark:hover:shadow-white/5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <MessageSquare className="h-4 w-4" />
              </div>
              <span className="text-foreground flex-1 text-sm font-medium">
                Live Chat Support
              </span>
              <ArrowRight className="h-4 w-4 text-text-secondary/40 transition-all group-hover:translate-x-0.5 group-hover:text-[#0D1F3C] dark:group-hover:text-white" />
            </button>
            <button
              onClick={() => (window.location.href = 'tel:+97145551234')}
              className="group flex w-full items-center gap-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0D1F3C]/20 dark:hover:border-white/20 hover:shadow-lg hover:shadow-[#0D1F3C]/5 dark:hover:shadow-white/5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <Phone className="h-4 w-4" />
              </div>
              <span className="text-foreground flex-1 text-sm font-medium">
                Call Center
              </span>
              <ArrowRight className="h-4 w-4 text-text-secondary/40 transition-all group-hover:translate-x-0.5 group-hover:text-[#0D1F3C] dark:group-hover:text-white" />
            </button>
            <button
              onClick={() => (window.location.href = 'mailto:support@tammat.ae')}
              className="group flex w-full items-center gap-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0D1F3C]/20 dark:hover:border-white/20 hover:shadow-lg hover:shadow-[#0D1F3C]/5 dark:hover:shadow-white/5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Mail className="h-4 w-4" />
              </div>
              <span className="text-foreground flex-1 text-sm font-medium">
                Email Support
              </span>
              <ArrowRight className="h-4 w-4 text-text-secondary/40 transition-all group-hover:translate-x-0.5 group-hover:text-[#0D1F3C] dark:group-hover:text-white" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* ✅ Golden Guarantee Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-4"
      >
        <div className="relative rounded-xl sm:rounded-2xl border border-amber-500/30 dark:border-amber-500/20 bg-gradient-to-br from-amber-50/80 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/10 p-4 sm:p-5 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 group">
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-xl bg-amber-500/20 border border-amber-500/20 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
              <Award className="h-6 w-6 sm:h-7 sm:w-7 text-amber-600 dark:text-amber-400" strokeWidth={1.75} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-black dark:text-white text-sm sm:text-base flex flex-wrap items-center gap-2">
                TMMT Golden Guarantee
                <Badge className="bg-amber-500 text-white text-[8px] px-2 py-0.5 rounded-full font-light border-0">
                  ✓ Trusted
                </Badge>
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-white/60 leading-relaxed mt-0.5 font-light">
                If an issue is caused by TMMT, we will correct it at no additional service fee according to our guarantee policy.
              </p>
              <a
                href="/legal#guarantee"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1.5 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium transition-all duration-300 group/link hover:gap-2"
              >
                Read more about the guarantee
                <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover/link:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'documents':
        return <DocumentPage />;
      case 'compliance':
        return <CompliancePage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardContent />;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#0a0a0f] dark:via-[#14141e] dark:to-[#0a0a0f] px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-2 border-[#0D1F3C] border-t-transparent sm:h-16 sm:w-16"></div>
          <p className="text-text-secondary text-base sm:text-lg">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  const isActiveTab = (tabKey: TabKey) => activeTab === tabKey;

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#0a0a0f] dark:via-[#14141e] dark:to-[#0a0a0f] flex min-h-screen">
      {/* Modern Desktop Sidebar */}
      <motion.aside
        className="border-[#0D1F3C]/10 dark:border-white/5 bg-white/90 dark:bg-black/80 sticky top-0 hidden h-screen shrink-0 border-r backdrop-blur-xl lg:flex lg:flex-col"
        animate={{
          width: isSidebarCollapsed ? 60 : 290,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-between border-b border-[#0D1F3C]/10 dark:border-white/5 px-4">
          <motion.div
            className="flex items-center gap-3 overflow-hidden"
            animate={{
              width: isSidebarCollapsed ? 40 : 'auto',
            }}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0D1F3C] to-[#2D4A7A] shadow-lg shadow-[#0D1F3C]/25">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <motion.span
              className="bg-gradient-to-r from-[#0D1F3C] to-[#2D4A7A] dark:from-white dark:to-gray-300 bg-clip-text text-transparent whitespace-nowrap text-lg font-semibold tracking-tight"
              initial={{ opacity: 0, width: 0 }}
              animate={{
                opacity: isSidebarCollapsed ? 0 : 1,
                width: isSidebarCollapsed ? 0 : 'auto',
              }}
              transition={{ duration: 0.2 }}
            >
              USER Portal
            </motion.span>
          </motion.div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-lg hover:bg-[#0D1F3C]/10 dark:hover:bg-white/10 transition-all duration-300"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 text-[#0D1F3C] dark:text-white/70" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-[#0D1F3C] dark:text-white/70" />
            )}
          </Button>
        </div>

        {/* Navigation Links - Premium Design */}
        <nav className="flex-1 space-y-1.5 px-2 py-4">
          {NAV_ITEMS.map(({ path, label, icon: Icon, key }) => (
            <button
              key={key}
              onClick={() => handleNavigate(path)}
              className="w-full group relative"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="relative"
              >
                <Button
                  variant="ghost"
                  className={`
                    group relative h-12 w-full overflow-hidden rounded-2xl px-3
                    justify-start border transition-all duration-500 ease-out

                    ${
                      isActiveTab(key as TabKey)
                        ? `
                          border-[#0D1F3C]/20 dark:border-white/20
                          bg-gradient-to-r
                          from-[#0D1F3C]
                          via-[#1a2a4a]
                          to-[#0D1F3C]
                          text-white
                          shadow-[0_10px_35px_rgba(13,31,60,0.3)]
                          dark:shadow-[0_10px_35px_rgba(255,255,255,0.1)]
                        `
                        : `
                          border-transparent
                          text-muted-foreground
                          hover:border-[#0D1F3C]/20 dark:hover:border-white/20
                          hover:bg-[#0D1F3C]/8 dark:hover:bg-white/5
                          hover:text-foreground
                          hover:shadow-lg
                          hover:shadow-[#0D1F3C]/10 dark:hover:shadow-white/5
                          hover:-translate-y-0.5
                        `
                    }
                  `}
                >
                  {/* Animated Background Shimmer */}
                  {isActiveTab(key as TabKey) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-transparent to-transparent" />
                  )}

                  {/* Glow Effect on Hover */}
                  <div className={`
                    absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500
                    ${!isActiveTab(key as TabKey) && 'group-hover:opacity-100'}
                    bg-gradient-to-r from-[#0D1F3C]/5 via-transparent to-transparent
                    dark:from-white/5
                  `} />

                  {/* Active Indicator - Premium Gradient Bar */}
                  <div
                    className={`
                      absolute left-0 top-1/2 -translate-y-1/2
                      h-8 w-1 rounded-r-full transition-all duration-500
                      ${
                        isActiveTab(key as TabKey)
                          ? "bg-gradient-to-b from-[#0D1F3C] to-[#2D4A7A] shadow-[0_0_20px_rgba(13,31,60,0.5)] dark:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                          : "bg-transparent group-hover:bg-[#0D1F3C]/30 dark:group-hover:bg-white/20"
                      }
                    `}
                  />

                  {/* Icon */}
                  <div className="relative z-10">
                    <div className={`
                      relative flex items-center justify-center
                      transition-all duration-500
                      ${isActiveTab(key as TabKey) 
                        ? 'scale-110' 
                        : 'group-hover:scale-110 group-hover:rotate-[-5deg]'
                      }
                    `}>
                      <Icon
                        className={`
                          relative z-10 h-5 w-5 shrink-0 transition-all duration-500
                          ${isActiveTab(key as TabKey) 
                            ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" 
                            : "text-muted-foreground group-hover:text-[#0D1F3C] dark:group-hover:text-white"
                          }
                        `}
                      />
                      {isActiveTab(key as TabKey) && (
                        <div className="absolute inset-0 rounded-full blur-md bg-white/20" />
                      )}
                    </div>
                  </div>

                  {/* Text */}
                  <motion.span
                    className="relative z-10 ml-3 overflow-hidden whitespace-nowrap font-medium tracking-wide"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{
                      opacity: isSidebarCollapsed ? 0 : 1,
                      width: isSidebarCollapsed ? 0 : "auto",
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    {label}
                    {!isActiveTab(key as TabKey) && (
                      <span className={`
                        absolute -bottom-0.5 left-0 h-0.5 w-0 bg-[#0D1F3C] dark:bg-white
                        transition-all duration-300 group-hover:w-full
                      `} />
                    )}
                  </motion.span>

                  {/* Active Tab Badge */}
                  {isActiveTab(key as TabKey) && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="ml-auto flex items-center gap-1.5"
                    >
                      <span className="relative z-10 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            </button>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="border-[#0D1F3C]/10 dark:border-white/5 space-y-3 border-t p-3">

          {/* Logout Button */}
          <motion.div 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.97 }}
            className="relative"
          >
            <Button
              variant="ghost"
              className="w-full justify-start rounded-xl border border-transparent text-red-500/70 transition-all duration-300 hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-500 group"
              onClick={signOut}
            >
              <LogOut className="h-5 w-5 shrink-0 relative z-10 transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:scale-110" />
              <motion.span
                className="relative z-10 ml-3 overflow-hidden whitespace-nowrap font-medium"
                initial={{ opacity: 0, width: 0 }}
                animate={{
                  opacity: isSidebarCollapsed ? 0 : 1,
                  width: isSidebarCollapsed ? 0 : 'auto',
                }}
                transition={{ duration: 0.2 }}
              >
                Logout
              </motion.span>
              <ArrowRight className="relative z-10 ml-auto h-4 w-4 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5" />
            </Button>
          </motion.div>
        </div>
      </motion.aside>
{/* Main Content */}
<main className="min-w-0 flex-1 pb-24 lg:pb-0">
  <div className="sticky top-0 z-20 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5">
    <div className="flex items-center justify-between gap-2 px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-0">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {/* ✅ Avatar - No shadow, Light: black bg, Dark: white bg */}
        <div className="relative">
          <Avatar className="h-8 w-8 border-2 border-gray-200 dark:border-gray-700 sm:h-10 sm:w-10 md:h-11 md:w-11 lg:h-12 lg:w-12">
            <AvatarImage src={userDetails?.avatar} />
            <AvatarFallback className="bg-white text-black dark:bg-black dark:text-white text-[10px] xs:text-xs sm:text-sm font-bold">
              {userDetails?.firstName?.[0]}
              {userDetails?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1.5 ring-white dark:ring-black sm:h-2.5 sm:w-2.5" />
        </div>

        <div className="min-w-0">
 <h3 className="flex items-center gap-1 xs:gap-2 truncate text-[10px] xs:text-xs sm:text-sm md:text-base font-semibold text-gray-900 dark:text-white">
  <span className="hidden xxs:inline">Welcome back,</span>
  <span className="xxs:hidden">Hi,</span>
  <span className="truncate">{userDetails?.firstName || user?.name || 'User'}!</span>
</h3>


          <div className="mt-0.5 flex flex-wrap items-center gap-1 sm:gap-1.5">
         {/* Level Badge - Premium */}
<Badge className="bg-gradient-to-r from-[#0A3269] to-[#1a2a4a] text-white border-0 text-[8px] sm:text-[9px] px-1.5 sm:px-2.5 py-0.5 rounded-full shadow-sm shadow-[#0A3269]/20">
  <Crown className="mr-0.5 h-1.5 w-1.5 sm:h-2.5 sm:w-2.5 text-yellow-400" />
  <span>Level {userLevel}</span>
</Badge>

{/* Points Badge - Premium */}
<Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[8px] sm:text-[9px] px-1.5 sm:px-2.5 py-0.5 rounded-full shadow-sm shadow-amber-500/20">
  <Sparkles className="mr-0.5 h-1.5 w-1.5 sm:h-2.5 sm:w-2.5" />
  <span>{rewardPoints.toLocaleString()} pts</span>
</Badge>
          </div>
{/* ✅ Dynamic Status Text - With conditional emojis */}
<p className="mt-2 text-[9px] xs:text-[10px] sm:text-xs text-gray-600 dark:text-gray-300 leading-tight">
  {approvedApplications > 0 ? (
    <>
      <span className="mr-0.5">✅</span>
      <span>You have </span>
      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{approvedApplications}</span>
      <span> approved application{approvedApplications > 1 ? 's' : ''}.</span>
    </>
  ) : (
    <>
      <span className="mr-0.5">🚀</span>
      <span>Start your journey with Tammet today.</span>
    </>
  )}
</p>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* New Application Button - Premium */}
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowStartApplication(true)}
          className="group relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-r from-[#0A3269] to-[#1a2a4a] px-2 xs:px-2.5 sm:px-4 py-1 xs:py-1.5 sm:py-2.5 text-[8px] xs:text-[9px] sm:text-xs font-medium text-white hover:-translate-y-0.5 transition-all duration-300"
        >
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <span className="relative flex items-center gap-1 xs:gap-1.5 sm:gap-2">
            <Plus className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">New</span>
            <span className="hidden sm:inline">Application</span>
            <span className="xs:hidden">+</span>
          </span>
        </motion.button>
      </div>
    </div>
  </div>

  <div className="space-y-6 p-4 sm:space-y-8 sm:p-6">
    {renderContent()}
  </div>
</main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="bg-white/95 dark:bg-black/95 border-[#0D1F3C]/10 dark:border-white/5 fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t px-2 py-2 backdrop-blur-xl lg:hidden shadow-[0_-4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_30px_rgba(0,0,0,0.3)]">
        {NAV_ITEMS.slice(0, 4).map(({ path, label, icon: Icon, key }) => (
          <button
            key={key}
            onClick={() => handleNavigate(path)}
            className="flex-1 relative group"
          >
            <div
              className={`flex w-full flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] transition-all duration-200 ${
                isActiveTab(key as TabKey)
                  ? 'text-[#0D1F3C] dark:text-white font-semibold'
                  : 'text-text-secondary hover:text-foreground'
              }`}
            >
              {isActiveTab(key as TabKey) && (
                <motion.div
                  layoutId="mobile-tab-indicator"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-gradient-to-r from-[#0D1F3C] to-[#1a2a4a]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`h-5 w-5 ${isActiveTab(key as TabKey) ? 'text-[#0D1F3C] dark:text-white' : ''}`} />
              <span className="text-[10px]">{label}</span>
            </div>
          </button>
        ))}
      </nav>

      {/* Dialogs */}
      <Dialog
        open={showApplicationDetails}
        onOpenChange={setShowApplicationDetails}
      >
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-4xl overflow-y-auto rounded-2xl sm:w-full">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle className="flex flex-wrap items-center gap-2">
                  {(() => {
                    const config = getStatusConfig(selectedApplication.status);
                    const StatusIcon = config.icon;
                    return <StatusIcon className={`h-5 w-5 ${config.color}`} />;
                  })()}
                  <span>
                    {selectedApplication.applicationType
                      .replace(/_/g, ' ')
                      .split(' ')
                      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' ')}
                  </span>
                  <Badge
                    className={getStatusConfig(selectedApplication.status).bg}
                  >
                    {getStatusConfig(selectedApplication.status).label}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Application ID: {selectedApplication.id}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-6">
                <Card className="rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Application Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                      <div>
                        <Label className="text-muted-foreground">
                          Application Type
                        </Label>
                        <p className="font-medium">
                          {selectedApplication.applicationType.replace(
                            /_/g,
                            ' '
                          )}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Status</Label>
                        <Badge
                          className={
                            getStatusConfig(selectedApplication.status).bg
                          }
                        >
                          {getStatusConfig(selectedApplication.status).label}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Created</Label>
                        <p className="font-medium">
                          {new Date(
                            selectedApplication.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          Last Updated
                        </Label>
                        <p className="font-medium">
                          {new Date(
                            selectedApplication.updatedAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sponsor Information */}
                <Card className="rounded-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="h-4 w-4" />
                      Sponsor Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                      <div>
                        <Label className="text-muted-foreground">Name</Label>
                        <p className="font-medium">
                          {selectedApplication.sponsor.firstName}{' '}
                          {selectedApplication.sponsor.lastName}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Email</Label>
                        <p className="font-medium break-all">
                          {selectedApplication.sponsor.email}
                        </p>
                      </div>
                      {selectedApplication.sponsor.phoneNumber && (
                        <div>
                          <Label className="text-muted-foreground">Phone</Label>
                          <p className="font-medium">
                            {selectedApplication.sponsor.phoneNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Submitted Documents */}
                {selectedApplication.attachments &&
                  selectedApplication.attachments.length > 0 && (
                    <Card className="rounded-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <FileText className="h-4 w-4" />
                          Submitted Documents (
                          {selectedApplication.attachments.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedApplication.attachments.map(
                            (doc: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 p-3"
                              >
                                <div className="flex min-w-0 items-center gap-2">
                                  <FileText className="h-4 w-4 shrink-0 text-[#0D1F3C] dark:text-white" />
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">
                                      {doc.filename ||
                                        doc.originalName ||
                                        'Document'}
                                    </p>
                                    {doc.status && (
                                      <Badge className="mt-1 text-xs">
                                        {doc.status}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex shrink-0 gap-1">
                                  <Button
                                    onClick={() =>
                                      handleViewResultDocument(doc, selectedApplication)
                                    }
                                    variant="ghost"
                                    size="sm"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleDocumentDownload(doc, selectedApplication)
                                    }
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {/* Result Documents */}
                {(selectedApplication as any).resultDocuments &&
                  (selectedApplication as any).resultDocuments.length > 0 && (
                    <Card className="border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/10 rounded-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg text-emerald-900 dark:text-emerald-300">
                          <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          Result Documents (
                          {(selectedApplication as any).resultDocuments.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {(selectedApplication as any).resultDocuments.map(
                            (doc: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between gap-2 rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/10 p-3"
                              >
                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                  <Zap className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-emerald-900 dark:text-emerald-300">
                                      {doc.label ||
                                        doc.originalName ||
                                        'Result Document'}
                                    </p>
                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                      <p className="text-xs text-emerald-700 dark:text-emerald-400">
                                        Uploaded:{' '}
                                        {new Date(
                                          doc.uploadedAt
                                        ).toLocaleDateString()}
                                      </p>
                                      {doc.uploadedByRole && (
                                        <Badge className="bg-blue-100 text-[10px] text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                                          by {doc.uploadedByRole}
                                        </Badge>
                                      )}
                                    </div>
                                    {doc.description && (
                                      <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                                        {doc.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex shrink-0 gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                                    onClick={() =>
                                      handleViewResultDocument(doc, selectedApplication)
                                    }
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                                    onClick={() => handleDocumentDownload(doc, selectedApplication)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {/* Application History */}
                {selectedApplication.history &&
                  selectedApplication.history.length > 0 && (
                    <Card className="rounded-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <History className="h-4 w-4" />
                          Application History
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedApplication.history.map(
                            (event: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-start gap-3"
                              >
                                <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#0D1F3C] dark:bg-white" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium">
                                    {event.action
                                      ?.replace('_', ' ')
                                      .toUpperCase()}
                                  </p>
                                  {event.note && (
                                    <p className="text-muted-foreground text-xs">
                                      {event.note}
                                    </p>
                                  )}
                                  <p className="text-muted-foreground mt-1 text-xs">
                                    {new Date(event.at).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {showStartApplication && (
        <StartApplicationDialog
          open={showStartApplication}
          onOpenChange={setShowStartApplication}
          queryParams=""
        />
      )}

      <LiveChatWidget />
    </div>
  );
};

export default AdvancedInvestorPortfolio;