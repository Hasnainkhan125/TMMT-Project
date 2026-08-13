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
import TMMTLogo from '@/assets/TMMTLogo.png';
import {
  FileText,
  Download,
  Eye,
  Check,
  Rocket,
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
  Filter,
  XCircle,
  ClipboardCheck,
  ClipboardList,
  Package,
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
import CheckCard from '@/components/Checks/CheckCard';
import PackageCard from '@/components/PackageCard/PackageCard';
import { usePackageAdmin } from '@/hooks/usePackageAdmin';

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
type CheckFilter = 'all' | 'pending' | 'processing' | 'completed' | 'failed';
type ApplicationFilter = 'all' | 'submitted' | 'under_review' | 'docs_required' | 'approved';
type DataView = 'checks' | 'applications' | 'packages' | null;

const AdvancedInvestorPortfolio = () => {
  const { t } = useTranslation();
  const { signOut, user } = useAuth();
  const { applications, userDetails, stats, loading, fetchApplications } =
    useApplications();

  // ─── Package Applications ──────────────────────────────────────────────
  const {
    applications: packageApps,
    loading: packageLoading,
    fetchApplications: fetchPackages,
  } = usePackageAdmin({ mine: true });

  useEffect(() => {
    fetchPackages();
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = (path: string): TabKey => {
    if (path.includes('/user/documents')) return 'documents';
    if (path.includes('/investor/compliance')) return 'compliance';
    if (path.includes('/user/profile')) return 'profile';
    return 'dashboard';
  };


  const handleEmailClick = () => {
  const email = 'support@tammat.ae';
  window.location.href = `mailto:${email}`;
  // Fallback after 2 seconds
  setTimeout(() => {
    if (document.hasFocus()) {
      navigator.clipboard.writeText(email)
        .then(() => toast.info('Email copied to clipboard!'))
        .catch(() => toast.info(`Please email ${email}`));
    }
  }, 2000);
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

  // ─── Filter States ──────────────────────────────────────────────────────────
  const [checkFilter, setCheckFilter] = useState<CheckFilter>('all');
  const [appFilter, setAppFilter] = useState<ApplicationFilter>('all');
  const [packageFilter, setPackageFilter] = useState<'all' | 'submitted' | 'processing' | 'completed' | 'cancelled'>('all');
  const [dataView, setDataView] = useState<DataView>(null);

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
          const rawChecks = data.data?.checks || [];

          const normalisedChecks = rawChecks.map((check: any) => ({
            ...check,
            id: check._id || check.id,
            serviceId: check.serviceId || check.service_id,
            serviceType: check.serviceType || check.service_type,
            status: check.status || 'pending',
            speedTier: check.speedTier || check.speed_tier || 'standard',
            documents: check.documents || [],
            identifiers: check.identifiers || {},
            result: check.result || null,
            createdAt: check.createdAt || check.created_at,
            updatedAt: check.updatedAt || check.updated_at,
            comments: check.comments || [],
            requestedDocuments: check.requested_documents || check.requestedDocuments || [],
            resultDocuments: check.result_documents || check.resultDocuments || [],
            history: check.history_events || check.history || [],
            resultSummary: check.result_summary || check.resultSummary || '',
            resultStatus: check.result_status || check.resultStatus || '',
            isFreeService: check.is_free_service ?? check.isFreeService ?? false,
            amount: check.amount ?? 0,
          }));

          setChecks(normalisedChecks);
        }
      } catch (error) {
        console.error('Failed to fetch checks:', error);
      } finally {
        setChecksLoading(false);
      }
    };
    fetchChecks();
  }, []);

  // ─── Filtered Data ──────────────────────────────────────────────────────────
  const filteredChecks = checks.filter((check) => {
    if (checkFilter === 'all') return true;
    return check.status === checkFilter;
  });

  const filteredApplications = applications.filter((app) => {
    if (appFilter === 'all') return true;
    return app.status === appFilter;
  });

  const filteredPackages = packageApps.filter((pkg) => {
    if (packageFilter === 'all') return true;
    return pkg.status === packageFilter;
  });

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

  const handleViewAllUrgent = () => {
    setDataView('applications');
    setAppFilter('docs_required');
    toast.info(`Showing ${urgentApplications.length} application(s) requiring documents`, {
      duration: 2000,
    });
    setTimeout(() => {
      const applicationsSection = document.getElementById('applications-section');
      if (applicationsSection) {
        applicationsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

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
  const COLORS = ['#0A3269', '#1a4a7a', '#2a5a8a', '#3a6a9a', '#4a7aaa', '#5a8aba'];

  const STAT_CARDS = [
    {
      key: 'total',
      label: 'Total Applications',
      value: stats.total || 0,
      icon: FileText,
      trend: '+12%',
      trendUp: true,
      color: 'bg-[#0A3269]',
    },
    {
      key: 'under_review',
      label: 'In Progress',
      value: stats.under_review || 0,
      icon: Clock,
      trend: '+5%',
      trendUp: true,
      color: 'bg-blue-600',
    },
    {
      key: 'approved',
      label: 'Approved',
      value: stats.approved || 0,
      icon: CheckCircle,
      trend: '+18%',
      trendUp: true,
      color: 'bg-emerald-600',
    },
    {
      key: 'docs_required',
      label: 'Pending Action',
      value: stats.docs_required || 0,
      icon: AlertCircle,
      trend: '-3%',
      trendUp: false,
      color: 'bg-amber-600',
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const checkFilterButtons: { key: CheckFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: checks.length },
    { key: 'pending', label: 'Pending', count: checks.filter(c => c.status === 'pending').length },
    { key: 'processing', label: 'Processing', count: checks.filter(c => c.status === 'processing').length },
    { key: 'completed', label: 'Completed', count: checks.filter(c => c.status === 'completed').length },
    { key: 'failed', label: 'Failed', count: checks.filter(c => c.status === 'failed').length },
  ];

  const appFilterButtons: { key: ApplicationFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: applications.length },
    { key: 'submitted', label: 'Submitted', count: applications.filter(a => a.status === 'submitted').length },
    { key: 'under_review', label: 'Under Review', count: applications.filter(a => a.status === 'under_review').length },
    { key: 'docs_required', label: 'Docs Required', count: applications.filter(a => a.status === 'docs_required').length },
    { key: 'approved', label: 'Approved', count: applications.filter(a => a.status === 'approved').length },
  ];

  // ─── Dashboard Content ─────────────────────────────────────────────────────
  const DashboardContent = () => (
    <>
      {/* ─── Urgent Alert ───────────────────────────────────────────────────── */}
      {urgentApplications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-amber-200/60 bg-amber-50/60 dark:border-amber-900/30 dark:bg-amber-950/15 rounded-xl transition-colors">
            <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                    {urgentApplications.length} Action
                    {urgentApplications.length > 1 ? 's' : ''} Required
                  </p>
                  <p className="text-xs text-amber-700/80 dark:text-amber-300/70">
                    Documents needed for your applications
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleViewAllUrgent}
                className="border-amber-300/60 text-amber-700 hover:bg-amber-100 dark:border-amber-700/50 dark:text-amber-300 dark:hover:bg-amber-900/30 w-full rounded-lg sm:w-auto transition-colors duration-200 group"
              >
                View All
                <ArrowUpRight className="ml-1 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Cards - Modern Flat Design */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
        {STAT_CARDS.map(({ key, label, value, icon: Icon, trend, trendUp, color }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="group"
          >
            <div className="relative overflow-hidden rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-gray-900/60 p-3.5 sm:p-4 transition-all duration-300 hover:border-gray-300 dark:hover:border-white/20">
              <div className="relative flex items-start justify-between gap-2">
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {label}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                    {value}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`text-[10px] sm:text-xs font-medium ${trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {trend}
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground/60">vs last month</span>
                  </div>
                </div>

                <div
                  className={`rounded-xl p-2.5 flex-shrink-0 ${color}`}
                >
                  <Icon className="h-4 w-4 text-white" strokeWidth={2} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section - Modern Minimal */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        <Card className="rounded-xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-black/40 transition-colors">
          <CardHeader className="pb-1.5 px-4 pt-4 sm:px-5 sm:pt-5">
            <CardTitle className="flex items-center gap-2 text-xs sm:text-sm font-light text-gray-900 dark:text-white">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[#0A3269]">
                <PieChartIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
              Status Distribution
              <Badge className="ml-auto bg-gray-100/60 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-0 text-[8px] sm:text-[9px] font-light px-2 py-0.5 rounded-full">
                {chartData.statusDistribution.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
            {chartData.statusDistribution.length > 0 ? (
              <div className="relative">
                <ResponsiveContainer width="100%" height={220}>
                  <RechartsPie>
                    <Pie
                      data={chartData.statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value, percent }) =>
                        `${name}: ${value}`
                      }
                      labelLine={{ stroke: '#94a3b8', strokeWidth: 0.5 }}
                      labelStyle={{ fill: 'var(--foreground)', fontSize: 9 }}
                    >
                      {chartData.statusDistribution.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="var(--background)"
                          strokeWidth={1.5}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        fontSize: '11px'
                      }}
                      formatter={(value, name) => [`${value} applications`, name]}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <p className="text-[9px] font-light text-gray-400 dark:text-gray-500">Total</p>
                  <p className="text-base sm:text-lg font-light text-gray-900 dark:text-white">
                    {chartData.statusDistribution.reduce((sum, item) => sum + item.value, 0)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                  <PieChartIcon className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-light">No data to display</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-black/40">
          <CardHeader className="pb-1.5 px-4 pt-4 sm:px-5 sm:pt-5">
            <CardTitle className="flex items-center gap-2 text-xs sm:text-sm font-light text-gray-900 dark:text-white">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[#0A3269]">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
              Application Trend
              <Badge className="ml-auto bg-emerald-100/60 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 text-[8px] sm:text-[9px] font-light px-2 py-0.5 rounded-full">
                +12%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData.monthlyTrend}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A3269" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0A3269" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} className="dark:stroke-gray-700" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 300 }}
                  className="dark:[&_tick]:fill-gray-400"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={25}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 300 }}
                  className="dark:[&_tick]:fill-gray-400"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '11px'
                  }}
                  formatter={(value) => [`${value} applications`, 'Total']}
                />
                <Area
                  type="monotone"
                  dataKey="applications"
                  stroke="#0A3269"
                  strokeWidth={2}
                  fill="url(#trendFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ─── DATA VIEW BUTTONS ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => setDataView(dataView === 'checks' ? null : 'checks')}
          className={`
            flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-lg
            text-[10px] sm:text-xs font-light transition-all duration-300 whitespace-nowrap
            border
            ${dataView === 'checks'
              ? 'bg-[#0A3269] text-white border-[#0A3269]'
              : 'bg-white dark:bg-black/40 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-[#0A3269]/30 dark:hover:border-white/20'
            }
          `}
        >
          <ClipboardCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Checks</span>
          <span className={`
            ${dataView === 'checks'
              ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
              : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'
            }
            text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full font-light
          `}>
            {checks.length}
          </span>
        </button>

        <button
          onClick={() => setDataView(dataView === 'applications' ? null : 'applications')}
          className={`
            flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-lg
            text-[10px] sm:text-xs font-light transition-all duration-300 whitespace-nowrap
            border
            ${dataView === 'applications'
              ? 'bg-[#0A3269] text-white border-[#0A3269]'
              : 'bg-white dark:bg-black/40 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-[#0A3269]/30 dark:hover:border-white/20'
            }
          `}
        >
          <ClipboardList className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Applications</span>
          <span className={`
            ${dataView === 'applications'
              ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
              : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'
            }
            text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full font-light
          `}>
            {applications.length}
          </span>
        </button>

        <button
          onClick={() => setDataView(dataView === 'packages' ? null : 'packages')}
          className={`
            flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-lg
            text-[10px] sm:text-xs font-light transition-all duration-300 whitespace-nowrap
            border
            ${dataView === 'packages'
              ? 'bg-[#0A3269] text-white border-[#0A3269]'
              : 'bg-white dark:bg-black/40 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-[#0A3269]/30 dark:hover:border-white/20'
            }
          `}
        >
          <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Packages</span>
          <span className={`
            ${dataView === 'packages'
              ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
              : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'
            }
            text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full font-light
          `}>
            {packageApps.length}
          </span>
        </button>

        {dataView !== null && (
          <button
            onClick={() => setDataView(null)}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-light text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors whitespace-nowrap"
          >
            <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Clear</span>
            <span className="sm:hidden">✕</span>
          </button>
        )}
      </div>

   {/* ─── CHECKS VIEW ────────────────────────────────────────────────────── */}
{dataView === 'checks' && (
  <Card className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-black/40 backdrop-blur-sm">
<<<<<<< HEAD
    <CardHeader className="flex flex-col items-start justify-between gap-4 p-4 sm:p-5 md:p-6">
      <div className="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <div className="flex h-9 w-9 sm:h-8 sm:w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-[#0A3269]/5 dark:bg-white/5 border border-[#0A3269]/10 dark:border-white/10">
            <ClipboardCheck className="h-5 w-5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-[#0A3269] dark:text-white/80" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="flex flex-wrap items-center gap-1.5 text-base sm:text-lg md:text-xl font-thin tracking-wide text-gray-700 dark:text-gray-200">
              Your Checks
              <Badge className="bg-[#0A3269]/5 text-[#0A3269]/70 dark:bg-white/5 dark:text-white/60 border-0 text-[11px] sm:text-[10px] md:text-[11px] font-light px-2.5 py-1 rounded-full">
                {filteredChecks.length}
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm sm:text-xs md:text-sm text-gray-400 dark:text-gray-500 font-extralight tracking-wide mt-0.5 sm:mt-0">
              Track all your government status checks
            </CardDescription>
          </div>
        </div>
        <Button
          className="w-full sm:w-auto bg-[#0A3269] hover:bg-[#1A4A8A] rounded-xl text-white transition-colors duration-300 h-10 sm:h-9 md:h-10 px-5 sm:px-4 md:px-5 text-sm sm:text-sm md:text-base font-light tracking-wide"
          onClick={() => navigate('/customer-dashboard')}
        >
          <Plus className="mr-2 h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5" />
          New Check
        </Button>
      </div>
    </CardHeader>

    <CardContent className="p-4 sm:p-5 md:p-6 pt-0">
      {/* ─── Check Filter Buttons ────────────────────────────────────── */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {checkFilterButtons.map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setCheckFilter(key)}
            className={`
              px-3 py-1.5 rounded-full text-[10px] font-medium transition-all duration-200 border
              ${checkFilter === key
                ? 'bg-[#0A3269] text-white border-[#0A3269]'
                : 'bg-white dark:bg-black/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-[#0A3269]/30 dark:hover:border-white/20'
              }
            `}
          >
            {label} <span className="opacity-60">({count})</span>
          </button>
        ))}
        {checkFilter !== 'all' && (
          <button
            type="button"
            onClick={() => setCheckFilter('all')}
            className="px-2 py-0.5 rounded-full text-[10px] text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <XCircle className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
=======
<CardHeader className="flex flex-col items-start justify-between gap-4 p-3 sm:p-4 md:p-6">
  <div className="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
    <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
      <div className="flex h-8 w-8 sm:h-8 sm:w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-[#0A3269]/5 dark:bg-white/5 border border-[#0A3269]/10 dark:border-white/10">
        <ClipboardCheck className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 text-[#0A3269] dark:text-white/80" />
      </div>
      <div className="min-w-0 flex-1">
        <CardTitle className="flex flex-wrap items-center gap-1.5 text-sm sm:text-base md:text-xl font-thin tracking-wide text-gray-700 dark:text-gray-200">
          Your Checks
          <Badge className="bg-[#0A3269]/5 text-[#0A3269]/70 dark:bg-white/5 dark:text-white/60 border-0 text-[10px] sm:text-[10px] md:text-[11px] font-light px-2 py-0.5 rounded-full">
            {filteredChecks.length}
          </Badge>
        </CardTitle>
        <CardDescription className="text-[10px] sm:text-xs md:text-sm text-gray-400 dark:text-gray-500 font-extralight tracking-wide mt-0.5 sm:mt-0">
          Track all your government status checks
        </CardDescription>
      </div>
    </div>
  </div>
</CardHeader>

    <CardContent className="p-4 sm:p-5 md:p-6 pt-0">
{/* ─── Check Filter Buttons ────────────────────────────────────── */}
<div className="mb-3 flex flex-wrap items-center gap-1.5">
  {checkFilterButtons.map(({ key, label, count }) => (
    <button
      key={key}
      type="button"
      onClick={() => setCheckFilter(key)}
      className={`
        px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[7px] sm:text-[10px] font-medium transition-all duration-200 border whitespace-nowrap
        ${checkFilter === key
          ? 'bg-[#0A3269] text-white border-[#0A3269]'
          : 'bg-white dark:bg-black/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-[#0A3269]/30 dark:hover:border-white/20'
        }
      `}
    >
      <span className="whitespace-nowrap">{label}</span>
      <span className="opacity-60 ml-0.5 sm:ml-1">({count})</span>
    </button>
  ))}
  {checkFilter !== 'all' && (
    <button
      type="button"
      onClick={() => setCheckFilter('all')}
      className="px-1.5 sm:px-2 py-0.5 rounded-full text-[7px] sm:text-[10px] text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
    >
      <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
    </button>
  )}
</div>
>>>>>>> 0bb91c2 (tmmt update frontend)

      {/* ─── Content ────────────────────────────────────────────────── */}
      {checksLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 sm:h-24 rounded-xl bg-gray-100/60 dark:bg-white/5" />
            </div>
          ))}
        </div>
      ) : filteredChecks.length === 0 ? (
        <div className="border border-dashed border-gray-200/60 dark:border-white/10 rounded-xl py-12 sm:py-16 text-center">
          <ClipboardCheck className="text-[#0A3269] dark:text-white mx-auto mb-4 h-14 w-14 sm:h-16 sm:w-16 opacity-30" />
          <h3 className="text-gray-900 dark:text-white mb-2 text-lg sm:text-xl font-light">
            {checks.length === 0 ? 'No checks yet' : 'No checks match filter'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4 px-4 text-sm sm:text-base font-light max-w-md mx-auto">
            {checks.length === 0
              ? 'Start your first government status check today'
              : 'Try changing your filter to see more checks'}
          </p>
          {checks.length === 0 && (
            <Button
              className="w-full sm:w-auto bg-[#0A3269] hover:bg-[#1A4A8A] rounded-xl text-white transition-colors duration-300 h-10 sm:h-11 px-5 sm:px-6 text-sm sm:text-base font-light"
              onClick={() => navigate('/services')}
            >
              <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Start a Check
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredChecks.map((check) => (
              <CheckCard
                key={check._id || check.id}
                check={{
                  id: check._id || check.id,
                  serviceId: check.serviceId,
                  serviceType: check.serviceType,
                  status: check.status,
                  speedTier: check.speedTier,
                  documents: check.documents || [],
                  identifiers: check.identifiers || {},
                  result: check.result,
                  createdAt: check.createdAt,
                  updatedAt: check.updatedAt,
                }}
                onViewResult={(check) => {
                  toast.info('Viewing check result...');
                }}
                onDownloadDocument={(doc) => {
                  toast.info('Downloading document...');
                }}
                onDelete={(checkId) => {
                  setChecks(prev => prev.filter(c => (c._id || c.id) !== checkId));
                  toast.success('Check deleted successfully');
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </CardContent>
  </Card>
)}
{/* ─── APPLICATIONS VIEW ────────────────────────────────────────────── */}
{dataView === 'applications' && (
<<<<<<< HEAD
  <Card id="applications-section" className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-black/40 backdrop-blur-sm scroll-mt-20">
    <CardHeader className="flex flex-col items-start justify-between gap-4 p-4 sm:p-5 md:p-6">
      <div className="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <div className="flex h-9 w-9 sm:h-8 sm:w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-[#0A3269]/5 dark:bg-white/5 border border-[#0A3269]/10 dark:border-white/10">
            <ClipboardList className="h-5 w-5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-[#0A3269] dark:text-white/80" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="flex flex-wrap items-center gap-1.5 text-base sm:text-lg md:text-xl font-thin tracking-wide text-gray-700 dark:text-gray-200">
              Your Applications
              <Badge className="bg-[#0A3269]/5 text-[#0A3269]/70 dark:bg-white/5 dark:text-white/60 border-0 text-[11px] sm:text-[10px] md:text-[11px] font-light px-2.5 py-1 rounded-full">
                {filteredApplications.length}
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm sm:text-xs md:text-sm text-gray-400 dark:text-gray-500 font-extralight tracking-wide mt-0.5 sm:mt-0">
              Track and manage all your visa applications
            </CardDescription>
          </div>
        </div>
        <Button
          className="w-full sm:w-auto bg-[#0A3269] hover:bg-[#1a2a4a] rounded-xl text-white transition-colors duration-300 h-10 sm:h-9 md:h-10 px-5 sm:px-4 md:px-5 text-sm sm:text-sm md:text-base font-light tracking-wide"
          onClick={() => setShowStartApplication(true)}
        >
          <Plus className="mr-2 h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5" />
          Create Application
        </Button>
      </div>
    </CardHeader>

    <CardContent className="p-4 sm:p-5 md:p-6 pt-0">
      {/* ─── Application Filter Buttons ──────────────────────────────── */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {appFilterButtons.map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            onClick={() => setAppFilter(key)}
            className={`
              px-3 py-1.5 rounded-full text-[10px] font-medium transition-all duration-200 border
              ${appFilter === key
                ? 'bg-[#0A3269] text-white border-[#0A3269]'
                : 'bg-white dark:bg-black/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-[#0A3269]/30 dark:hover:border-white/20'
              }
            `}
          >
            {label} ({count})
          </button>
        ))}
        {appFilter !== 'all' && (
          <button
            type="button"
            onClick={() => setAppFilter('all')}
            className="px-2 py-0.5 rounded-full text-[10px] text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <XCircle className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ─── Content ────────────────────────────────────────────────── */}
      {filteredApplications.length === 0 ? (
        <div className="border border-dashed border-gray-200/60 dark:border-white/10 rounded-2xl py-12 sm:py-16 text-center">
          <ClipboardList className="text-[#0A3269] dark:text-white mx-auto mb-4 h-14 w-14 sm:h-16 sm:w-16 opacity-30" />
          <h3 className="text-gray-900 dark:text-white mb-2 text-lg sm:text-xl font-light">
            {applications.length === 0 ? 'No applications yet' : 'No applications match filter'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4 px-4 text-sm sm:text-base font-light max-w-md mx-auto">
            {applications.length === 0
              ? 'Start your first visa application today!'
              : 'Try changing your filter to see more applications.'}
          </p>
          {applications.length === 0 && (
            <Button
              className="w-full sm:w-auto bg-[#0A3269] hover:bg-[#1a2a4a] rounded-xl text-white transition-colors duration-300 h-10 sm:h-11 px-5 sm:px-6 text-sm sm:text-base font-light"
              onClick={() => setShowStartApplication(true)}
            >
              <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Create Application
            </Button>
          )}
        </div>
=======
 <Card id="applications-section" className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-black/40 backdrop-blur-sm scroll-mt-20">
  <CardHeader className="flex flex-col items-start justify-between gap-3 sm:gap-4 p-3 sm:p-4 md:p-6">
    <div className="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <div className="flex h-8 w-8 sm:h-8 sm:w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-[#0A3269]/5 dark:bg-white/5 border border-[#0A3269]/10 dark:border-white/10">
          <ClipboardList className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 text-[#0A3269] dark:text-white/80" />
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="flex flex-wrap items-center gap-1.5 text-sm sm:text-base md:text-xl font-thin tracking-wide text-gray-700 dark:text-gray-200">
            Your Applications
            <Badge className="bg-[#0A3269]/5 text-[#0A3269]/70 dark:bg-white/5 dark:text-white/60 border-0 text-[10px] sm:text-[10px] md:text-[11px] font-light px-2 py-0.5 rounded-full">
              {filteredApplications.length}
            </Badge>
          </CardTitle>
          <CardDescription className="text-[10px] sm:text-xs md:text-sm text-gray-400 dark:text-gray-500 font-extralight tracking-wide mt-0.5 sm:mt-0">
            Track and manage all your visa applications
          </CardDescription>
        </div>
      </div>
    
    </div>
  </CardHeader>

    <CardContent className="p-4 sm:p-5 md:p-6 pt-0">
{/* ─── Application Filter Buttons ──────────────────────────────── */}
<div className="mb-3 flex flex-wrap items-center gap-1.5">
  {appFilterButtons.map(({ key, label, count }) => (
    <button
      key={key}
      type="button"
      onClick={() => setAppFilter(key)}
      className={`
        px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[7px] sm:text-[10px] font-medium transition-all duration-200 border whitespace-nowrap
        ${appFilter === key
          ? 'bg-[#0A3269] text-white border-[#0A3269]'
          : 'bg-white dark:bg-black/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-[#0A3269]/30 dark:hover:border-white/20'
        }
      `}
    >
      <span className="whitespace-nowrap">{label}</span>
      <span className="opacity-60 ml-0.5 sm:ml-1">({count})</span>
    </button>
  ))}
  {appFilter !== 'all' && (
    <button
      type="button"
      onClick={() => setAppFilter('all')}
      className="px-1.5 sm:px-2 py-0.5 rounded-full text-[7px] sm:text-[10px] text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
    >
      <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
    </button>
  )}
</div>
{/* ─── Content ────────────────────────────────────────────────── */}
{filteredApplications.length === 0 ? (
  <div className="border border-dashed border-gray-200/60 dark:border-white/10 rounded-2xl py-6 sm:py-8 md:py-10 text-center">
    <ClipboardList className="text-[#0A3269] dark:text-white mx-auto mb-2 sm:mb-3 h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 opacity-30" />
    <h4 className="text-gray-900 dark:text-white mb-1 sm:mb-1.5 text-sm sm:text-base md:text-lg font-light">
      {applications.length === 0 ? 'No applications yet' : 'No applications match'}
    </h4>
    <p className="text-gray-500 dark:text-gray-400 mb-2 sm:mb-3 px-3 sm:px-4 text-[10px] sm:text-xs md:text-sm font-light max-w-md mx-auto">
      {applications.length === 0
        ? 'Start your first visa application today!'
        : 'Try changing your filter to see more applications.'}
    </p>
    {applications.length === 0 && (
      <Button
        className="w-full sm:w-auto bg-[#0A3269] hover:bg-[#1a2a4a] rounded-xl text-white transition-colors duration-300 h-8 sm:h-9 md:h-10 px-3 sm:px-4 md:px-5 text-[10px] sm:text-xs md:text-sm font-light"
        onClick={() => setShowStartApplication(true)}
      >
        <Plus className="mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
        Create Application
      </Button>
    )}
  </div>
>>>>>>> 0bb91c2 (tmmt update frontend)
      ) : (
        <div className="space-y-4 sm:space-y-5">
          <AnimatePresence mode="popLayout">
            {filteredApplications.map((app: any) => {
              const appId = app._id || app.id;
              const canDelete = userDetails?.role === 'amer' || userDetails?.role === 'admin';
              const handleDelete = async () => {
                try {
                  const token = localStorage.getItem('authToken');
                  if (!token) throw new Error('Not authenticated');
                  const response = await fetch(`${apiBase}/api/v1/visa/${appId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to delete application');
                  }
                  await fetchApplications();
                  toast.success('Application deleted successfully');
                } catch (error: any) {
                  toast.error(error.message || 'You do not have permission to delete this application.');
                }
              };
              return (
                <ExpandedApplicationCard
                  key={appId}
                  application={app}
                  isExpanded={expandedApplicationIds.has(appId)}
                  onToggle={() => {
                    setExpandedApplicationIds(prev => {
                      const newSet = new Set(prev);
                      if (newSet.has(appId)) newSet.delete(appId);
                      else newSet.add(appId);
                      return newSet;
                    });
                  }}
                  onDocumentView={(doc) => handleViewResultDocument(doc, app)}
                  onDocumentDownload={(doc) => handleDocumentDownload(doc, app)}
                  canDelete={canDelete}
                  onDelete={canDelete ? handleDelete : undefined}
                />
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </CardContent>
  </Card>
)}
    {/* ─── PACKAGES VIEW ────────────────────────────────────────────── */}
{dataView === 'packages' && (
  <Card className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-black/40 backdrop-blur-sm">
    <CardHeader className="flex flex-col items-start justify-between gap-4 p-4 sm:p-5 md:p-6">
      <div className="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <div className="flex h-9 w-9 sm:h-8 sm:w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-[#0A3269]/5 dark:bg-white/5 border border-[#0A3269]/10 dark:border-white/10">
            <Package className="h-5 w-5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-[#0A3269] dark:text-white/80" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="flex flex-wrap items-center gap-1.5 text-base sm:text-lg md:text-xl font-thin tracking-wide text-gray-700 dark:text-gray-200">
              Your Packages
              <Badge className="bg-[#0A3269]/5 text-[#0A3269]/70 dark:bg-white/5 dark:text-white/60 border-0 text-[11px] sm:text-[10px] md:text-[11px] font-light px-2.5 py-1 rounded-full">
                {filteredPackages.length}
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm sm:text-xs md:text-sm text-gray-400 dark:text-gray-500 font-extralight tracking-wide mt-0.5 sm:mt-0">
              View all your package applications
            </CardDescription>
          </div>
        </div>
<<<<<<< HEAD
        <Button
          className="w-full sm:w-auto bg-[#0A3269] hover:bg-[#1a2a4a] rounded-xl text-white transition-colors duration-300 h-10 sm:h-9 md:h-10 px-5 sm:px-4 md:px-5 text-sm sm:text-sm md:text-base font-light tracking-wide"
          onClick={() => navigate('/packages')}
        >
          <Plus className="mr-2 h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5" />
          Browse Packages
        </Button>
=======
      
>>>>>>> 0bb91c2 (tmmt update frontend)
      </div>
    </CardHeader>

    <CardContent className="p-4 sm:p-5 md:p-6 pt-0">
<<<<<<< HEAD
      {/* ─── Package Filter ────────────────────────────────────────── */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {[
          { key: 'all', label: 'All' },
          { key: 'submitted', label: 'Submitted' },
          { key: 'processing', label: 'Processing' },
          { key: 'completed', label: 'Completed' },
          { key: 'cancelled', label: 'Cancelled' },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setPackageFilter(key as any)}
            className={`
              px-3 py-1.5 rounded-full text-[10px] font-medium transition-all duration-200 border
              ${packageFilter === key
                ? 'bg-[#0A3269] text-white border-[#0A3269]'
                : 'bg-white dark:bg-black/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-[#0A3269]/30 dark:hover:border-white/20'
              }
            `}
          >
            {label} (
            {key === 'all'
              ? packageApps.length
              : packageApps.filter(p => p.status === key).length}
            )
          </button>
        ))}
        {packageFilter !== 'all' && (
          <button
            type="button"
            onClick={() => setPackageFilter('all')}
            className="px-2 py-0.5 rounded-full text-[10px] text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <XCircle className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ─── Content ────────────────────────────────────────────────── */}
      {packageLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 sm:h-24 rounded-xl bg-gray-100/60 dark:bg-white/5" />
            </div>
          ))}
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="border border-dashed border-gray-200/60 dark:border-white/10 rounded-xl py-12 sm:py-16 text-center">
          <Package className="text-[#0A3269] dark:text-white mx-auto mb-4 h-14 w-14 sm:h-16 sm:w-16 opacity-30" />
          <h3 className="text-gray-900 dark:text-white mb-2 text-lg sm:text-xl font-light">
            {packageApps.length === 0 ? 'No packages yet' : 'No packages match filter'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4 px-4 text-sm sm:text-base font-light max-w-md mx-auto">
            {packageApps.length === 0
              ? 'Explore our packages and start your journey'
              : 'Try changing your filter to see more packages'}
          </p>
          {packageApps.length === 0 && (
            <Button
              className="w-full sm:w-auto bg-[#0A3269] hover:bg-[#1a2a4a] rounded-xl text-white transition-colors duration-300 h-10 sm:h-11 px-5 sm:px-6 text-sm sm:text-base font-light"
              onClick={() => navigate('/packages')}
            >
              <Package className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Explore Packages
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredPackages.map((pkg) => (
              <PackageCard
                key={pkg._id}
                package={pkg}
                onDelete={() => fetchPackages()}
                onRefresh={() => fetchPackages()}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </CardContent>
  </Card>
=======
{/* ─── Package Filter ────────────────────────────────────────── */}
<div className="mb-3 flex flex-wrap items-center gap-1.5">
  {[
    { key: 'all', label: 'All' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'processing', label: 'Processing' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ].map(({ key, label }) => (
    <button
      key={key}
      type="button"
      onClick={() => setPackageFilter(key as any)}
      className={`
        px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[7px] sm:text-[10px] font-medium transition-all duration-200 border whitespace-nowrap
        ${packageFilter === key
          ? 'bg-[#0A3269] text-white border-[#0A3269]'
          : 'bg-white dark:bg-black/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-[#0A3269]/30 dark:hover:border-white/20'
        }
      `}
    >
      <span className="whitespace-nowrap">{label}</span>
      <span className="opacity-60 ml-0.5 sm:ml-1">({key === 'all'
        ? packageApps.length
        : packageApps.filter(p => p.status === key).length})</span>
    </button>
  ))}
  {packageFilter !== 'all' && (
    <button
      type="button"
      onClick={() => setPackageFilter('all')}
      className="px-1.5 sm:px-2 py-0.5 rounded-full text-[7px] sm:text-[10px] text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
    >
      <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
    </button>
  )}
</div>

    {/* ─── Content ────────────────────────────────────────────────── */}
{packageLoading ? (
  <div className="space-y-2">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse">
        <div className="h-16 sm:h-20 rounded-xl bg-gray-100/60 dark:bg-white/5" />
      </div>
    ))}
  </div>
) : filteredPackages.length === 0 ? (
  <div className="border border-dashed border-gray-200/60 dark:border-white/10 rounded-xl py-6 sm:py-8 md:py-10 text-center">
    <Package className="text-[#0A3269] dark:text-white mx-auto mb-2 sm:mb-3 h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 opacity-30" />
    <h3 className="text-gray-900 dark:text-white mb-1 text-sm sm:text-base md:text-lg font-light">
      {packageApps.length === 0 ? 'No packages yet' : 'No packages match filter'}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-2 sm:mb-3 px-3 sm:px-4 text-[10px] sm:text-xs md:text-sm font-light max-w-md mx-auto">
      {packageApps.length === 0
        ? 'Explore our packages and start your journey'
        : 'Try changing your filter to see more packages'}
    </p>
    {packageApps.length === 0 && (
      <Button
        className="w-full sm:w-auto bg-[#0A3269] hover:bg-[#1a2a4a] rounded-xl text-white transition-colors duration-300 h-8 sm:h-9 md:h-10 px-3 sm:px-4 md:px-5 text-[10px] sm:text-xs md:text-sm font-light"
        onClick={() => navigate('/packages')}
      >
        <Package className="mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
        Explore Packages
      </Button>
    )}
  </div>
) : (
  <div className="space-y-2 sm:space-y-3 md:space-y-4">
    <AnimatePresence mode="popLayout">
      {filteredPackages.map((pkg) => (
        <PackageCard
          key={pkg._id}
          package={pkg}
          onDelete={() => fetchPackages()}
          onRefresh={() => fetchPackages()}
        />
      ))}
    </AnimatePresence>
  </div>
)}
</CardContent>
</Card>
>>>>>>> 0bb91c2 (tmmt update frontend)
)}
      {/* ─── EMPTY STATE (When no view is selected) ────────────────────────── */}
      {dataView === null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl border border-gray-200/60 dark:border-white/10 bg-gradient-to-br from-white via-gray-50/50 to-white dark:from-black/60 dark:via-gray-900/30 dark:to-black/60 backdrop-blur-sm p-6 sm:p-10 text-center"
        >
          {/* ─── Background Decorations ────────────────────────────────────────── */}

          {/* ─── Subtle Pattern ────────────────────────────────────────────────── */}
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.01]">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20px 20px, #0A3269 2px, transparent 2px)`,
              backgroundSize: '40px 40px'
            }} />
          </div>

          <div className="relative flex flex-col items-center gap-4">
            {/* ─── Icon with Premium Ring ─────────────────────────────────────── */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#0A3269]/10 dark:bg-[#4A8ABF]/10 blur-xl animate-pulse" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#0A3269]/10 to-[#0A3269]/5 dark:from-[#4A8ABF]/20 dark:to-[#4A8ABF]/10 border border-[#0A3269]/20 dark:border-[#4A8ABF]/20">
                <FileText className="h-7 w-7 text-[#0A3269] dark:text-[#4A8ABF] opacity-60" strokeWidth={1.5} />
              </div>
              {/* ─── Floating Badge ────────────────────────────────────────────── */}
              <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-medium animate-pulse">
                <span>✦</span>
              </div>
            </div>

            {/* ─── Text Content ────────────────────────────────────────────────── */}
            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-normal text-black dark:text-white tracking-tight">
                Select a section to view
              </h3>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto font-light leading-relaxed">
                Click on <span className="font-medium text-[#0A3269] dark:text-[#4A8ABF]">Checks</span>, <span className="font-medium text-[#0A3269] dark:text-[#4A8ABF]">Applications</span>, or <span className="font-medium text-[#0A3269] dark:text-[#4A8ABF]">Packages</span> to see your data
              </p>
            </div>

            {/* ─── Action Buttons ─────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-0.5">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setDataView('checks')}
                className="group relative overflow-hidden flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A3269] text-white transition-all duration-300 hover:bg-[#1a2a4a]"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <ClipboardCheck className="h-4 w-4 relative z-10" />
                <span className="relative z-10 text-sm font-normal">View Checks</span>
                <ArrowRight className="h-3.5 w-3.5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setDataView('applications')}
                className="group relative overflow-hidden flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-black/40 text-gray-700 dark:text-gray-300 hover:border-[#0A3269]/30 dark:hover:border-[#4A8ABF]/30 hover:bg-white dark:hover:bg-black/60 transition-all duration-300"
              >
                <ClipboardList className="h-4 w-4 relative z-10" />
                <span className="relative z-10 text-sm font-normal">View Applications</span>
                <ArrowRight className="h-3.5 w-3.5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setDataView('packages')}
                className="group relative overflow-hidden flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-black/40 text-gray-700 dark:text-gray-300 hover:border-[#0A3269]/30 dark:hover:border-[#4A8ABF]/30 hover:bg-white dark:hover:bg-black/60 transition-all duration-300"
              >
                <Package className="h-4 w-4 relative z-10" />
                <span className="relative z-10 text-sm font-normal">View Packages</span>
                <ArrowRight className="h-3.5 w-3.5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.button>
            </div>

            {/* ─── Quick Stats ────────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center justify-center gap-5 mt-1 pt-3 border-t border-gray-200/30 dark:border-white/5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0A3269]/10 dark:bg-[#4A8ABF]/10">
                  <ClipboardCheck className="h-3.5 w-3.5 text-[#0A3269] dark:text-[#4A8ABF]" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-light uppercase tracking-wider">Checks</p>
                  <p className="text-sm font-normal text-black dark:text-white">{checks.length}</p>
                </div>
              </div>
              <div className="h-6 w-px bg-gray-200/50 dark:bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0A3269]/10 dark:bg-[#4A8ABF]/10">
                  <ClipboardList className="h-3.5 w-3.5 text-[#0A3269] dark:text-[#4A8ABF]" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-light uppercase tracking-wider">Applications</p>
                  <p className="text-sm font-normal text-black dark:text-white">{applications.length}</p>
                </div>
              </div>
              <div className="h-6 w-px bg-gray-200/50 dark:bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0A3269]/10 dark:bg-[#4A8ABF]/10">
                  <Package className="h-3.5 w-3.5 text-[#0A3269] dark:text-[#4A8ABF]" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-light uppercase tracking-wider">Packages</p>
                  <p className="text-sm font-normal text-black dark:text-white">{packageApps.length}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Government Services & Support - Modern Premium */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        <Card className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A3269]/10 dark:bg-white/10">
                <Building2 className="h-4 w-4 text-[#0A3269] dark:text-white" />
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
                  className="group relative flex flex-col items-start gap-2.5 overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0A3269]/20 dark:hover:border-white/20"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A3269]/10 dark:bg-white/10">
                    <Icon className="h-5 w-5 text-[#0A3269] dark:text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-foreground text-sm font-semibold leading-tight">
                      {label}
                    </p>
                    <p className="text-text-secondary text-[11px] leading-tight">
                      {sub}
                    </p>
                  </div>
                  <ArrowUpRight className="absolute right-3 top-3 h-3.5 w-3.5 text-text-secondary/40 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#0A3269] dark:group-hover:text-white" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A3269]/10 dark:bg-white/10">
                <HelpCircle className="h-4 w-4 text-[#0A3269] dark:text-white" />
              </div>
              Help & Support
            </CardTitle>
            <CardDescription>
              Get assistance when you need it
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/knowledge" className="block">
              <button className="group flex w-full items-center gap-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0A3269]/20 dark:hover:border-white/20">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <BookOpen className="h-4 w-4" />
                </div>
                <span className="text-foreground flex-1 text-sm font-medium">
                  Knowledge Hub
                </span>
                <ArrowRight className="h-4 w-4 text-text-secondary/40 transition-all group-hover:translate-x-0.5 group-hover:text-[#0A3269] dark:group-hover:text-white" />
              </button>
            </Link>
            <button
              onClick={() => toast.info('Opening live chat...')}
              className="group flex w-full items-center gap-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0A3269]/20 dark:hover:border-white/20"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <MessageSquare className="h-4 w-4" />
              </div>
              <span className="text-foreground flex-1 text-sm font-medium">
                Live Chat Support
              </span>
              <ArrowRight className="h-4 w-4 text-text-secondary/40 transition-all group-hover:translate-x-0.5 group-hover:text-[#0A3269] dark:group-hover:text-white" />
            </button>
          <a
  href="tel:+97145551234"
  onClick={(e) => {
    setTimeout(() => {
      if (document.hasFocus()) {
        navigator.clipboard
          .writeText('+971 4 555 1234')
          .then(() => {
            toast.info('Phone number copied to clipboard. Please make the call.');
          })
          .catch(() => {
            toast.info('Please call +971 4 555 1234');
          });
      }
    }, 1500);
  }}
  className="group flex w-full items-center gap-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0A3269]/20 dark:hover:border-white/20"
>
  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
    <Phone className="h-4 w-4" />
  </div>
  <span className="text-foreground flex-1 text-sm font-medium">
    Call Center
  </span>
  <ArrowRight className="h-4 w-4 text-text-secondary/40 transition-all group-hover:translate-x-0.5 group-hover:text-[#0A3269] dark:group-hover:text-white" />
</a>
            <button
onClick={handleEmailClick}
              className="group flex w-full items-center gap-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0A3269]/20 dark:hover:border-white/20"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Mail className="h-4 w-4" />
              </div>
              <span className="text-foreground flex-1 text-sm font-medium">
                Email Support
              </span>
              <ArrowRight className="h-4 w-4 text-text-secondary/40 transition-all group-hover:translate-x-0.5 group-hover:text-[#0A3269] dark:group-hover:text-white" />
            </button>
          </CardContent>
        </Card>
      </div>
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
          <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-2 border-[#0A3269] border-t-transparent sm:h-16 sm:w-16"></div>
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
        className="border-[#0A3269]/10 dark:border-white/5 bg-white/90 dark:bg-black/80 sticky top-0 hidden h-screen shrink-0 border-r backdrop-blur-xl lg:flex lg:flex-col"
        animate={{
          width: isSidebarCollapsed ? 60 : 290,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-between border-b border-[#0A3269]/10 dark:border-white/5 px-4">
          <motion.div
            className="flex items-center gap-3 overflow-hidden"
            animate={{
              width: isSidebarCollapsed ? 40 : 'auto',
            }}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
              {TMMTLogo ? (
                <img
                  src={TMMTLogo}
                  alt="Tammat logo"
                  width={20}
                  height={20}
                  className="h-19 w-25 object-contain dark:brightness-0 dark:invert"
                />
              ) : (
                <Building2 className="h-5 w-5 text-white" />
              )}
            </div>
            <motion.span
              className="text-[#0A3269] dark:text-white whitespace-nowrap text-lg font-semibold tracking-tight"
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
            className="h-8 w-8 shrink-0 rounded-lg hover:bg-[#0A3269]/10 dark:hover:bg-white/10 transition-all duration-300"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 text-[#0A3269] dark:text-white/70" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-[#0A3269] dark:text-white/70" />
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
                          border-[#0A3269]/20 dark:border-white/20
                          text-[#0A3269] dark:text-white
                        `
                        : `
                          border-transparent
                          text-muted-foreground
                          hover:border-[#0A3269]/20 dark:hover:border-white/20
                          hover:bg-[#0A3269]/5 dark:hover:bg-white/5
                          hover:text-[#0A3269] dark:hover:text-white
                        `
                    }
                  `}
                >
                  {/* Active Indicator - Premium Bar */}
                  <div
                    className={`
                      absolute left-0 top-1/2 -translate-y-1/2
                      h-8 w-1 rounded-r-full transition-all duration-500
                      ${
                        isActiveTab(key as TabKey)
                          ? "bg-[#0A3269] dark:bg-white"
                          : "bg-transparent group-hover:bg-[#0A3269]/30 dark:group-hover:bg-white/20"
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
                            ? "text-[#0A3269] dark:text-white"
                            : "text-muted-foreground group-hover:text-[#0A3269] dark:group-hover:text-white"
                          }
                        `}
                      />
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
                        absolute -bottom-0.5 left-0 h-0.5 w-0 bg-[#0A3269] dark:bg-white
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
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0A3269] dark:bg-white opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0A3269] dark:bg-white" />
                      </span>
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            </button>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="border-[#0A3269]/10 dark:border-white/5 space-y-3 border-t p-3">
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
      <main className="min-w-0 flex-1 pb-20 lg:pb-0">
        {/* ─── Sticky Header ──────────────────────────────────────────────── */}
        <div className="sticky top-0 z-20 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-gray-100/50 dark:border-white/5">
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-2.5">
            {/* ─── Left Section: Avatar + Name + Status ────────────────────── */}
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <div className="relative">
                <Avatar className="h-8 w-8 border-2 border-gray-200/50 dark:border-gray-700/50 sm:h-10 sm:w-10 md:h-11 md:w-11 transition-all duration-300 hover:border-[#0A3269]/30 dark:hover:border-white/30">
                  <AvatarImage src={userDetails?.avatar} />
                  <AvatarFallback className="bg-[#0A3269] text-white text-[10px] sm:text-xs font-light">
                    {userDetails?.firstName?.[0]}
                    {userDetails?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="min-w-0">
                <h3 className="flex items-center gap-1.5 truncate text-xs sm:text-sm md:text-base font-light text-gray-900 dark:text-white">
                  <span className="hidden xxs:inline text-gray-500 dark:text-gray-400">Welcome back,</span>
                  <span className="xxs:hidden">Hi</span>
                  <span className="truncate font-medium">{userDetails?.firstName || user?.name || 'User'}</span>
                  <span className="text-gray-400 dark:text-gray-500 font-light">!</span>
                </h3>

                <p className="flex items-center gap-1 text-[9px] xs:text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-light leading-tight">
                  {approvedApplications > 0 ? (
                    <>
                      <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                        <Check className="h-2 w-2" />
                      </span>
                      <span>You have </span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">{approvedApplications}</span>
                      <span> approved application{approvedApplications > 1 ? 's' : ''}</span>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#0A3269]/10 text-[#0A3269]">
                        <Rocket className="h-2 w-2" />
                      </span>
                      <span>Start your journey with TMMT today</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* ─── Right Section: Badges ────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0A3269] text-white">
                <Crown className="h-3 w-3 text-yellow-400" />
                <span className="text-[9px] sm:text-[10px] font-light tracking-wide">Level {userLevel}</span>
              </div>

              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <Sparkles className="h-2.5 w-2.5" />
                <span className="text-[9px] sm:text-[10px] font-light tracking-wide">{rewardPoints.toLocaleString()} pts</span>
              </div>

              {/* Quick action button */}
              <button
                onClick={() => setShowStartApplication(true)}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full border border-gray-200/50 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-300 text-[9px] sm:text-[10px] font-light text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Plus className="h-2.5 w-2.5" />
                New
              </button>
            </div>
          </div>
        </div>

        {/* ─── Content Area ────────────────────────────────────────────────── */}
        <div className="space-y-6 p-3 sm:space-y-8 sm:p-4 md:space-y-10 md:p-6 lg:p-8">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="bg-white/95 dark:bg-black/95 border-[#0A3269]/10 dark:border-white/5 fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t px-2 py-2 backdrop-blur-xl lg:hidden">
        {NAV_ITEMS.slice(0, 4).map(({ path, label, icon: Icon, key }) => (
          <button
            key={key}
            onClick={() => handleNavigate(path)}
            className="flex-1 relative group"
          >
            <div
              className={`flex w-full flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] transition-all duration-200 ${
                isActiveTab(key as TabKey)
                  ? 'text-[#0A3269] dark:text-white font-semibold'
                  : 'text-text-secondary hover:text-foreground'
              }`}
            >
              {isActiveTab(key as TabKey) && (
                <motion.div
                  layoutId="mobile-tab-indicator"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-[#0A3269]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`h-5 w-5 ${isActiveTab(key as TabKey) ? 'text-[#0A3269] dark:text-white' : ''}`} />
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
                <Card className="rounded-xl border border-gray-200/70 dark:border-white/10">
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
                          className={getStatusConfig(selectedApplication.status).bg}
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
                <Card className="rounded-xl border border-gray-200/70 dark:border-white/10">
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
                    <Card className="rounded-xl border border-gray-200/70 dark:border-white/10">
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
                                  <FileText className="h-4 w-4 shrink-0 text-[#0A3269] dark:text-white" />
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
                    <Card className="rounded-xl border border-gray-200/70 dark:border-white/10">
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
                                <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#0A3269] dark:bg-white" />
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