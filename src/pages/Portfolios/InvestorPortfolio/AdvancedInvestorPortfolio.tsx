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
  Gem,
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
  Command,
  Radio,
  Activity,
  BarChart3,
  DollarSign,
  Percent,
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

import ProfilePage from './ProfilePage';
import DocumentPage from './DocumentPage';
import CompliancePage from './CompliancePage';
import GuideSubmissionSuccess from './GuideSubmissionSuccess';

// ─── Modern Design Tokens ──────────────────────────────────────────────
const COLORS = {
  primary: '#14235E',
  primaryLight: '#1a4a7a',
  primaryDark: '#0e1a4a',
  primaryBg: '#14235E08',
  primaryBorder: '#14235E20',
  teal: '#0d9488',
  tealBg: '#0d948808',
  amber: '#d97706',
  amberBg: '#d9770608',
  violet: '#7c3aed',
  violetBg: '#7c3aed08',
  rose: '#e11d48',
  roseBg: '#e11d4808',
  emerald: '#059669',
  emeraldBg: '#05966908',
  slate: '#64748b',
  slateBg: '#64748b08',
  cream: '#d4c9b3',
  surface: '#f8fafc',
  surfaceDark: '#0c0c14',
  border: '#e2e8f0',
  borderDark: '#1e1e2a',
  text: '#0f172a',
  textSecondary: '#64748b',
  textDark: '#f1f5f9',
  textSecondaryDark: '#94a3b8',
};

// ─── Navigation ─────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'General',
    items: [
      { path: '/user/dashboard', label: 'Dashboard', icon: LayoutDashboard, key: 'dashboard' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { path: '/user/documents', label: 'Documents', icon: FolderOpen, key: 'documents' },
      { path: '/investor/compliance', label: 'Compliance', icon: Shield, key: 'compliance' },
    ],
  },
  {
    label: 'Account',
    items: [
      { path: '/user/profile', label: 'Profile', icon: User, key: 'profile' },
    ],
  },
  {
    label: 'Guide',
    items: [
      { path: '/investor/success', label: 'Guide Submission', icon: BookOpen, key: 'guide-submission' },
    ],
  },
];

const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

const GOV_SERVICES = [
  { key: 'mohre', label: 'MOHRE', sub: 'Labour affairs', url: 'https://www.mohre.gov.ae', icon: Building2 },
  { key: 'gdrfa', label: 'GDRFA', sub: 'Residency & entry', url: 'https://www.gdrfad.gov.ae', icon: Shield },
  { key: 'icp', label: 'ICP', sub: 'Identity & citizenship', url: 'https://smartservices.icp.gov.ae', icon: UserCheck },
  { key: 'moh', label: 'MOH', sub: 'Health authority', url: 'https://www.moh.gov.ae', icon: Heart },
];

type TabKey = 'dashboard' | 'documents' | 'compliance' | 'profile' | 'guide-submission';
type CheckFilter = 'all' | 'pending' | 'processing' | 'completed' | 'failed';
type ApplicationFilter = 'all' | 'submitted' | 'under_review' | 'docs_required' | 'approved';
type DataView = 'checks' | 'applications' | 'packages' | null;

// ─── Modern Status Config ─────────────────────────────────────────────
const getStatusConfig = (status: string) => {
  const map: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    approved: {
      icon: CheckCircle,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      label: 'Approved',
    },
    under_review: {
      icon: Clock,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      label: 'Under Review',
    },
    docs_required: {
      icon: AlertCircle,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      label: 'Docs Required',
    },
    submitted: {
      icon: Clock,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      label: 'Submitted',
    },
    pending: {
      icon: Clock,
      color: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-50 dark:bg-slate-950/30',
      label: 'Pending',
    },
    processing: {
      icon: Activity,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/30',
      label: 'Processing',
    },
    completed: {
      icon: Check,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      label: 'Completed',
    },
    failed: {
      icon: XCircle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      label: 'Failed',
    },
    cancelled: {
      icon: XCircle,
      color: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-50 dark:bg-slate-950/30',
      label: 'Cancelled',
    },
  };
  return map[status] || map.pending;
};

const COLORS_CHART = ['#14235E', '#0d9488', '#d97706', '#7c3aed', '#059669', '#64748b'];

const AdvancedInvestorPortfolio = () => {
  const { t } = useTranslation();
  const { signOut, user } = useAuth();
  const { applications, userDetails, stats, loading, fetchApplications } = useApplications();
  const { applications: packageApps, loading: packageLoading, fetchApplications: fetchPackages } = usePackageAdmin({ mine: true });

  useEffect(() => {
    fetchPackages();
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = (path: string): TabKey => {
    if (path.includes('/user/documents')) return 'documents';
    if (path.includes('/investor/compliance')) return 'compliance';
    if (path.includes('/user/profile')) return 'profile';
    if (path === '/success' || path === '/investor/success') return 'guide-submission';
    return 'dashboard';
  };

  const handleEmailClick = () => {
    const email = 'support@tammat.ae';
    window.location.href = `mailto:${email}`;
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
  const [selectedApplication, setSelectedApplication] = useState<EnhancedVisaApplication | null>(null);
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

  const [checkFilter, setCheckFilter] = useState<CheckFilter>('all');
  const [appFilter, setAppFilter] = useState<ApplicationFilter>('all');
  const [packageFilter, setPackageFilter] = useState<'all' | 'submitted' | 'processing' | 'completed' | 'cancelled'>('all');
  const [dataView, setDataView] = useState<DataView>(null);

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  const primaryColor = '#14235E';

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
    toast.info(`Showing ${urgentApplications.length} application(s) requiring documents`, { duration: 2000 });
    setTimeout(() => {
      const applicationsSection = document.getElementById('applications-section');
      if (applicationsSection) {
        applicationsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
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

  const STAT_CARDS = [
    { key: 'total', label: 'Total Applications', value: stats.total || 0, icon: FileText, trend: '+12%', up: true, accent: COLORS.primary },
    { key: 'under_review', label: 'In Progress', value: stats.under_review || 0, icon: Clock, trend: '+5%', up: true, accent: COLORS.slate },
    { key: 'approved', label: 'Approved', value: stats.approved || 0, icon: CheckCircle, trend: '+18%', up: true, accent: COLORS.teal },
    { key: 'docs_required', label: 'Pending Action', value: stats.docs_required || 0, icon: AlertCircle, trend: '-3%', up: false, accent: COLORS.amber },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const checkFilterButtons = [
    { key: 'all', label: 'All', count: checks.length },
    { key: 'pending', label: 'Pending', count: checks.filter(c => c.status === 'pending').length },
    { key: 'processing', label: 'Processing', count: checks.filter(c => c.status === 'processing').length },
    { key: 'completed', label: 'Completed', count: checks.filter(c => c.status === 'completed').length },
    { key: 'failed', label: 'Failed', count: checks.filter(c => c.status === 'failed').length },
  ];

  const appFilterButtons = [
    { key: 'all', label: 'All', count: applications.length },
    { key: 'submitted', label: 'Submitted', count: applications.filter(a => a.status === 'submitted').length },
    { key: 'under_review', label: 'Under Review', count: applications.filter(a => a.status === 'under_review').length },
    { key: 'docs_required', label: 'Docs Required', count: applications.filter(a => a.status === 'docs_required').length },
    { key: 'approved', label: 'Approved', count: applications.filter(a => a.status === 'approved').length },
  ];

  const pillBtnClass = (active: boolean) => `
    px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border
    ${active
      ? 'bg-[#14235E] text-white border-[#14235E] shadow-sm'
      : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-[#14235E]/40 hover:text-[#14235E] dark:hover:text-white'
    }
  `;

  // ─── Dashboard Content ──────────────────────────────────────────────
  const DashboardContent = () => (
    <div className="space-y-6">
      {/* Urgent Banner */}
      {urgentApplications.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-xl border border-amber-200/60 dark:border-amber-800/30 bg-amber-50/70 dark:bg-amber-950/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {urgentApplications.length} Action{urgentApplications.length > 1 ? 's' : ''} Required
                </p>
                <p className="text-xs text-amber-700/70 dark:text-amber-300/60">Documents needed for your applications</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleViewAllUrgent}
              className="border-amber-300/60 dark:border-amber-700/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-900/30 rounded-xl w-full sm:w-auto"
            >
              View All
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STAT_CARDS.map(({ key, label, value, icon: Icon, trend, up, accent }, i) => (
          <motion.div key={key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div className="relative overflow-hidden rounded-2xl border border-gray-200/60 dark:border-white/5 bg-white dark:bg-[#0c0c14] p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5">
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: accent }} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">{label}</p>
                  <p className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className={`text-xs font-medium ${up ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {up ? '↑' : '↓'} {trend}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">vs last month</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <Card className="md:col-span-2 rounded-2xl border border-gray-200/60 dark:border-white/5 bg-white dark:bg-[#0c0c14]">
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">Application Trend</CardTitle>
    <CardDescription className="text-xs text-gray-400 dark:text-gray-500">Monthly application activity</CardDescription>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData.monthlyTrend}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#14235E" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#14235E" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke={isDarkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}
          opacity={isDarkMode ? 0.6 : 0.3}
        />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: isDarkMode ? '#f1f5f9' : '#94a3b8' }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={30}
          tick={{ fontSize: 10, fill: isDarkMode ? '#f1f5f9' : '#94a3b8' }}
        />
        <Tooltip
          contentStyle={{
            background: isDarkMode ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
            border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '8px 12px',
            fontSize: '12px',
            color: isDarkMode ? '#f1f5f9' : '#0f172a',
          }}
          labelStyle={{ color: isDarkMode ? '#f1f5f9' : '#0f172a' }}
          formatter={(value) => [`${value} applications`, 'Total']}
        />
        <Area
          type="monotone"
          dataKey="applications"
          stroke="#14235E"
          strokeWidth={2.5}
          fill="url(#trendFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
<Card className="rounded-2xl border border-gray-200/60 dark:border-white/5 bg-white dark:bg-[#0c0c14]">
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">Status Distribution</CardTitle>
    <CardDescription className="text-xs text-gray-400 dark:text-gray-500">Application status breakdown</CardDescription>
  </CardHeader>
  <CardContent>
    {chartData.statusDistribution.length > 0 ? (
      <>
        <div className="relative mx-auto w-full max-w-[180px]">
          <ResponsiveContainer width="100%" height={160}>
            <RechartsPie>
              <Pie
                data={chartData.statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={68}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.statusDistribution.map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS_CHART[idx % COLORS_CHART.length]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: isDarkMode ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
                  border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: isDarkMode ? '#f1f5f9' : '#0f172a',
                }}
                labelStyle={{ color: isDarkMode ? '#f1f5f9' : '#0f172a' }}
                formatter={(value, name) => [`${value} apps`, name]}
              />
            </RechartsPie>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-[9px] font-light text-gray-400 dark:text-gray-400">Total</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {chartData.statusDistribution.reduce((s, i) => s + i.value, 0)}
            </p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {chartData.statusDistribution.map((item, idx) => (
            <div key={item.name} className="flex items-center gap-1.5 text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COLORS_CHART[idx % COLORS_CHART.length] }} />
              <span className="truncate text-gray-600 dark:text-gray-300">{item.name}</span>
              <span className="ml-auto font-medium text-gray-900 dark:text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </>
    ) : (
      <div className="py-8 text-center">
        <PieChartIcon className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600" />
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-400">No data</p>
      </div>
    )}
  </CardContent>
</Card> 
      </div>

      {/* Data View Toggles */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: 'checks', icon: ClipboardCheck, label: 'Checks', count: checks.length },
          { key: 'applications', icon: ClipboardList, label: 'Applications', count: applications.length },
          { key: 'packages', icon: Package, label: 'Packages', count: packageApps.length },
        ].map(({ key, icon: Icon, label, count }) => (
          <button
            key={key}
            onClick={() => setDataView(dataView === key as DataView ? null : key as DataView)}
            className={`
              flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all border
              ${dataView === key
                ? 'bg-[#14235E] text-white border-[#14235E] shadow-sm'
                : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-[#14235E]/40 hover:text-[#14235E]'
              }
            `}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${dataView === key ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'}`}>
              {count}
            </span>
          </button>
        ))}
        {dataView && (
          <button onClick={() => setDataView(null)} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-2 py-1">
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Checks View */}
      {dataView === 'checks' && (
        <Card className="rounded-2xl border border-gray-200/60 dark:border-white/5 bg-white dark:bg-[#0c0c14]">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#14235E]/10">
                <ClipboardCheck className="h-4 w-4 text-[#14235E]" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">Your Checks</CardTitle>
                <CardDescription className="text-xs text-gray-400 dark:text-gray-500">{filteredChecks.length} total</CardDescription>
              </div>
            </div>
            <Button className="bg-[#14235E] hover:bg-[#1a4a7a] rounded-xl text-white h-9 px-4 text-sm" onClick={() => navigate('/customer-dashboard')}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> New Check
            </Button>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {checkFilterButtons.map(({ key, label, count }) => (
                <button key={key} onClick={() => setCheckFilter(key as CheckFilter)} className={pillBtnClass(checkFilter === key)}>
                  {label} <span className="opacity-60">({count})</span>
                </button>
              ))}
            </div>
            {checksLoading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />)}</div>
            ) : filteredChecks.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-gray-200 dark:border-white/5 rounded-xl">
                <ClipboardCheck className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 opacity-30" />
                <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">No checks found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredChecks.map(check => (
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
                    onViewResult={() => toast.info('Viewing result...')}
                    onDownloadDocument={() => toast.info('Downloading...')}
                    onDelete={(id) => { setChecks(prev => prev.filter(c => (c._id || c.id) !== id)); toast.success('Deleted'); }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Applications View */}
      {dataView === 'applications' && (
        <Card id="applications-section" className="rounded-2xl border border-gray-200/60 dark:border-white/5 bg-white dark:bg-[#0c0c14] scroll-mt-20">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#14235E]/10">
                <ClipboardList className="h-4 w-4 text-[#14235E]" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">Your Applications</CardTitle>
                <CardDescription className="text-xs text-gray-400 dark:text-gray-500">{filteredApplications.length} total</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {appFilterButtons.map(({ key, label, count }) => (
                <button key={key} onClick={() => setAppFilter(key as ApplicationFilter)} className={pillBtnClass(appFilter === key)}>
                  {label} <span className="opacity-60">({count})</span>
                </button>
              ))}
            </div>
            {filteredApplications.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-gray-200 dark:border-white/5 rounded-xl">
                <ClipboardList className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 opacity-30" />
                <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">No applications found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app: any) => {
                  const appId = app._id || app.id;
                  const canDelete = userDetails?.role === 'amer' || userDetails?.role === 'admin';
                  const handleDelete = async () => {
                    try {
                      const token = localStorage.getItem('authToken');
                      if (!token) throw new Error('Not authenticated');
                      const res = await fetch(`${apiBase}/api/v1/visa/${appId}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      if (!res.ok) throw new Error('Failed to delete');
                      await fetchApplications();
                      toast.success('Application deleted');
                    } catch (error: any) {
                      toast.error(error.message || 'Permission denied');
                    }
                  };
                  return (
                    <ExpandedApplicationCard
                      key={appId}
                      application={app}
                      isExpanded={expandedApplicationIds.has(appId)}
                      onToggle={() => setExpandedApplicationIds(prev => {
                        const newSet = new Set(prev);
                        newSet.has(appId) ? newSet.delete(appId) : newSet.add(appId);
                        return newSet;
                      })}
                      onDocumentView={(doc) => handleViewResultDocument(doc, app)}
                      onDocumentDownload={(doc) => handleDocumentDownload(doc, app)}
                      canDelete={canDelete}
                      onDelete={canDelete ? handleDelete : undefined}
                    />
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Packages View */}
      {dataView === 'packages' && (
        <Card className="rounded-2xl border border-gray-200/60 dark:border-white/5 bg-white dark:bg-[#0c0c14]">
          <CardHeader className="flex flex-row items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#14235E]/10">
                <Package className="h-4 w-4 text-[#14235E]" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">Your Packages</CardTitle>
                <CardDescription className="text-xs text-gray-400 dark:text-gray-500">{filteredPackages.length} total</CardDescription>
              </div>
            </div>
            <Button className="bg-[#14235E] hover:bg-[#1a4a7a] rounded-xl text-white h-9 px-4 text-sm" onClick={() => navigate('/packages')}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Browse
            </Button>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {['all','submitted','processing','completed','cancelled'].map(key => (
                <button key={key} onClick={() => setPackageFilter(key as any)} className={pillBtnClass(packageFilter === key)}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  <span className="opacity-60 ml-0.5">({key === 'all' ? packageApps.length : packageApps.filter(p => p.status === key).length})</span>
                </button>
              ))}
            </div>
            {packageLoading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />)}</div>
            ) : filteredPackages.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-gray-200 dark:border-white/5 rounded-xl">
                <Package className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 opacity-30" />
                <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">No packages found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPackages.map(pkg => (
                  <PackageCard key={pkg._id} package={pkg} onDelete={fetchPackages} onRefresh={fetchPackages} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {dataView === null && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-gray-200/60 dark:border-white/5 bg-white dark:bg-[#0c0c14] p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#14235E]/10 blur-xl animate-pulse" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#14235E]/10">
                <FileText className="h-7 w-7 text-[#14235E] opacity-80" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Select a section to view</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Click Checks, Applications, or Packages to see your data</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {[
                { key: 'checks', icon: ClipboardCheck, label: 'View Checks' },
                { key: 'applications', icon: ClipboardList, label: 'View Applications' },
                { key: 'packages', icon: Package, label: 'View Packages' },
              ].map(({ key, icon: Icon, label }) => (
                <button key={key} onClick={() => setDataView(key as DataView)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#14235E] text-white text-sm font-medium hover:bg-[#1a4a7a] transition">
                  <Icon className="h-4 w-4" /> {label} <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-6 pt-3 border-t border-gray-200/30 dark:border-white/5">
              {[
                { label: 'Checks', value: checks.length, icon: ClipboardCheck },
                { label: 'Applications', value: applications.length, icon: ClipboardList },
                { label: 'Packages', value: packageApps.length, icon: Package },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#14235E]/10">
                    <Icon className="h-3.5 w-3.5 text-[#14235E]" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Government Services & Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-2xl border border-gray-200/60 dark:border-white/5 bg-white dark:bg-[#0c0c14]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <Building2 className="h-4 w-4 text-[#14235E]" /> Government Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2.5">
              {GOV_SERVICES.map(({ key, label, sub, url, icon: Icon }) => (
                <button key={key} onClick={() => window.open(url, '_blank')} className="group flex flex-col items-start gap-2 p-3 rounded-xl border border-gray-200/60 dark:border-white/5 bg-white dark:bg-white/2 hover:border-[#14235E]/40 hover:-translate-y-0.5 transition-all">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#14235E]/10"><Icon className="h-4 w-4 text-[#14235E]" /></div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">{sub}</p>
                  <ArrowUpRight className="h-3 w-3 text-gray-400 self-end" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

 <Card className="rounded-2xl border border-gray-200/60 dark:border-white/[0.06] bg-white dark:bg-[#12121c]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#64748b]/10 border border-[#64748b]/25">
                <HelpCircle className="h-4 w-4 text-[#64748b]" />
              </div>
              Help & Support
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Get assistance when you need it
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/knowledge" className="block">
              <button className="group flex w-full items-center gap-3 rounded-xl border border-gray-200/60 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#64748b]/40">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#64748b]/10 text-[#64748b]">
                  <BookOpen className="h-4 w-4" />
                </div>
                <span className="text-gray-900 dark:text-white flex-1 text-sm font-medium">
                  Knowledge Hub
                </span>
                <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-600 transition-all group-hover:translate-x-0.5 group-hover:text-[#64748b]" />
              </button>
            </Link>
            <button
              onClick={() => toast.info('Opening live chat...')}
              className="group flex w-full items-center gap-3 rounded-xl border border-gray-200/60 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0d9488]/40"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0d9488]/10 text-[#0d9488]">
                <MessageSquare className="h-4 w-4" />
              </div>
              <span className="text-gray-900 dark:text-white flex-1 text-sm font-medium">
                Live Chat Support
              </span>
              <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-600 transition-all group-hover:translate-x-0.5 group-hover:text-[#0d9488]" />
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
              className="group flex w-full items-center gap-3 rounded-xl border border-gray-200/60 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#7c3aed]/40"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#7c3aed]/10 text-[#7c3aed]">
                <Phone className="h-4 w-4" />
              </div>
              <span className="text-gray-900 dark:text-white flex-1 text-sm font-medium">
                Call Center
              </span>
              <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-600 transition-all group-hover:translate-x-0.5 group-hover:text-[#7c3aed]" />
            </a>
            <button
              onClick={handleEmailClick}
              className="group flex w-full items-center gap-3 rounded-xl border border-gray-200/60 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d97706]/40"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#d97706]/10 text-[#d97706]">
                <Mail className="h-4 w-4" />
              </div>
              <span className="text-gray-900 dark:text-white flex-1 text-sm font-medium">
                Email Support
              </span>
              <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-600 transition-all group-hover:translate-x-0.5 group-hover:text-[#d97706]" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'documents': return <DocumentPage />;
      case 'compliance': return <CompliancePage />;
      case 'profile': return <ProfilePage />;
      case 'guide-submission': return <GuideSubmissionSuccess />;
      default: return <DashboardContent />;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50 dark:bg-[#0a0a0f]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-[#14235E] border-t-transparent" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const isActiveTab = (tabKey: TabKey) => activeTab === tabKey;

  return (
    <div className="bg-gray-50/50 dark:bg-[#0a0a0f] flex min-h-screen">
      {/* ─── Sidebar ────────────────────────────────────────────────────── */}
      <motion.aside
        className="sticky top-0 hidden h-screen shrink-0 border-r border-gray-200/60 dark:border-white/5 bg-white dark:bg-[#0a0a0f] lg:flex lg:flex-col"
        animate={{ width: isSidebarCollapsed ? 60 : 272 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200/60 dark:border-white/5 px-4">
          <motion.div className="flex items-center gap-2.5 overflow-hidden" animate={{ width: isSidebarCollapsed ? 36 : 'auto' }}>
            <img src={TMMTLogo} alt="TMMT" className="h-9 w-9 object-contain dark:brightness-0 dark:invert" />
            <motion.div animate={{ opacity: isSidebarCollapsed ? 0 : 1, width: isSidebarCollapsed ? 0 : 'auto' }} transition={{ duration: 0.2 }}>
              <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">TMMT Portal</p>
            </motion.div>
          </motion.div>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4 text-gray-400" /> : <ChevronLeft className="h-4 w-4 text-gray-400" />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="space-y-5 px-2.5 py-5">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="space-y-1">
                <motion.p className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500" animate={{ opacity: isSidebarCollapsed ? 0 : 1, height: isSidebarCollapsed ? 0 : 'auto' }}>
                  {group.label}
                </motion.p>
                {group.items.map(({ path, label, icon: Icon, key }) => (
                  <button key={key} onClick={() => handleNavigate(path)} className="w-full group relative block">
                    <div className={`
                      relative flex h-10 w-full items-center gap-3 overflow-hidden rounded-xl px-3 transition-all duration-300
                      ${isActiveTab(key as TabKey)
                        ? 'bg-[#14235E]/10 text-[#14235E] border border-[#14235E]/30'
                        : 'text-gray-500 dark:text-gray-400 border border-transparent hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}>
                      <Icon className={`h-[18px] w-[18px] shrink-0 ${isActiveTab(key as TabKey) ? 'text-[#14235E]' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                      <motion.span className="overflow-hidden whitespace-nowrap text-[13px] font-medium" animate={{ opacity: isSidebarCollapsed ? 0 : 1, width: isSidebarCollapsed ? 0 : 'auto' }} transition={{ duration: 0.2 }}>
                        {label}
                      </motion.span>
                      {isActiveTab(key as TabKey) && !isSidebarCollapsed && (
                        <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="ml-auto flex h-1.5 w-1.5 rounded-full bg-[#14235E]" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </nav>

          {!isSidebarCollapsed && (
            <div className="px-4 pb-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Status</p>
              {[
                { label: 'Total', value: totalApplications, color: '#14235E' },
                { label: 'Approved', value: approvedApplications, color: '#0d9488' },
                { label: 'Under Review', value: stats.under_review || 0, color: '#64748b' },
                { label: 'Docs Required', value: stats.docs_required || 0, color: '#d97706' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-white/5 last:border-0">
                  <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} /><span className="text-xs text-gray-600 dark:text-gray-400">{s.label}</span></div>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">{s.value}</span>
                </div>
              ))}
              <p className="mt-4 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Collections</p>
              {[
                { label: 'Checks', value: checks.length, color: '#7c3aed' },
                { label: 'Applications', value: applications.length, color: '#14235E' },
                { label: 'Packages', value: packageApps.length, color: '#d4c9b3' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-white/5 last:border-0">
                  <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} /><span className="text-xs text-gray-600 dark:text-gray-400">{s.label}</span></div>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">{s.value}</span>
                </div>
              ))}
            </div>
          )}

          {!isSidebarCollapsed && (
            <div className="mx-3 mb-4 rounded-xl border border-gray-200/60 dark:border-white/5 bg-gray-50 dark:bg-white/2 p-3">
              <div className="flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Sync</p><Radio className="h-3 w-3 text-emerald-500" /></div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${(loading || checksLoading || packageLoading) ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="text-[11px] text-gray-600 dark:text-gray-400">{(loading || checksLoading || packageLoading) ? 'Syncing...' : 'Up to date'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200/60 dark:border-white/5 p-2.5 space-y-2">
          <button onClick={toggleDarkMode} className="group flex h-10 w-full items-center gap-3 rounded-xl px-3 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition">
            {isDarkMode ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            <motion.span className="text-[13px] font-medium" animate={{ opacity: isSidebarCollapsed ? 0 : 1, width: isSidebarCollapsed ? 0 : 'auto' }} transition={{ duration: 0.2 }}>
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </motion.span>
          </button>
          <button onClick={signOut} className="group flex h-10 w-full items-center gap-3 rounded-xl px-3 text-rose-500 dark:text-rose-400/80 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition">
            <LogOut className="h-[18px] w-[18px] shrink-0 transition-transform group-hover:-translate-x-0.5" />
            <motion.span className="text-[13px] font-medium" animate={{ opacity: isSidebarCollapsed ? 0 : 1, width: isSidebarCollapsed ? 0 : 'auto' }} transition={{ duration: 0.2 }}>
              Logout
            </motion.span>
          </button>
        </div>
      </motion.aside>

      {/* ─── Main Content ──────────────────────────────────────────────── */}
      <main className="min-w-0 flex-1 pb-20 lg:pb-0">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/90 dark:bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/5">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <p className="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">TMMT Portal <ChevronRight className="h-3 w-3" /> Overview</p>
              <h4 className="truncate text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                Welcome, <span className="text-[#14235E]">{userDetails?.firstName || user?.name || 'User'}</span>
              </h4>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="hidden xs:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#14235E] text-white">
                <Crown className="h-3 w-3 text-amber-200" /><span className="text-[9px] sm:text-[10px] font-medium">Level {userLevel}</span>
              </div>
              <div className="hidden xs:flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#14235E] to-[#1a4a7a] text-white">
                <Sparkles className="h-2.5 w-2.5" /><span className="text-[9px] sm:text-[10px] font-medium">{rewardPoints.toLocaleString()} pts</span>
              </div>
              <button onClick={() => setShowStartApplication(true)} className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full border border-gray-200/60 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
                <Plus className="h-3 w-3" /> New
              </button>
              <button onClick={toggleDarkMode} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200/60 dark:border-white/5 lg:hidden hover:bg-gray-50 dark:hover:bg-white/5 transition">
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button className="relative flex h-8 w-8 items-center justify-center rounded-full border border-gray-200/60 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                <BellRing className="h-4 w-4 text-gray-400" />
                {urgentApplications.length > 0 && <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />}
              </button>
              <Avatar className="h-8 w-8 border border-gray-200/60 dark:border-white/10">
                <AvatarImage src={userDetails?.avatar} />
                <AvatarFallback className="bg-[#14235E] text-white text-[10px] font-medium">
                  {userDetails?.firstName?.[0]}{userDetails?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div className="px-4 pb-2 sm:px-6">
            <p className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
              {approvedApplications > 0 ? (
                <><span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#0d9488]/10 text-[#0d9488]"><Check className="h-2.5 w-2.5" /></span> You have <span className="font-medium text-[#0d9488]">{approvedApplications}</span> approved application{approvedApplications > 1 ? 's' : ''}</>
              ) : (
                <><span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#14235E]/10 text-[#14235E]"><Rocket className="h-2.5 w-2.5" /></span> Start your journey with TMMT today</>
              )}
            </p>
          </div>
        </div>

        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </div>
      </main>

      {/* ─── Mobile Bottom Nav ────────────────────────────────────────── */}
      <nav className="bg-white/95 dark:bg-[#0a0a0f]/95 border-t border-gray-200/60 dark:border-white/5 fixed inset-x-0 bottom-0 z-30 flex items-center justify-around px-2 py-2 backdrop-blur-xl lg:hidden">
        {NAV_ITEMS.slice(0, 4).map(({ path, label, icon: Icon, key }) => (
          <button key={key} onClick={() => handleNavigate(path)} className="flex-1 relative group">
            <div className={`flex w-full flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] transition ${isActiveTab(key as TabKey) ? 'text-[#14235E] font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
              {isActiveTab(key as TabKey) && <motion.div layoutId="mobile-tab" className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-[#14235E]" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
              <Icon className={`h-5 w-5 ${isActiveTab(key as TabKey) ? 'text-[#14235E]' : ''}`} />
              <span className="text-[10px]">{label}</span>
            </div>
          </button>
        ))}
      </nav>

      {/* ─── Dialogs ────────────────────────────────────────────────────── */}
      <Dialog open={showApplicationDetails} onOpenChange={setShowApplicationDetails}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-4xl overflow-y-auto rounded-2xl border-gray-200 dark:border-white/10 bg-white dark:bg-[#0c0c14]">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle className="flex flex-wrap items-center gap-2 text-gray-900 dark:text-white">
                  {(() => { const config = getStatusConfig(selectedApplication.status); const Icon = config.icon; return <Icon className={`h-5 w-5 ${config.color}`} />; })()}
                  <span>{selectedApplication.applicationType.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                  <Badge className={`${getStatusConfig(selectedApplication.status).bg} ${getStatusConfig(selectedApplication.status).color} border-0`}>{getStatusConfig(selectedApplication.status).label}</Badge>
                </DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-gray-400">Application ID: {selectedApplication.id}</DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-6">
                <Card><CardHeader><CardTitle className="text-sm font-semibold">Details</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div><Label className="text-gray-500">Type</Label><p className="font-medium text-gray-900 dark:text-white">{selectedApplication.applicationType.replace(/_/g, ' ')}</p></div>
                  <div><Label className="text-gray-500">Status</Label><Badge className={`${getStatusConfig(selectedApplication.status).bg} ${getStatusConfig(selectedApplication.status).color} border-0`}>{getStatusConfig(selectedApplication.status).label}</Badge></div>
                  <div><Label className="text-gray-500">Created</Label><p className="font-medium text-gray-900 dark:text-white">{new Date(selectedApplication.createdAt).toLocaleDateString()}</p></div>
                  <div><Label className="text-gray-500">Updated</Label><p className="font-medium text-gray-900 dark:text-white">{new Date(selectedApplication.updatedAt).toLocaleDateString()}</p></div>
                </CardContent></Card>
                {selectedApplication.attachments?.length > 0 && (
                  <Card><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><FileText className="h-4 w-4" /> Documents ({selectedApplication.attachments.length})</CardTitle></CardHeader><CardContent className="space-y-2">
                    {selectedApplication.attachments.map((doc: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-200/60 dark:border-white/5">
                        <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-gray-400" /><span className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.filename || doc.originalName || 'Document'}</span></div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleViewResultDocument(doc, selectedApplication)}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDocumentDownload(doc, selectedApplication)}><Download className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </CardContent></Card>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {showStartApplication && <StartApplicationDialog open={showStartApplication} onOpenChange={setShowStartApplication} queryParams="" />}
      <LiveChatWidget />
    </div>
  );
};

export default AdvancedInvestorPortfolio;