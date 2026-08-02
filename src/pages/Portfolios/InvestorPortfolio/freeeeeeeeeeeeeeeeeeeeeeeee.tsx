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
  BarChart3,
  PieChart as PieChartIcon,
  User,
  History,
  ShieldCheck,
  Menu,
  X,
  ArrowUpRight,
  ArrowRight,
  LayoutDashboard,
  FolderOpen,
  LogOut,
  Moon,
  Sun,
  Globe,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useApplications,
  type EnhancedVisaApplication,
} from '@/hooks/useApplications';
import { useAuth } from '@/contexts/AuthContext';
import StartApplicationDialog from '@/components/Applications/StartApplicationDialog';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { Link, useLocation } from 'react-router-dom';
import ExpandedApplicationCard from '@/components/ApplicationCard/ExpandedApplicationCard';
import LiveChatWidget from '@/components/LiveChat/LiveChatWidget';

// Modern Navigation Items with icons
const NAV_ITEMS = [
  { to: '/user/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/user/documents', label: 'Documents', icon: FolderOpen },
  { to: '/investor/compliance', label: 'Compliance', icon: Shield },
  { to: '/user/profile', label: 'Profile', icon: User },
];

const GOV_SERVICES = [
  {
    key: 'mohre',
    label: 'MOHRE',
    sub: 'Labour affairs',
    url: 'https://www.mohre.gov.ae',
    icon: Building2,
    gradient: 'from-primary to-primary/70',
  },
  {
    key: 'gdrfa',
    label: 'GDRFA',
    sub: 'Residency & entry',
    url: 'https://www.gdrfad.gov.ae',
    icon: Shield,
    gradient: 'from-emerald-500 to-emerald-400',
  },
  {
    key: 'icp',
    label: 'ICP',
    sub: 'Identity & citizenship',
    url: 'https://smartservices.icp.gov.ae',
    icon: UserCheck,
    gradient: 'from-violet-500 to-violet-400',
  },
  {
    key: 'moh',
    label: 'MOH',
    sub: 'Health authority',
    url: 'https://www.moh.gov.ae',
    icon: Heart,
    gradient: 'from-rose-500 to-rose-400',
  },
];

const AdvancedInvestorPortfolio = () => {
  const { t } = useTranslation();
  const { signOut, user } = useAuth();
  const { applications, userDetails, stats, loading, fetchApplications } =
    useApplications();
  const pathname = useLocation();
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

  // Toggle dark mode
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
      const fileUrl = `${apiBase}/uploads/applications/${app?._id || app?.id}/${doc.path}`;
      if (!fileUrl) {
        toast.error('Document URL not available');
        return;
      }
      window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('View error:', error);
      toast.error(t('errors.general'));
    }
  };

  // Calculate user level and rewards (gamification)
  const totalApplications = stats.total || 0;
  const approvedApplications = stats.approved || 0;
  const userLevel = Math.min(5, Math.floor(approvedApplications / 3) + 1);
  const rewardPoints = approvedApplications * 50 + totalApplications * 10;

  // Get applications that need attention
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
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-50 dark:bg-green-950/30',
          border: 'border-green-200 dark:border-green-800/50',
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
          color: 'text-orange-600 dark:text-orange-400',
          bg: 'bg-orange-50 dark:bg-orange-950/30',
          border: 'border-orange-200 dark:border-orange-800/50',
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

  // Chart data for analytics
  const chartData = {
    statusDistribution: Object.entries(stats)
      .filter(([key]) => key !== 'total')
      .map(([status, count]) => ({
        name: status.replace('_', ' ').toUpperCase(),
        value: count,
      }))
      .filter(item => item.value > 0),
    monthlyTrend: [
      { month: 'Jan', applications: 12 },
      { month: 'Feb', applications: 19 },
      { month: 'Mar', applications: 15 },
      { month: 'Apr', applications: 22 },
      { month: 'May', applications: 18 },
      { month: 'Jun', applications: 25 },
    ],
  };

  const COLORS = [
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7300',
    '#0088fe',
    '#00c49f',
  ];

  const STAT_CARDS = [
    {
      key: 'total',
      label: 'Total',
      value: stats.total || 0,
      icon: FileText,
      iconWrap: 'bg-primary/10 text-primary',
      cardClass: 'border-primary/20',
    },
    {
      key: 'under_review',
      label: 'In Progress',
      value: stats.under_review || 0,
      icon: Clock,
      iconWrap: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      cardClass: 'border-blue-200/70 dark:border-blue-800/40 bg-gradient-to-br from-blue-50/60 to-transparent dark:from-blue-950/20',
    },
    {
      key: 'approved',
      label: 'Approved',
      value: stats.approved || 0,
      icon: CheckCircle,
      iconWrap: 'bg-green-500/10 text-green-600 dark:text-green-400',
      cardClass: 'border-green-200/70 dark:border-green-800/40 bg-gradient-to-br from-green-50/60 to-transparent dark:from-green-950/20',
    },
    {
      key: 'docs_required',
      label: 'Pending',
      value: stats.docs_required || 0,
      icon: AlertCircle,
      iconWrap: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
      cardClass: 'border-orange-200/70 dark:border-orange-800/40 bg-gradient-to-br from-orange-50/60 to-transparent dark:from-orange-950/20',
    },
  ];

  if (loading) {
    return (
      <div className="from-surface-light to-background flex min-h-screen items-center justify-center bg-gradient-to-br px-4">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-2 border-t-transparent sm:h-16 sm:w-16"></div>
          <p className="text-text-secondary text-base sm:text-lg">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  const isActive = (path: string) => pathname.pathname === path;

  return (
    <div className="bg-background flex min-h-screen">
      {/* Modern Desktop Sidebar */}
      <motion.aside
        className="border-primary/10 bg-background/95 sticky top-0 hidden h-screen shrink-0 border-r backdrop-blur-xl lg:flex lg:flex-col"
        animate={{
          width: isSidebarCollapsed ? 80 : 260,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-between border-b border-primary/10 px-4">
          <motion.div
            className="flex items-center gap-3 overflow-hidden"
            animate={{
              width: isSidebarCollapsed ? 40 : 'auto',
            }}
          >
   <div className="bg-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-lg shadow-primary/25">
  <Building2 className="h-5 w-5 text-white" />
</div>
            <motion.span
              className="text-foreground whitespace-nowrap text-lg font-semibold tracking-tight"
              initial={{ opacity: 0, width: 0 }}
              animate={{
                opacity: isSidebarCollapsed ? 0 : 1,
                width: isSidebarCollapsed ? 0 : 'auto',
              }}
              transition={{ duration: 0.2 }}
            >
              Investor Portal
            </motion.span>
          </motion.div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-lg"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-3 py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
               <Button
  variant="ghost"
  className={`
    group relative h-12 w-full overflow-hidden rounded-2xl px-3
    justify-start border transition-all duration-300 ease-out

    ${
      isActive(to)
        ? `
          border-[var(--primary)]/20
          bg-gradient-to-r
          from-[var(--primary)]
          via-[var(--primary)]/90
          to-[var(--primary)]/80
          text-white
          shadow-[0_10px_35px_rgba(0,0,0,0.12)]
          shadow-primary/30
        `
        : `
          border-transparent
          text-muted-foreground
          hover:border-primary/15
          hover:bg-primary/8
          hover:text-foreground
          hover:shadow-lg
          hover:shadow-primary/10
          hover:-translate-y-0.5
        `
    }
  `}
>
  {/* Glow */}
  {isActive(to) && (
    <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-transparent to-transparent" />
  )}

  {/* Active Indicator */}
  <div
    className={`
      absolute left-0 top-1/2 -translate-y-1/2
      h-7 w-1 rounded-full transition-all duration-300
      ${
        isActive(to)
          ? "bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
          : "bg-transparent"
      }
    `}
  />

  {/* Icon */}
  <Icon
    className={`
      relative z-10 h-5 w-5 shrink-0 transition-all duration-300
      ${isActive(to) ? "text-white" : "group-hover:scale-110"}
    `}
  />

  {/* Text */}
  <motion.span
    className="relative z-10 ml-3 overflow-hidden whitespace-nowrap font-medium"
    initial={{ opacity: 0, width: 0 }}
    animate={{
      opacity: isSidebarCollapsed ? 0 : 1,
      width: isSidebarCollapsed ? 0 : "auto",
    }}
    transition={{ duration: 0.2 }}
  >
    {label}
  </motion.span>
</Button>
              </motion.div>
            </Link>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="border-primary/10 space-y-2 ">
 

          {/* User Profile */}
          <motion.div
            className="flex items-center gap-3 rounded-xl border border-primary/10 bg-primary/5 p-2"
            animate={{
              padding: isSidebarCollapsed ? '8px' : '8px 12px',
            }}
          >
            <Avatar className="border-primary/30 h-9 w-9 shrink-0 border-2">
              <AvatarImage src={userDetails?.avatar} />
              <AvatarFallback className="bg-primary text-sm font-bold text-white">
                {userDetails?.firstName?.[0]}
                {userDetails?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <motion.div
              className="min-w-0 overflow-hidden"
              initial={{ opacity: 0, width: 0 }}
              animate={{
                opacity: isSidebarCollapsed ? 0 : 1,
                width: isSidebarCollapsed ? 0 : 'auto',
              }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-foreground truncate text-sm font-medium">
                {userDetails?.firstName || user?.name || 'User'}
              </p>
              <p className="text-text-secondary truncate text-xs">
                {userDetails?.role || 'User'}
              </p>
            </motion.div>
          </motion.div>

          {/* Logout */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="ghost"
              className="w-full justify-start rounded-xl text-red-500/70 hover:bg-red-500/10 hover:text-red-500"
              onClick={signOut}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <motion.span
                className="ml-3 overflow-hidden whitespace-nowrap"
                initial={{ opacity: 0, width: 0 }}
                animate={{
                  opacity: isSidebarCollapsed ? 0 : 1,
                  width: isSidebarCollapsed ? 0 : 'auto',
                }}
                transition={{ duration: 0.2 }}
              >
                Logout
              </motion.span>
            </Button>
          </motion.div>
        </div>
      </motion.aside>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
              className="bg-background fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col border-r p-6 shadow-2xl lg:hidden"
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-xl shadow-lg shadow-primary/25">
                    <Building2 className="text-primary-foreground h-5 w-5" />
                  </div>
                  <span className="text-foreground text-lg font-semibold">
                    Investor Portal
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setMobileNavOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex-1 space-y-1.5">
                {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to} onClick={() => setMobileNavOpen(false)}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start rounded-xl font-medium ${
                        isActive(to)
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                          : 'text-foreground/70 hover:bg-primary/10 hover:text-foreground'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {label}
                    </Button>
                  </Link>
                ))}
              </nav>
              <div className="border-primary/10 space-y-2 border-t pt-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-xl text-foreground/70 hover:bg-primary/10 hover:text-foreground"
                  onClick={toggleDarkMode}
                >
                  {isDarkMode ? (
                    <Sun className="mr-3 h-5 w-5" />
                  ) : (
                    <Moon className="mr-3 h-5 w-5" />
                  )}
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-xl text-red-500/70 hover:bg-red-500/10 hover:text-red-500"
                  onClick={signOut}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="min-w-0 flex-1 pb-24 lg:pb-0">
        {/* Header */}
        <div className="border-primary/10 bg-background/80 sticky top-0 z-20 border-b backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-full lg:hidden"
                onClick={() => setMobileNavOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Avatar className="border-primary/30 h-10 w-10 shrink-0 border-2 sm:h-12 sm:w-12">
                <AvatarImage src={userDetails?.avatar} />
                <AvatarFallback className="bg-primary text-sm font-bold text-white">
                  {userDetails?.firstName?.[0]}
                  {userDetails?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h3 className="text-foreground truncate text-base font-medium sm:text-xl">
                  Welcome, {userDetails?.firstName || user?.name || 'User'}!
                </h3>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <Badge className="bg-primary/10 text-primary border-primary/30 text-[11px] sm:text-xs">
                    <Crown className="mr-1 h-3 w-3" />
                    Level {userLevel}
                  </Badge>
                  <Badge className="border-amber-300 bg-amber-100 text-[11px] text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300 sm:text-xs">
                    <Sparkles className="mr-1 h-3 w-3" />
                    {rewardPoints} pts
                  </Badge>
                </div>
              </div>
            </div>

            {/* New Application */}
            <Button
              className="bg-primary hover:bg-primary/90 shrink-0 rounded-xl text-white shadow-lg shadow-primary/25"
              onClick={() => setShowStartApplication(true)}
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('applications.newApplication')}</span>
            </Button>
          </div>
        </div>

        <div className="space-y-6 p-4 sm:space-y-8 sm:p-6">
          {/* Urgent Actions */}
          {urgentApplications.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-orange-200 bg-orange-50/80 dark:border-orange-900/40 dark:bg-orange-950/20 rounded-2xl shadow-sm">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40">
                      <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-orange-900 dark:text-orange-200">
                        {urgentApplications.length} Action
                        {urgentApplications.length > 1 ? 's' : ''} Required
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-300/80">
                        Documents needed for your applications
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-900/30 w-full rounded-lg sm:w-auto"
                  >
                    View All
                    <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {STAT_CARDS.map(({ key, label, value, icon: Icon, iconWrap, cardClass }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-black/50 ${cardClass}`}>
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-text-secondary truncate text-xs font-medium sm:text-sm">
                          {label}
                        </p>
                        <p className="text-foreground mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                          {value}
                        </p>
                      </div>
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${iconWrap}`}>
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Applications List */}
          <Card className="rounded-2xl bg-white shadow-sm dark:bg-black/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                  <FileText className="text-primary h-4 w-4" />
                </div>
                Your Applications
              </CardTitle>
              <CardDescription>
                Track and manage all your visa applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="border-primary/20 rounded-2xl border border-dashed py-12 text-center">
                  <FileText className="text-primary mx-auto mb-4 h-14 w-14 opacity-30 sm:h-16 sm:w-16" />
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    No applications yet
                  </h3>
                  <p className="text-text-secondary mb-4 px-4">
                    Start your first visa application today!
                  </p>
                  <Button
                    className="bg-primary hover:bg-primary/90 rounded-xl text-white shadow-lg shadow-primary/25"
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

          {/* Immigration Status Checks */}
          <Card className="rounded-2xl bg-white shadow-sm dark:bg-black/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                  <ShieldCheck className="text-primary h-4 w-4" />
                </div>
                Immigration Status Checks
              </CardTitle>
              <CardDescription>Your submitted status check inquiries</CardDescription>
            </CardHeader>
            <CardContent>
              {checksLoading ? (
                <div className="py-8 text-center">
                  <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
                </div>
              ) : checks.length === 0 ? (
                <div className="border-primary/20 rounded-2xl border border-dashed py-12 text-center">
                  <ShieldCheck className="text-primary mx-auto mb-4 h-12 w-12 opacity-30" />
                  <p className="text-text-secondary mb-2 font-semibold">No checks submitted yet</p>
                  <p className="text-text-secondary px-4 text-sm">Use the services above to submit a status check</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {checks.map((check: any) => {
                    const statusMap: Record<string, { label: string; color: string; bg: string }> = {
                      pending_payment: { label: 'Pending Payment', color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900/40' },
                      submitted: { label: 'Submitted', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/40' },
                      processing: { label: 'Processing', color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-900/40' },
                      reviewing: { label: 'Under Review', color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/40' },
                      completed: { label: 'Completed', color: 'text-green-700 dark:text-green-400', bg: 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900/40' },
                      requires_documents: { label: 'Docs Required', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/40' },
                      cancelled: { label: 'Cancelled', color: 'text-gray-700 dark:text-gray-400', bg: 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800' },
                    };
                    const s = statusMap[check.status] || statusMap.submitted;
                    return (
                      <div
                        key={check._id}
                        className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${s.bg}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/60 dark:bg-black/30">
                            <ShieldCheck className={`h-4 w-4 ${s.color}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold">{check.serviceType}</p>
                            <p className="text-muted-foreground text-xs">
                              {new Date(check.createdAt).toLocaleDateString()} · {check.isFreeService ? 'Free' : `AED ${check.amount}`}
                            </p>
                            {check.requestedDocuments?.some((d: any) => !d.fulfilledAt) && (
                              <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">⚠ Documents requested by officer</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-row items-center justify-between gap-2 sm:flex-col sm:items-end">
                          <Badge className={`text-xs ${s.color} border ${s.bg}`}>{s.label}</Badge>
                          {check.status === 'completed' && check.resultSummary && (
                            <p className="max-w-[200px] truncate text-right text-xs text-green-700 dark:text-green-400">{check.resultSummary}</p>
                          )}
                          {check.resultDocuments?.length > 0 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 rounded-lg text-xs text-green-700 dark:text-green-400"
                              onClick={() =>
                                window.open(
                                  `${import.meta.env.VITE_API_BASE_URL}/uploads/checks/${check._id}/results/${check.resultDocuments[0].filename}`,
                                  '_blank'
                                )
                              }
                            >
                              <Download className="mr-1 h-3 w-3" /> View Result
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analytics Charts */}
          {applications.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
              <Card className="border-primary/20 rounded-2xl bg-white shadow-sm dark:bg-black/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <PieChartIcon className="text-primary h-5 w-5" />
                    Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {chartData.statusDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <RechartsPie>
                        <Pie
                          data={chartData.statusDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {chartData.statusDistribution.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPie>
                    </ResponsiveContainer>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-text-secondary">No data to display</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-primary/20 rounded-2xl bg-white shadow-sm dark:bg-black/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <BarChart3 className="text-primary h-5 w-5" />
                    Application Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData.monthlyTrend}>
                      <defs>
                        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} width={30} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="applications"
                        stroke="#8884d8"
                        strokeWidth={2}
                        fill="url(#trendFill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Services & Support */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            {/* Government Services */}
            <Card className="rounded-2xl bg-white shadow-sm dark:bg-black/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                    <Building2 className="text-primary h-4 w-4" />
                  </div>
                  Government Services
                </CardTitle>
                <CardDescription>
                  Quick links to UAE government portals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {GOV_SERVICES.map(({ key, label, sub, url, icon: Icon, gradient }) => (
                    <button
                      key={key}
                      onClick={() => window.open(url, '_blank')}
                      className="group relative flex flex-col items-start gap-2.5 overflow-hidden rounded-xl border border-border bg-surface-light/40 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-transparent hover:shadow-md dark:bg-white/[0.03]"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm ${gradient}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-foreground text-sm font-semibold leading-tight">
                          {label}
                        </p>
                        <p className="text-text-secondary text-[11px] leading-tight">
                          {sub}
                        </p>
                      </div>
                      <ArrowUpRight className="absolute right-3 top-3 h-3.5 w-3.5 text-text-secondary/40 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Knowledge Hub & Support */}
            <Card className="rounded-2xl bg-white shadow-sm dark:bg-black/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                    <HelpCircle className="text-primary h-4 w-4" />
                  </div>
                  Help & Support
                </CardTitle>
                <CardDescription>
                  Get assistance when you need it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/knowledge" className="block">
                  <button className="group flex w-full items-center gap-3 rounded-xl border border-border bg-surface-light/40 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-transparent hover:shadow-md dark:bg-white/[0.03]">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <FileText className="h-4 w-4" />
                    </div>
                    <span className="text-foreground flex-1 text-sm font-medium">
                      Knowledge Hub
                    </span>
                    <ArrowRight className="h-4 w-4 text-text-secondary/40 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                  </button>
                </Link>
                <button
                  onClick={() => toast.info('Opening live chat...')}
                  className="group flex w-full items-center gap-3 rounded-xl border border-border bg-surface-light/40 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-transparent hover:shadow-md dark:bg-white/[0.03]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <span className="text-foreground flex-1 text-sm font-medium">
                    Live Chat Support
                  </span>
                  <ArrowRight className="h-4 w-4 text-text-secondary/40 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                </button>
                <button
                  onClick={() => (window.location.href = 'tel:+97145551234')}
                  className="group flex w-full items-center gap-3 rounded-xl border border-border bg-surface-light/40 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-transparent hover:shadow-md dark:bg-white/[0.03]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="text-foreground flex-1 text-sm font-medium">
                    Call Center
                  </span>
                  <ArrowRight className="h-4 w-4 text-text-secondary/40 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                </button>
                <button
                  onClick={() => (window.location.href = 'mailto:support@tammat.ae')}
                  className="group flex w-full items-center gap-3 rounded-xl border border-border bg-surface-light/40 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-transparent hover:shadow-md dark:bg-white/[0.03]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="text-foreground flex-1 text-sm font-medium">
                    Email Support
                  </span>
                  <ArrowRight className="h-4 w-4 text-text-secondary/40 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="border-primary/10 bg-background/95 fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t px-2 py-2 backdrop-blur-md lg:hidden">
        {NAV_ITEMS.slice(0, 4).map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="flex-1">
            <button
              className={`flex w-full flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] transition-colors ${
                isActive(to)
                  ? 'text-primary font-semibold'
                  : 'text-text-secondary'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive(to) ? 'text-primary' : ''}`} />
              <span className="text-[10px]">{label}</span>
            </button>
          </Link>
        ))}
      </nav>

      {/* Application Details Dialog */}
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
                {/* Application Overview */}
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
                          <FileText className="text-primary h-4 w-4" />
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
                                className="bg-surface-light flex items-center justify-between gap-2 rounded-lg border p-3 dark:bg-black/30"
                              >
                                <div className="flex min-w-0 items-center gap-2">
                                  <FileText className="text-primary h-4 w-4 shrink-0" />
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
                    <Card className="border-green-200 bg-green-50/30 rounded-xl dark:border-green-900/40 dark:bg-green-950/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg text-green-900 dark:text-green-300">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
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
                                className="flex items-center justify-between gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900/40 dark:bg-green-950/10"
                              >
                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                  <Zap className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-green-900 dark:text-green-300">
                                      {doc.label ||
                                        doc.originalName ||
                                        'Result Document'}
                                    </p>
                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                      <p className="text-xs text-green-700 dark:text-green-400">
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
                                      <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                                        {doc.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex shrink-0 gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30"
                                    onClick={() =>
                                      handleViewResultDocument(doc, selectedApplication)
                                    }
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30"
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
                                <div className="bg-primary mt-2 h-2 w-2 shrink-0 rounded-full" />
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

      {/* Start Application Dialog */}
      {showStartApplication && (
        <StartApplicationDialog
          open={showStartApplication}
          onOpenChange={setShowStartApplication}
          queryParams=""
        />
      )}

      {/* Live Chat Widget */}
      <LiveChatWidget />
    </div>
  );
};

export default AdvancedInvestorPortfolio;