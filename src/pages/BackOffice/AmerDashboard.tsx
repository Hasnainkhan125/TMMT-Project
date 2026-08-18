import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, FileText, Clock, CheckCircle, XCircle, AlertTriangle, Eye,
  UserCheck, FileCheck, Clock3, Shield, Bell, Lock, MoreHorizontal,
  BarChart3, Upload, AlertCircle, Key, Gavel, Send, Activity, Menu,
  Filter as FilterIcon, ChevronDown, ChevronUp, Sparkles, TrendingUp,ShieldCheck,
  Zap, Award, Crown, Star, Plus, MessageCircle, FolderOpen, Search, Package,
  X, LayoutDashboard, Settings, UserCog, ChevronRight, Home,RefreshCw,
  Phone, Mail, Calendar, User, MapPin, Briefcase, LogOut, DollarSign, CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeSelector } from '@/components/ui/ThemeSelector';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useAmerDashboard, type AmerApplication } from '@/hooks/useAmerDashboard';
import { getSocket } from '@/lib/socket';
import { DocumentUploadDialog } from '@/components/AmerDashboard/DocumentUploadDialog';
import { ApplicationDetailsDrawer } from '@/components/AmerDashboard/ApplicationDetailsDrawer';
import { DocumentReviewDialog } from '@/components/AmerDashboard/DocumentReviewDialog';
import ChecksReviewPanel from '@/components/AmerDashboard/ChecksReviewPanel';
import { cn } from '@/lib/utils';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import PackageApplicationsAdmin from './Packageapplicationsadmin';

const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5001';

// ========== CUSTOM HOOKS ==========
// useMediaQuery hook - for responsive design
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
};


// Modern Status Badge Component
const ModernStatusBadge: React.FC<{ status: string; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  const statusConfig: Record<string, { color: string; bg: string; border: string; icon: any }> = {
    draft: { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', icon: FileText },
    submitted: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: Clock },
    under_review: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock3 },
    docs_required: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertTriangle },
    approved: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle },
    rejected: { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', icon: XCircle },
    closed: { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', icon: FileText },
    fraud_detected: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle },
    penalty_issued: { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', icon: Gavel }
  };

  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-medium border',
      sizeClasses,
      config.bg,
      config.color,
      config.border
    )}>
      <Icon className={cn('w-3 h-3', size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5')} />
      {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
};

// Modern Stat Card Component
const StatCard: React.FC<{ 
  icon: any; 
  label: string; 
  value: number; 
  trend?: number;
  gradient?: string;
  onClick?: () => void;
}> = ({ icon: Icon, label, value, trend, gradient = 'from-blue-500 to-blue-600', onClick }) => (
  <motion.div
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    whileTap={{ scale: 0.98 }}
    className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
    onClick={onClick}
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 rounded-full blur-3xl -translate-y-12 translate-x-12`} />
    <div className="p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-emerald-600">
              <TrendingUp className="w-3 h-3" />
              <span>+{trend}%</span>
            </div>
          )}
        </div>
        <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg shadow-blue-500/20`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
      </div>
    </div>
  </motion.div>
);
// Mobile Bottom Navigation - Premium
const MobileBottomNav: React.FC<{
  activeTab: string;
  onTabChange: (tab: string) => void;
  badgeCount?: number;
}> = ({ activeTab, onTabChange, badgeCount = 0 }) => {
  const tabs = [
    { id: 'applications', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'packages', icon: Package, label: 'Packages' },
    { id: 'checks', icon: CheckCircle, label: 'Status Checks' },
    { id: 'profile', icon: UserCog, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#000] backdrop-blur-xl border-t border-gray-200/80 dark:border-[#0A3269]/30 shadow-lg dark:shadow-[#0A3269]/20">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.92 }}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 relative min-w-[56px]',
              activeTab === tab.id 
                ? 'text-[#0A3269] dark:text-white' 
                : 'text-gray-400 dark:text-white/50 hover:text-gray-600 dark:hover:text-white/80'
            )}
          >
            <div className="relative">
              <div className={cn(
                'p-1.5 rounded-lg transition-all duration-200',
                activeTab === tab.id 
                  ? 'bg-[#0A3269]/10 dark:bg-white/20' 
                  : 'bg-transparent'
              )}>
                <tab.icon className={cn(
                  'w-5 h-5 transition-all duration-200',
                  activeTab === tab.id 
                    ? 'text-[#0A3269] dark:text-white scale-110' 
                    : 'text-gray-400 dark:text-white/50'
                )} />
              </div>
              {/* No badge for Cheker – removed */}
            </div>
            <span className={cn(
              'text-[10px] font-medium transition-colors duration-200',
              activeTab === tab.id 
                ? 'text-[#0A3269] dark:text-white font-semibold' 
                : 'text-gray-400 dark:text-white/50'
            )}>
              {tab.label}
            </span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="bottom-nav-indicator"
                className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#0A3269] dark:bg-white"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// Mobile Header Component - Premium
const MobileHeader: React.FC<{
  user: any;
  onMenuToggle: () => void;
  notifications: number;
}> = ({ user, onMenuToggle, notifications }) => (
<div className="sticky top-0 z-40 bg-white dark:bg-[#0A1628] border-b border-gray-200/80 dark:border-[#0A3269]/30 shadow-sm dark:shadow-[#0A3269]/20">
  <div className="flex items-center justify-between px-4 py-3">
    <div className="flex items-center gap-3">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onMenuToggle}
        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#0A3269]/20 transition-colors"
      >
        <Menu className="w-5 h-5 text-gray-700 dark:text-white" />
      </motion.button>
      
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0A3269] shadow-lg shadow-[#0A3269]/25 dark:bg-white dark:shadow-white/20">
            <Crown className="h-4 w-4 text-white dark:text-[#0A3269]" />
          </div>
        </div>
        <div>
          <span className="text-[#0A3269] dark:text-white text-base font-medium">
            TMMT Portal
          </span>
          <p className="text-[10px] text-gray-500 dark:text-white/70">Government Services</p>
        </div>
      </div>
    </div>
      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <Bell className="w-5 h-5 text-gray-600 dark:text-white" />
          {notifications > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
              {notifications > 9 ? '9+' : notifications}
            </span>
          )}
        </motion.button>
        
        <div className="relative">
   <Avatar className="w-8 h-8 ring-2 ring-[#0A3269]/20 dark:ring-white/20">
  <AvatarFallback className="bg-[#0A3269] dark:bg-white text-white dark:text-[#0A3269] text-xs font-medium">
    {(user as any)?.firstName?.[0] || ''}{(user as any)?.lastName?.[0] || ''}
  </AvatarFallback>
</Avatar>
        </div>
      </div>
    </div>
  </div>
);
// Mobile Sidebar - Premium
const MobileSidebar: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onNavigate: (tab: string) => void;
  activeTab?: string;
  onLogout?: () => void;
}> = ({ isOpen, onClose, user, onNavigate, activeTab = 'applications', onLogout }) => {
  const menuItems = [
    { id: 'applications', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'packages', icon: Package, label: 'Package Applications' }, // ✅ changed from 'package-applications' to 'packages'
    { id: 'checks', icon: CheckCircle, label: 'Status Checks' },
    { id: 'fraud', icon: Shield, label: 'Fraud Detection' },
    { id: 'penalties', icon: Gavel, label: 'Penalties' },
    { id: 'otp', icon: Key, label: 'OTP Management' },
    { id: 'statistics', icon: BarChart3, label: 'Statistics' },
    { id: 'conversations', icon: MessageCircle, label: 'Chat' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-[280px] bg-white dark:bg-gray-900 z-50 shadow-2xl shadow-black/20"
          >
            <div className="flex flex-col h-full bg-white/95 dark:bg-[#000]">
              {/* User Info */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10 ring-2 ring-[#0A3269]/20 dark:ring-white/20">
                      <AvatarFallback className="bg-gradient-to-br from-[#fff] to-[#fff] text-black font-medium">
                        {(user as any)?.firstName?.[0] || ''}{(user as any)?.lastName?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {(user as any)?.firstName || ''} {(user as any)?.lastName || ''}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{(user as any)?.email || ''}</p>
                    <Badge className="mt-1 bg-[#0A3269]/10 text-[#0A3269] dark:bg-[#0A3269]/30 dark:text-[#1a4a7a] border-0 text-[10px]">
                      TMMT Portal
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {menuItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                        isActive
                          ? 'bg-[#0A3269] text-white shadow-lg shadow-[#0A3269]/25'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                      )}
                    >
                      <div className={cn(
                        'p-1.5 rounded-lg transition-all duration-200',
                        isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'
                      )}>
                        <item.icon className={cn(
                          'w-4.5 h-4.5 transition-all duration-200',
                          isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                        )} />
                      </div>
                      <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};




// Mobile Application Card - Premium Modern
const MobileApplicationCard: React.FC<{
  application: AmerApplication;
  onPress: () => void;
  onAction: (action: string) => void;
}> = ({ application, onPress, onAction }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-[#0A3269]/30 dark:hover:border-[#0A3269]/30 transition-all duration-300 overflow-hidden"
    >
      {/* Top Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#0A3269] via-[#1A4A8A] to-[#0A3269] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="p-4" onClick={onPress}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              {/* Avatar with FileText Icon - Premium */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A3269] to-[#1A4A8A] flex items-center justify-center shadow-lg shadow-[#0A3269]/25 flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {application.sponsor.firstName} {application.sponsor.lastName}
                </h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{application.sponsor.email}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <ModernStatusBadge status={application.status} size="sm" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Info Chips - Modern */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
            <FileText className="w-3 h-3 text-[#0A3269]" />
            {application.applicationType.replace('_', ' ')}
          </span>
          <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
            <FileCheck className="w-3 h-3 text-[#0A3269]" />
            {application.attachments.length} docs
          </span>
        </div>
      </div>

      {/* Action Sheet - Premium */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="border-t-2 border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-50/50 dark:bg-gray-900/50"
          >
            <div className="p-3 grid grid-cols-3 gap-2">
              {[
                { icon: Eye, label: 'View', action: 'view', color: 'text-[#0A3269]' },
                { icon: Upload, label: 'Upload', action: 'upload', color: 'text-emerald-600' },
                { icon: FileCheck, label: 'Review', action: 'review', disabled: !application.attachments?.length, color: 'text-amber-600' },
                { icon: Key, label: 'OTP', action: 'otp', color: 'text-blue-600' },
                { icon: Shield, label: 'Fraud', action: 'fraud', color: 'text-red-600' },
                { icon: FileText, label: 'Result', action: 'result', color: 'text-purple-600' },
              ].map((action) => (
                <Button
                  key={action.action}
                  variant="outline"
                  size="sm"
                  disabled={action.disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction(action.action);
                    setShowActions(false);
                  }}
                  className={cn(
                    'flex flex-col items-center gap-1 py-3 h-auto rounded-xl transition-all duration-200',
                    'border-gray-200 dark:border-gray-700',
                    'hover:bg-[#0A3269]/5 dark:hover:bg-[#0A3269]/10',
                    'hover:border-[#0A3269]/30 dark:hover:border-[#0A3269]/30',
                    action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  )}
                >
                  <action.icon className={cn('w-4 h-4', action.color)} />
                  <span className={cn('text-[10px] font-medium', action.color)}>{action.label}</span>
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ApplicationRow: React.FC<{
  application: AmerApplication;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusUpdate: (id: string, status: string) => void;
  onDocumentUpload: (id: string) => void;
  onDocumentReview: (id: string) => void;
  onResultUpload: (id: string) => void;
  onRequestOTP: (id: string) => void;
  onFraudCheck: (id: string) => void;
  onSetGovStage: (id: string, stage: string) => void;
  onViewDetails: (app: AmerApplication) => void;
}> = ({
  application,
  isExpanded,
  onToggle,
  onStatusUpdate,
  onDocumentUpload,
  onDocumentReview,
  onResultUpload,
  onRequestOTP,
  onFraudCheck,
  onSetGovStage,
  onViewDetails
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group"
    >
      <div 
        className={cn(
          'bg-white dark:bg-gray-900 rounded-2xl border-2 transition-all duration-400 overflow-hidden',
          isExpanded 
            ? 'border-[#0A3269] shadow-2xl shadow-[#0A3269]/15 dark:shadow-[#0A3269]/30' 
            : 'border-gray-200 dark:border-gray-800 hover:border-[#0A3269]/40 dark:hover:border-[#0A3269]/30 hover:shadow-xl hover:shadow-[#0A3269]/5',
          'cursor-pointer'
        )}
        onClick={onToggle}
      >
        {/* Top Accent Bar */}
        <div className={cn(
          'h-1 w-full transition-all duration-400',
          isExpanded ? 'bg-[#0A3269]' : 'bg-transparent group-hover:bg-[#0A3269]/40'
        )} />

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Avatar - Premium */}
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0A3269] to-[#1A4A8A] flex items-center justify-center shadow-lg shadow-[#0A3269]/25">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Main Info - Big & Bold */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                  {application.sponsor.firstName} {application.sponsor.lastName}
                </h3>
                <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full px-3 py-1">
                  {application.applicationType.replace('_', ' ')}
                </Badge>
                {application.status === 'approved' && (
                  <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{application.sponsor.email}</p>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400">
                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  <Calendar className="w-3 h-3" />
                  {new Date(application.metadata.submittedAt || '').toLocaleDateString()}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  <FileCheck className="w-3 h-3" />
                  {application.attachments.length} docs
                </span>
              </div>
            </div>

            {/* Status & Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <ModernStatusBadge status={application.status} />
              
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setShowActions(!showActions)}
                >
                  <MoreHorizontal className="w-5 h-5 text-gray-400" />
                </Button>
                
               {showActions && (
  <div className="absolute right-0 top-8 z-50 min-w-[220px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-1 max-h-[70vh] overflow-y-auto">
    {[
      { icon: Eye, label: 'View', onClick: () => onViewDetails(application), color: 'text-blue-600' },
      { icon: Upload, label: 'Upload Documents', onClick: () => onDocumentUpload(application._id), color: 'text-emerald-600' },
      { icon: FileCheck, label: 'Review Documents', onClick: () => onDocumentReview(application._id), disabled: !application.attachments?.length, color: 'text-amber-600' },
      { icon: FileText, label: 'Upload Result', onClick: () => onResultUpload(application._id), color: 'text-purple-600' },
      { icon: Key, label: 'Request OTP', onClick: () => onRequestOTP(application._id), color: 'text-blue-600' },
      { icon: Shield, label: 'Fraud Check', onClick: () => onFraudCheck(application._id), color: 'text-red-600' },
      { icon: AlertCircle, label: 'Update Status', onClick: () => onStatusUpdate(application._id, application.status), color: 'text-amber-600' },
    ].map((action, idx) => (
      <button
        key={idx}
        disabled={action.disabled}
        onClick={() => {
          action.onClick();
          setShowActions(false);
        }}
        className={cn(
          'w-full flex items-center gap-2.5 px-3.5 py-2 text-xs transition-all duration-200',
          'hover:bg-[#0A3269]/5 dark:hover:bg-[#0A3269]/10',
          action.disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 dark:text-gray-200'
        )}
      >
        <action.icon className={cn('w-3.5 h-3.5 flex-shrink-0', action.color)} />
        <span className="truncate text-[11px]">{action.label}</span>
      </button>
    ))}
    <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
    <div className="px-2">
      <p className="text-[9px] font-medium text-gray-400 uppercase tracking-wider px-2 py-1">Government Stages</p>
      {['mohre_pending', 'gdrfa_pending', 'icp_pending'].map((stage) => (
        <button
          key={stage}
          onClick={() => {
            onSetGovStage(application._id, stage);
            setShowActions(false);
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-[#0A3269]/5 dark:hover:bg-[#0A3269]/10 rounded-lg transition-colors"
        >
          <Crown className="w-3.5 h-3.5 flex-shrink-0 text-[#0A3269]" />
          <span className="truncate text-[10px]">{stage.replace('_', ' ').toUpperCase()}</span>
        </button>
      ))}
    </div>
  </div>
)}              </div>

              <Button
                variant="ghost"
                size="sm"
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0 transition-all duration-300"
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-[#0A3269]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-[#0A3269] transition-colors" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Expanded Content - Premium Big Cards */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50/80 to-white dark:from-gray-900/50 dark:to-gray-900 rounded-b-2xl overflow-hidden"
          >
             <div className="p-4 sm:p-6 lg:p-8">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
    
    {/* ─── APPLICATION DETAILS ────────────────────────────────────────────── */}
    <div className="space-y-3">
      <h4 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-white/40 flex items-center gap-2.5 uppercase tracking-wider">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border border-blue-200/50 dark:border-white/5">
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
        </div>
        Application Details
      </h4>
      
      <div className="space-y-0 overflow-hidden rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 backdrop-blur-sm">
        {/* ID */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100/50 dark:border-white/5 group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors duration-200">
          <span className="text-[10px] sm:text-xs font-medium text-gray-400 dark:text-white/30 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500" />
            ID
          </span>
          <span className="font-mono text-xs sm:text-sm font-medium text-gray-700 dark:text-white/80 flex items-center gap-2">
            #{application._id.slice(-8)}
          </span>
        </div>
        
        {/* Type */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100/50 dark:border-white/5 group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors duration-200">
          <span className="text-[10px] sm:text-xs font-medium text-gray-400 dark:text-white/30 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 dark:bg-purple-500" />
            Type
          </span>
          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-white/80 capitalize">
            {application.applicationType.replace(/_/g, ' ')}
          </span>
        </div>
        
        {/* Submitted */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100/50 dark:border-white/5 group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors duration-200">
          <span className="text-[10px] sm:text-xs font-medium text-gray-400 dark:text-white/30 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500" />
            Submitted
          </span>
          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-white/80">
            {new Date(application.metadata.submittedAt || '').toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        
        {/* Gov Stage */}
        {(application.metadata as any).govStage && (
          <div className="flex items-center justify-between px-4 py-3 group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors duration-200">
            <span className="text-[10px] sm:text-xs font-medium text-gray-400 dark:text-white/30 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-500" />
              Gov Stage
            </span>
            <Badge className={cn(
              "rounded-full px-3 py-1 text-[10px] font-medium border-0",
              (application.metadata as any).govStage === 'approved' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
              (application.metadata as any).govStage === 'pending' ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" :
              "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
            )}>
              <span className="flex items-center gap-1.5">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  (application.metadata as any).govStage === 'approved' ? "bg-emerald-500" :
                  (application.metadata as any).govStage === 'pending' ? "bg-amber-500" :
                  "bg-blue-500"
                )} />
                {(application.metadata as any).govStage.replace('_', ' ').toUpperCase()}
              </span>
            </Badge>
          </div>
        )}
      </div>
    </div>

{/* Documents - Premium Card with Image Preview */}
<div className="space-y-3">
  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
    <div className="p-1.5 rounded-lg bg-[#0A3269]/10">
      <FolderOpen className="w-4 h-4 text-[#0A3269]" />
    </div>
    Documents ({application.attachments.length})
  </h4>
  <div className="bg-white dark:bg-gray-900/80 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
    <div className="space-y-3 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
      {application.attachments.length > 0 ? (
        application.attachments.slice(0, 6).map((doc: any, idx: number) => {
          // ─── Get the file URL from various possible keys ───
          const fileUrl = doc.url || doc.fileUrl || doc.file || doc.path || 
                          doc.location || doc.secure_url || doc.attachmentUrl || 
                          doc.documentUrl || doc.originalUrl || doc.filePath || '';
          
          // ─── Get the original filename ───
          const fileName = doc.originalName || doc.originalname || doc.fileName || 
                          doc.filename || doc.name || doc.original_filename || '';
          
          // ─── Get the file type / mime ───
          const mimeType = doc.mimeType || doc.mimetype || doc.fileType || doc.type || '';
          
          // ─── Detect if it's an image ───
          const isImage = fileUrl?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|heic|heif)$/i) ||
                          mimeType?.startsWith('image/') ||
                          fileName?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|heic|heif)$/i);
          
          const isPDF = fileUrl?.match(/\.pdf$/i) || 
                        mimeType === 'application/pdf' ||
                        fileName?.match(/\.pdf$/i);
          
          // ─── Debug log ───
          console.log('📄 Document:', { 
            id: doc._id || doc.id,
            fileUrl, 
            fileName, 
            mimeType,
            isImage,
            isPDF,
            allKeys: Object.keys(doc)
          });
          
          return (
            <div 
              key={idx} 
              className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-[#0A3269]/30 transition-all duration-200 group/doc"
            >
              {/* Document Preview / Icon */}
              <div className="relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                {fileUrl && isImage ? (
                  // Image preview - click to enlarge
                  <img 
                    src={fileUrl} 
                    alt={doc.type || 'Document'}
                    className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(fileUrl, '_blank');
                    }}
                    onError={(e) => {
                      // If image fails to load, show file icon instead
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = 'w-full h-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/20';
                        fallback.innerHTML = `<svg class="w-8 h-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : fileUrl && isPDF ? (
                  // PDF icon with preview
                  <div className="w-full h-full flex items-center justify-center bg-red-50 dark:bg-red-900/20 relative">
                    <FileText className="w-8 h-8 text-red-500" />
                    <button 
                      className="absolute inset-0 w-full h-full opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/40 flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(fileUrl, '_blank');
                      }}
                    >
                      <Eye className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ) : fileUrl ? (
                  // Generic file icon with click to view
                  <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 relative cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(fileUrl, '_blank');
                    }}
                  >
                    <FileText className="w-8 h-8 text-blue-500" />
                  </div>
                ) : (
                  // No URL - show broken file icon
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                    <AlertCircle className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
                
                {/* Status badge overlay */}
                <div className="absolute -top-1 -left-0">
                  <Badge 
                    className={cn(
                      'text-[8px] rounded-full px-1.5 py-0.5 border-0 shadow-sm',
                      doc.status === 'approved' ? 'bg-emerald-500 text-white' :
                      doc.status === 'rejected' ? 'bg-red-500 text-white' :
                      doc.status === 'under_review' ? 'bg-amber-500 text-white' :
                      'bg-gray-400 text-white'
                    )}
                  >
                    {doc.status || 'pending'}
                  </Badge>
                </div>
              </div>
              
              {/* Document info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {doc.type?.replace(/_/g, ' ') || fileName || 'Document'}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
                    {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[120px]">
                    {fileName || 'Uploaded'}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 
                     doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
                {/* Preview action - only if we have a URL */}
                {fileUrl && (
                  <button 
                    className="text-[10px] text-[#0A3269] dark:text-[#4A8ABF] hover:underline mt-0.5 flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(fileUrl, '_blank');
                    }}
                  >
                    <Eye className="w-3 h-3" />
                    {isImage ? 'View Image' : isPDF ? 'View PDF' : 'View Document'}
                  </button>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-10 text-gray-400 text-sm">
          <FileCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
          No documents uploaded yet
        </div>
      )}
      {application.attachments.length > 6 && (
        <div className="text-xs text-center text-[#0A3269] font-medium py-2.5 bg-[#0A3269]/5 rounded-xl border border-[#0A3269]/20">
          +{application.attachments.length - 6} more documents
        </div>
      )}
    </div>
  </div>
</div>
{/* ─── QUICK ACTIONS - MODERN UPGRADE ────────────────────────────────────── */}
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <h4 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-white/40 flex items-center gap-2.5 uppercase tracking-wider">
      <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 border border-purple-200/50 dark:border-white/5">
        <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
      </div>
      Quick Actions
    </h4>
    <Badge variant="outline" className="text-[9px] text-gray-400 dark:text-white/30 border-gray-200 dark:border-white/5 rounded-full px-2.5 py-0.5">
      {application.attachments?.length || 0} docs
    </Badge>
  </div>
  
  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
    {[
      { 
        icon: Eye, 
        label: 'View', 
        onClick: () => onViewDetails(application), 
        light: 'hover:border-blue-400 hover:bg-blue-50/80 hover:text-blue-600',
        dark: 'dark:hover:border-blue-400/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-400',
        iconLight: 'text-blue-600', 
        iconDark: 'dark:text-blue-400',
        bgLight: 'bg-blue-50/50',
        bgDark: 'dark:bg-blue-500/5',
        desc: 'Full details'
      },
      { 
        icon: Upload, 
        label: 'Upload', 
        onClick: () => onDocumentUpload(application._id), 
        light: 'hover:border-emerald-400 hover:bg-emerald-50/80 hover:text-emerald-600',
        dark: 'dark:hover:border-emerald-400/30 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400',
        iconLight: 'text-emerald-600', 
        iconDark: 'dark:text-emerald-400',
        bgLight: 'bg-emerald-50/50',
        bgDark: 'dark:bg-emerald-500/5',
        desc: 'Add documents'
      },
      { 
        icon: FileText, 
        label: 'Result', 
        onClick: () => onResultUpload(application._id), 
        light: 'hover:border-purple-400 hover:bg-purple-50/80 hover:text-purple-600',
        dark: 'dark:hover:border-purple-400/30 dark:hover:bg-purple-500/10 dark:hover:text-purple-400',
        iconLight: 'text-purple-600', 
        iconDark: 'dark:text-purple-400',
        bgLight: 'bg-purple-50/50',
        bgDark: 'dark:bg-purple-500/5',
        desc: 'Upload result'
      },
      { 
        icon: FileCheck, 
        label: 'Review', 
        onClick: () => onDocumentReview(application._id), 
        disabled: !application.attachments?.length,
        light: 'hover:border-amber-400 hover:bg-amber-50/80 hover:text-amber-600',
        dark: 'dark:hover:border-amber-400/30 dark:hover:bg-amber-500/10 dark:hover:text-amber-400',
        iconLight: 'text-amber-600', 
        iconDark: 'dark:text-amber-400',
        bgLight: 'bg-amber-50/50',
        bgDark: 'dark:bg-amber-500/5',
        desc: !application.attachments?.length ? 'No docs to review' : 'Review docs'
      },
    ].map((action, idx) => (
      <motion.button
        key={idx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.06 }}
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.95 }}
        disabled={action.disabled}
        onClick={(e) => {
          e.stopPropagation();
          action.onClick();
        }}
        className={cn(
          'group/btn relative flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl transition-all duration-300',
          'bg-white dark:bg-white/5',
          'border-2 border-gray-200/60 dark:border-white/10',
          action.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
          action.light,
          action.dark
        )}
      >
        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Icon Container */}
        <div className={cn(
          "relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all duration-300",
          action.bgLight,
          action.bgDark,
          "group-hover/btn:scale-110 group-hover/btn:shadow-lg",
          action.disabled ? "opacity-50" : ""
        )}>
          <action.icon className={cn(
            "w-5 h-5 sm:w-5.5 sm:h-5.5 transition-all duration-300",
            action.iconLight,
            action.iconDark,
            "group-hover/btn:scale-110 group-hover/btn:rotate-3"
          )} />
          
          {/* Icon Glow */}
          <div className={cn(
            "absolute inset-0 rounded-xl blur-xl opacity-0 group-hover/btn:opacity-50 transition-opacity duration-500 pointer-events-none",
            action.iconLight,
            action.iconDark
          )} />
        </div>
        
        {/* Label & Description */}
        <div className="text-center space-y-0.5">
          <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-white/80 group-hover/btn:text-current transition-colors duration-300 block">
            {action.label}
          </span>
          <span className="text-[9px] sm:text-[10px] text-gray-400 dark:text-white/30 group-hover/btn:text-current/70 transition-colors duration-300 block">
            {action.desc}
          </span>
        </div>

        {/* Ripple Effect Line */}
        
        {/* Bottom Accent Line */}
        <span className={cn(
          "absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 rounded-full transition-all duration-300",
          action.disabled ? "" : "group-hover/btn:w-8",
          action.iconLight,
          action.iconDark
        )} />
      </motion.button>
    ))}
  </div>
</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
// ========== MAIN COMPONENT ==========
const AmerDashboard: React.FC = () => {
  const { user, loading: authLoading, checkRole } = useAuth();
  const { t } = useTranslation();
  
  // Responsive hooks
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');

  const {
    applications,
    filteredApplications,
    stats,
    loading,
    fetchAllApplications,
    updateApplicationStatus,
    addFraudAlert,
    issuePenalty,
    requestAdditionalDocuments,
    filterApplications,
    fetchStats
  } = useAmerDashboard();

  // State
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<AmerApplication | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState<{
    applicationId: string;
    currentStatus: string;
    newStatus: string;
    note: string;
  } | null>(null);
  
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [showDocumentReview, setShowDocumentReview] = useState(false);
  const [showResultDocumentUpload, setShowResultDocumentUpload] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otpMinutes, setOtpMinutes] = useState<number>(2);
  const [otpPhone, setOtpPhone] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [otpCountdown, setOtpCountdown] = useState<string>('');
  const [otpLoading, setOtpLoading] = useState<boolean>(false);
  
  const [activeTab, setActiveTab] = useState('applications');
  const [mobileTab, setMobileTab] = useState('applications');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
  const [penalties, setPenalties] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [rooms, setRooms] = useState<Array<{ roomId: string; userName?: string; service?: string; unread: number }>>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, any[]>>({});
  const [typingByRoom, setTypingByRoom] = useState<Record<string, boolean>>({});
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());

// ─── Stats filter state ─────────────────────────────────────────────
const [statsFilter, setStatsFilter] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('all');
// ─── Compute filtered stats ─────────────────────────────────────────
const filteredStats = useMemo(() => {
  const now = new Date();
  let startDate: Date | null = null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (statsFilter) {
    case 'today':
      startDate = today;
      break;
    case 'week':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay()); // start of week (Sunday)
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'all':
    default:
      startDate = null;
      break;
  }

  const filtered = startDate
    ? applications.filter(app => new Date(app.createdAt) >= startDate!)
    : applications;

  const total = filtered.length;
  const approved = filtered.filter(app => app.status === 'approved').length;
  const pending = filtered.filter(app => app.status === 'pending' || app.status === 'submitted' || app.status === 'processing').length;
  const rejected = filtered.filter(app => app.status === 'rejected').length;

  return { total, approved, pending, rejected };
}, [applications, statsFilter]);



  // Mobile specific state
  const [selectedMobileApp, setSelectedMobileApp] = useState<AmerApplication | null>(null);
  const [showMobileDetails, setShowMobileDetails] = useState(false);

  // ========== EFFECTS ==========
  useEffect(() => {
    const checkAmerRole = async () => {
      if (user && !authLoading) {
        const hasRole = await checkRole('amer');
        if (!hasRole) {
          console.error('Access denied: Amer role required');
        }
      }
    };
    checkAmerRole();
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'amer') return;
    const socket = getSocket();
    
    socket.emit('register_amer', {
      name: (user as any).firstName ? `${(user as any).firstName} ${(user as any).lastName}` : 'Amer Officer',
      userId: user.id,
      userData: {
        name: (user as any).firstName ? `${(user as any).firstName} ${(user as any).lastName}` : 'Amer Officer',
        email: user.email,
        role: 'amer'
      }
    });
    
    const onInvite = (payload: any) => {
      console.log('Received Amer invite:', payload);
      setInvites((prev) => [payload, ...prev]);
      setRooms(prev => prev.find(r => r.roomId === payload.roomId) ? prev : [{ roomId: payload.roomId, userName: payload.userName, service: payload.service, unread: 0 }, ...prev]);
    };
    
    const onOfficerRequest = (payload: any) => {
      console.log('Received officer request:', payload);
      setInvites((prev) => [{
        roomId: payload.requestId,
        userName: payload.userInfo?.userName || 'User',
        service: payload.userInfo?.service || 'General',
        requestId: payload.requestId,
        userInfo: payload.userInfo
      }, ...prev]);
    };
    
    socket.on('amer_invite', onInvite);
    socket.on('officer_request', onOfficerRequest);
    
    const onChatSessionStarted = (payload: any) => {
      console.log('Chat session started:', payload);
      const { chatId, userService, userName } = payload;
      setCurrentRoomId(chatId);
      setRooms(prev => prev.find(r => r.roomId === chatId) ? prev : [{ 
        roomId: chatId, 
        userName: userName || 'User', 
        service: userService || 'General', 
        unread: 0 
      }, ...prev]);
    };
    
    socket.on('chat_session_started', onChatSessionStarted);
    
    const onAmerConnected = (payload: any) => {
      const { roomId } = payload || {};
      if (!roomId) return;
      const meta = invites.find(i => i.roomId === roomId);
      setRooms((prev) => {
        if (prev.find(r => r.roomId === roomId)) return prev;
        return [{ roomId, userName: meta?.userName, service: meta?.service, unread: 0 }, ...prev];
      });
      setCurrentRoomId((curr) => curr || roomId);
    };
    const onNewMessage = (msg: any) => {
      console.log('AmerDashboard received new message:', msg);
      const { roomId, chatId } = msg.metadata || {};
      const effectiveRoomId = roomId || chatId || msg.chatId || currentRoomId;
      if (!effectiveRoomId) return;
      if (msg?.id && seenMessageIdsRef.current.has(msg.id)) {
        console.log('Message already seen, skipping:', msg.id);
        return;
      }
      if (msg?.id) seenMessageIdsRef.current.add(msg.id);
      
      const isOwnMessage = msg.sender === 'amer' && msg.timestamp && 
        (Date.now() - new Date(msg.timestamp).getTime() < 1000);
      
      if (!isOwnMessage) {
        setMessagesByRoom(prev => ({
          ...prev,
          [effectiveRoomId]: [...(prev[effectiveRoomId] || []), msg]
        }));
      }
      
      setRooms(prev => prev.map(r => r.roomId === effectiveRoomId && effectiveRoomId !== currentRoomId ? { ...r, unread: r.unread + 1 } : r));
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    };
    const onUserTyping = (payload: any) => {
      const { roomId, isTyping } = payload;
      if (!roomId) return;
      setTypingByRoom(prev => ({ ...prev, [roomId]: !!isTyping }));
    };
    const onRoomSnapshot = (payload: any) => {
      if (!payload?.roomId) return;
      setMessagesByRoom(prev => ({ ...prev, [payload.roomId]: payload.messages || [] }));
      setRooms(prev => prev.find(r => r.roomId === payload.roomId) ? prev : [{ roomId: payload.roomId, unread: 0 }, ...prev]);
      setCurrentRoomId(curr => curr || payload.roomId);
    };
    socket.on('amer_connected', onAmerConnected);
    socket.on('new_message', onNewMessage);
    socket.on('user_typing', onUserTyping);
    socket.on('room_snapshot', onRoomSnapshot);
    return () => {
      socket.off('amer_invite', onInvite);
      socket.off('officer_request', onOfficerRequest);
      socket.off('chat_session_started', onChatSessionStarted);
      socket.off('amer_connected', onAmerConnected);
      socket.off('new_message', onNewMessage);
      socket.off('user_typing', onUserTyping);
      socket.off('room_snapshot', onRoomSnapshot);
    };
  }, [user, currentRoomId]);

  useEffect(() => {
    if (user && user.role === 'amer') {
      loadDashboardData();
    }
  }, [user]);

  useEffect(() => {
    filterApplications({
      status: statusFilter,
      searchQuery
    });
  }, [applications, statusFilter, searchQuery]);

  useEffect(() => {
    if (!otpExpiresAt) { setOtpCountdown(''); return; }
    const update = () => {
      const left = Math.max(0, otpExpiresAt - Date.now());
      const m = Math.floor(left/60000);
      const s = Math.floor((left%60000)/1000);
      setOtpCountdown(`${m}:${s.toString().padStart(2,'0')}`);
      if (left <= 0) {
        setOtpExpiresAt(null);
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [otpExpiresAt]);

  // ========== FUNCTIONS ==========
  const loadDashboardData = async () => {
    try {
      await fetchAllApplications();
      await fetchStats();
      setFraudAlerts(applications.filter(application => application.status === 'fraud_detected'));
      setPenalties(applications.filter(application => application.status === 'penalty_issued'));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleStatusUpdateOriginal = async (applicationId: string, status: string, note?: string) => {
    try {
      await updateApplicationStatus(applicationId, status, note);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDocumentUpload = (applicationId: string) => {
    const app = applications.find(a => a._id === applicationId);
    if (app) setSelectedApplication(app);
    setShowDocumentUpload(true);
  };

  const handleFraudCheck = async (applicationId: string) => {
    try {
      await addFraudAlert(applicationId, 'document_verification', 'medium', 'Document verification required');
    } catch (error) {
      console.error('Error adding fraud alert:', error);
    }
  };

  const handleAttachmentReview = async (attachmentId: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    try {
      if (!selectedApplication) return;
      const token = localStorage.getItem('authToken') || '';
      const res = await fetch(`${apiBase}/api/v1/visa/${selectedApplication._id}/attachments/${attachmentId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, rejectionReason })
      });
      if (!res.ok) throw new Error('Review failed');
      toast.success(`Document ${status} successfully`);
      await fetchAllApplications();
    } catch (e) {
      toast.error('Failed to review document');
      throw e;
    }
  };

  const handleDocumentReview = (applicationId: string) => {
    const app = applications.find(a => a._id === applicationId);
    if (app) {
      setSelectedApplication(app);
      setShowDocumentReview(true);
    }
  };

  const toggleRowExpansion = (applicationId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(applicationId)) {
        newSet.delete(applicationId);
      } else {
        newSet.add(applicationId);
      }
      return newSet;
    });
  };

  const handleStatusUpdateClick = (applicationId: string, currentStatus: string) => {
    setStatusUpdateData({
      applicationId,
      currentStatus,
      newStatus: currentStatus,
      note: ''
    });
    setShowStatusDialog(true);
  };

  const handleStatusUpdateDialog = async (applicationId: string, status: string, note?: string) => {
    try {
      await updateApplicationStatus(applicationId, status, note);
      setShowStatusDialog(false);
      setStatusUpdateData(null);
      toast.success('Application status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update application status');
    }
  };

  const handleResultDocumentUpload = (applicationId: string) => {
    const app = applications.find(a => a._id === applicationId);
    if (app) {
      setSelectedApplication(app);
      setShowResultDocumentUpload(true);
    }
  };

  const handleSetGovStage = async (applicationId: string, stage: string) => {
    try {
      const token = localStorage.getItem('authToken') || '';
      const res = await fetch(`${apiBase}/api/v1/visa/${applicationId}/set-stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stage })
      });
      if (!res.ok) throw new Error('Stage update failed');
      toast.success(`Stage set to ${stage}`);
      await fetchAllApplications();
    } catch (e) {
      toast.error('Failed to update stage');
    }
  };

  const handleRequestOTP = async (applicationId: string) => {
    try {
      const app = applications.find(a => a._id === applicationId);
      setSelectedApplication(app || null);
      setOtpPhone(app?.sponsor?.phoneNumber || '');
      setOtpMinutes(2);
      setOtpCode('');
      setOtpExpiresAt(null);
      setShowOtpDialog(true);
    } catch (error) {
      console.error('Error preparing OTP modal:', error);
    }
  };

  const handleDocumentsUploaded = (documents: any[]) => {
    console.log('Documents uploaded:', documents);
    loadDashboardData();
  };

  // Mobile handlers
  const handleMobileAppAction = (application: AmerApplication, action: string) => {
    switch (action) {
      case 'view':
        setSelectedMobileApp(application);
        setShowMobileDetails(true);
        break;
      case 'upload':
        handleDocumentUpload(application._id);
        break;
      case 'review':
        handleDocumentReview(application._id);
        break;
      case 'otp':
        handleRequestOTP(application._id);
        break;
      case 'fraud':
        handleFraudCheck(application._id);
        break;
      case 'result':
        handleResultDocumentUpload(application._id);
        break;
      default:
        break;
    }
  };

  const totalNotifications = fraudAlerts?.filter(alert => alert.status === 'open').length + 
                           penalties.filter(penalty => penalty.status === 'pending').length + 
                           invites.length;

  // ========== LOADING & AUTH ==========
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 animate-pulse flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full animate-bounce" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'amer') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-500 dark:text-gray-400">You don't have permission to access this dashboard.</p>
        </div>
      </div>
    );
  }

  // ========== MOBILE VIEW ==========
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
        {/* Mobile Header */}
        <MobileHeader 
          user={user} 
          onMenuToggle={() => setShowMobileMenu(true)} 
          notifications={totalNotifications}
        />

        {/* Mobile Sidebar */}
        <MobileSidebar 
          isOpen={showMobileMenu}
          onClose={() => setShowMobileMenu(false)}
          user={user}
          onNavigate={(tab) => {
            setMobileTab(tab);
            setActiveTab(tab);
          }}
        />

        {/* Invites Banner */}
        {invites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mt-4"
          >
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {invites[0].userName || 'User'} needs assistance
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Service: {invites[0].service || 'N/A'}
                    </p>
                  </div>
                </div>
                <Button 
                  size="sm"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25 border-0"
                  onClick={() => {
                    const inv = invites[0];
                    const socket = getSocket();
                    socket.emit('officer_accept_request', { requestId: inv.requestId || inv.roomId });
                    setInvites(prev => prev.slice(1));
                    setRooms(prev => prev.find(r => r.roomId === inv.roomId) ? prev : [{ roomId: inv.roomId, userName: inv.userName, service: inv.service, unread: 0 }, ...prev]);
                    setCurrentRoomId(inv.roomId);
                    setMobileTab('chat');
                  }}
                >
                  Join
                </Button>
              </div>
            </div>
          </motion.div>
        )}

       {/* Main Content */}
<div className="px-4 py-4 space-y-4">
  {mobileTab === 'applications' && (
    <>
      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <Input
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-2xl border-gray-200 dark:border-gray-800"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FilterIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* Filters Expand */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-800">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="docs_required">Documents Required</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
{/* Premium Stats Grid */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
>
  {[
    { 
      icon: Users, 
      label: 'Total Applications', 
      value: applications.length, 
      trend: '+12%',
      trendLabel: 'vs last month',
      color: '#0A3269',
    },
    { 
      icon: Clock, 
      label: 'Submitted', 
      value: (stats as any)?.byStatus?.find?.((x: any) => x._id==='submitted')?.count || 0,
      trend: 'Pending Review',
      trendLabel: 'Awaiting',
      color: '#F59E0B',
    },
    { 
      icon: Clock3, 
      label: 'Under Review', 
      value: (stats as any)?.byStatus?.find?.((x: any) => x._id==='under_review')?.count || 0,
      trend: 'In Progress',
      trendLabel: 'Active',
      color: '#8B5CF6',
    },
    { 
      icon: CheckCircle, 
      label: 'Approved', 
      value: (stats as any)?.byStatus?.find?.((x: any) => x._id==='approved')?.count || 0,
      trend: 'Completed',
      trendLabel: 'Success',
      color: '#10B981',
    },
  ].map((stat, index) => (
    <motion.div
      key={stat.label}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group"
    >
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900/90 border border-gray-200/80 dark:border-gray-800/80 p-4 shadow-sm hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5 transition-all duration-300">
        <div 
          className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500"
          style={{ background: `radial-gradient(circle at top right, ${stat.color}, transparent 70%)` }}
        />
        <div 
          className="absolute top-0 left-4 right-4 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ backgroundColor: stat.color }}
        />
        <div className="relative flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.08em]">
              {stat.label}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              {stat.value}
            </p>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
                {stat.trend}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                {stat.trendLabel}
              </span>
            </div>
          </div>
          <div 
            className="p-2 rounded-xl flex-shrink-0 shadow-sm"
            style={{ backgroundColor: `${stat.color}15` }}
          >
            <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
          </div>
        </div>
        <div className="mt-3 h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((stat.value / (applications.length || 1)) * 100, 100)}%` }}
            transition={{ duration: 0.8, delay: 0.2 + (index * 0.05) }}
            className="h-full rounded-full"
            style={{ backgroundColor: stat.color }}
          />
        </div>
      </div>
    </motion.div>
  ))}
</motion.div>

{/* ─── Modern Applications Heading ──────────────────────────────── */}
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  className="flex items-center justify-between mb-4"
>
  <div className="flex items-center gap-3">
    <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#0A3269] to-[#1A4A8A]" />
  <h2 className="text-lg font-bold text-[#0A3269] dark:text-white flex items-center gap-2">
  <FileText className="w-5 h-5 text-[#0A3269] dark:text-[#4A8ABF]" />
  Applications
</h2>
 
  </div>
  <span className="text-xs text-gray-400 dark:text-gray-500">
    {filteredApplications.length === 0 ? 'No items' : `${filteredApplications.length} items`}
  </span>
</motion.div>

{/* Applications List - Mobile Cards */}
<div className="space-y-3">
  {filteredApplications.map((application) => (
    <MobileApplicationCard
      key={application._id}
      application={application}
      onPress={() => {
        setSelectedMobileApp(application);
        setShowMobileDetails(true);
      }}
      onAction={(action) => handleMobileAppAction(application, action)}
    />
  ))}
  {filteredApplications.length === 0 && (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
        <FileText className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No applications found</h3>
      <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters</p>
    </div>
  )}
</div>
    </>
  )}

  {mobileTab === 'packages' && (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
      <PackageApplicationsAdmin />
    </div>
  )}

  {mobileTab === 'checks' && (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
      <ChecksReviewPanel />
    </div>
  )}

  {mobileTab === 'fraud' && (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
      <div className="text-center py-12 text-sm font-light text-gray-500 dark:text-gray-400">
        Fraud Detection section
      </div>
    </div>
  )}

  {mobileTab === 'penalties' && (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
      <div className="text-center py-12 text-sm font-light text-gray-500 dark:text-gray-400">
        Penalties section
      </div>
    </div>
  )}

  {mobileTab === 'otp' && (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
      <div className="text-center py-12 text-sm font-light text-gray-500 dark:text-gray-400">
        OTP Management section
      </div>
    </div>
  )}

  {mobileTab === 'statistics' && (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
      <div className="text-center py-12 text-sm font-light text-gray-500 dark:text-gray-400">
        Statistics dashboard
      </div>
    </div>
  )}

  {mobileTab === 'chat' && (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden h-[calc(100vh-200px)]">
      <div className="flex flex-col h-full">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {rooms.find(r => r.roomId === currentRoomId)?.userName || 'Chat'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {rooms.find(r => r.roomId === currentRoomId)?.service || 'Select a room'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentRoomId && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => {
                  const socket = getSocket();
                  const officerId = (user as any)?.id || (user as any)?._id;
                  socket.emit('leave_chat_room', { roomId: currentRoomId, userId: officerId });
                  setRooms(prev => prev.filter(r => r.roomId !== currentRoomId));
                  setCurrentRoomId(null);
                }}
              >
                Leave
              </Button>
            )}
          </div>
        </div>

        {/* Rooms List / Messages */}
        {!currentRoomId ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Active Rooms</h4>
            {rooms.map((room) => (
              <button
                key={room.roomId}
                onClick={() => {
                  setCurrentRoomId(room.roomId);
                  setRooms(prev => prev.map(r => r.roomId === room.roomId ? { ...r, unread: 0 } : r));
                  const socket = getSocket();
                  const officerId = (user as any)?.id || (user as any)?._id;
                  socket.emit('join_chat_room', { roomId: room.roomId, userId: officerId, officerId });
                }}
                className="w-full text-left p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                      {room.userName?.[0] || 'U'}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{room.userName || 'User'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{room.service || 'General'}</div>
                    </div>
                  </div>
                  {room.unread > 0 && (
                    <Badge className="bg-red-500 text-white rounded-full text-[10px] px-2 min-w-[20px] h-5 flex items-center justify-center">
                      {room.unread}
                    </Badge>
                  )}
                </div>
              </button>
            ))}
            {rooms.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No active rooms</p>
                <p className="text-xs">Accept an invite to start chatting</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950/50">
              {(messagesByRoom[currentRoomId || ''] || []).map((m, idx) => {
                const mine = ((user as any)?.id || (user as any)?._id) === m.sender;
                return (
                  <div key={`${m.id || 'm'}-${idx}`} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${mine ? 'order-2' : 'order-1'}`}>
                      <div className={cn(
                        'rounded-2xl px-4 py-2.5 text-sm',
                        m.type === 'system' 
                          ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : mine 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20' 
                            : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white'
                      )}>
                        {m.type === 'file' ? (
                          <div className="space-y-2">
                            <img src={apiBase + m.metadata?.fileUrl} alt={m.metadata?.fileName || 'File'} className="max-w-[150px] rounded-lg" />
                            <a href={apiBase + m.metadata?.fileUrl} target="_blank" className="text-xs underline block">
                              {m.metadata?.fileName || 'File'}
                            </a>
                          </div>
                        ) : (
                          <span>{m.content}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">
                        {new Date(m.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })}
              {typingByRoom[currentRoomId || ''] && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>Typing...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl px-3 py-1.5">
                  <button
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => {
                      const el = document.createElement('input');
                      el.type = 'file';
                      el.onchange = async (e: any) => {
                        const file = e.target.files?.[0];
                        if (!file || !currentRoomId) return;
                        const token = localStorage.getItem('authToken') || '';
                        const form = new FormData();
                        form.append('file', file);
                        form.append('roomId', currentRoomId);
                        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/chat/upload?roomId=${currentRoomId}`, {
                          method: 'POST',
                          headers: { Authorization: `Bearer ${token}` },
                          body: form
                        });
                        if (!res.ok) return;
                        const data = await res.json();
                        const { fileUrl, fileName } = data.data || {};
                        const socket = getSocket();
                        const officerId = (user as any)?.id || (user as any)?._id;
                        socket.emit('file_upload_start', { roomId: currentRoomId, userId: officerId, fileName: file.name, fileSize: file.size });
                        socket.emit('file_upload_complete', { roomId: currentRoomId, userId: officerId, fileUrl, fileName: fileName || file.name, fileSize: file.size });
                      };
                      el.click();
                    }}
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <Input
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm"
                    placeholder="Type a message..."
                    value={chatInput}
                    onChange={(e) => {
                      setChatInput(e.target.value);
                      if (currentRoomId) {
                        const socket = getSocket();
                        const officerId = (user as any)?.id || (user as any)?._id;
                        socket.emit('typing_start', { roomId: currentRoomId, userId: officerId });
                      }
                    }}
                    onBlur={() => {
                      if (currentRoomId) {
                        const socket = getSocket();
                        const officerId = (user as any)?.id || (user as any)?._id;
                        socket.emit('typing_stop', { roomId: currentRoomId, userId: officerId });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (!chatInput.trim() || !currentRoomId) return;
                        const socket = getSocket();
                        const officerMessage = {
                          id: Date.now().toString(),
                          type: 'amer',
                          content: chatInput.trim(),
                          sender: 'amer',
                          timestamp: new Date().toISOString(),
                          metadata: { roomId: currentRoomId }
                        };
                        setMessagesByRoom(prev => ({
                          ...prev,
                          [currentRoomId]: [...(prev[currentRoomId] || []), officerMessage]
                        }));
                        socket.emit('chat_message', { 
                          message: chatInput.trim(), 
                          chatId: currentRoomId, 
                          type: 'text' 
                        });
                        setChatInput('');
                        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
                      }
                    }}
                  />
                </div>
                <Button
                  size="icon"
                  className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25 border-0 w-10 h-10"
                  onClick={() => {
                    if (!chatInput.trim() || !currentRoomId) return;
                    const socket = getSocket();
                    const officerMessage = {
                      id: Date.now().toString(),
                      type: 'amer',
                      content: chatInput.trim(),
                      sender: 'amer',
                      timestamp: new Date().toISOString(),
                      metadata: { roomId: currentRoomId }
                    };
                    setMessagesByRoom(prev => ({
                      ...prev,
                      [currentRoomId]: [...(prev[currentRoomId] || []), officerMessage]
                    }));
                    socket.emit('chat_message', { 
                      message: chatInput.trim(), 
                      chatId: currentRoomId, 
                      type: 'text' 
                    });
                    setChatInput('');
                    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
                  }}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )}

 {mobileTab === 'profile' && (
  <div className="space-y-4">
    {/* ─── Modern Profile Card ──────────────────────────────────── */}
    <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl  overflow-hidden">
      {/* Cover gradient */}
      <div className="h-20 bg-gradient-to-r from-[#0A3269] to-[#1A4A8A] dark:from-[#0A1628] dark:to-[#0A3269] relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
      </div>

      <CardContent className="px-4 pb-6">
        {/* Avatar – overlapping the cover */}
        <div className="flex flex-col items-center text-center -mt-12">
          <div className="relative group">
            <Avatar className="w-24 h-24 ring-4 ring-white dark:ring-gray-800 shadow-xl">
              <AvatarFallback className="bg-[#0A3269] dark:bg-white text-white dark:text-[#0A3269] text-2xl font-medium">
                {(user as any)?.firstName?.[0]}{(user as any)?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            {/* Status dot */}
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900" />
            {/* Edit button (optional) – uncomment if you want it
            <button className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#0A3269] dark:bg-white border-2 border-white dark:border-gray-900 shadow-lg hover:scale-110 transition-transform">
              <Edit className="w-3.5 h-3.5 text-white dark:text-[#0A3269]" />
            </button>
            */}
          </div>

          <h3 className="mt-3 text-xl font-bold text-gray-900 dark:text-white">
            {(user as any)?.firstName} {(user as any)?.lastName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{(user as any)?.email}</p>
          <Badge className="mt-2 bg-[#0A3269] dark:bg-white text-white dark:text-[#0A3269] border-0 px-3 py-1 shadow-sm rounded-full">
            Amer Officer
          </Badge>
        </div>

        {/* Profile Details – modern grid layout */}
        <div className="mt-6 grid grid-cols-1 gap-1">
          {[
            { icon: Phone, label: 'Phone', value: (user as any)?.phone || 'Not set' },
            { icon: Mail, label: 'Email', value: (user as any)?.email || 'Not set' },
            { icon: Calendar, label: 'Joined', value: new Date((user as any)?.createdAt || '').toLocaleDateString() },
            { icon: User, label: 'Role', value: 'Amer Officer' },
          ].map((item, index) => (
            <div 
              key={item.label} 
              className={cn(
                'flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors',
                'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                index < 3 ? 'border-b border-gray-100 dark:border-gray-800' : ''
              )}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <item.icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">{item.label}</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
{/* ─── Modern Stats Card ────────────────────────────────────── */}
<Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl transition-all duration-300">
  <CardContent className="p-5">
    <div className="flex items-center justify-between mb-4">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-[#0A3269] dark:text-[#4A8ABF]" />
        Quick Stats
      </h4>

      {/* ─── Filter Dropdown ───────────────────────────────────── */}
      <Select value={statsFilter} onValueChange={setStatsFilter}>
        <SelectTrigger className="h-7 w-auto min-w-[100px] border-0 bg-gray-100 dark:bg-gray-800 text-[10px] text-gray-700 dark:text-gray-300 rounded-full px-3 py-0 focus:ring-0 focus:ring-offset-0">
          <SelectValue placeholder="This Month" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="year">This Year</SelectItem>
          <SelectItem value="all">All Time</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="grid grid-cols-2 gap-3">
      {/* Total Applications */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group">
        <div className="flex justify-center mb-1">
          <div className="p-2 rounded-lg bg-[#0A3269]/10 dark:bg-[#0A3269]/20 group-hover:bg-[#0A3269] transition-colors">
            <FileText className="w-4 h-4 text-[#0A3269] dark:text-[#4A8ABF] group-hover:text-white" />
          </div>
        </div>
        <p className="text-2xl font-bold text-[#0A3269] dark:text-white">
          {filteredStats.total}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Apps</p>
        <div className="mt-2 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full w-full bg-[#0A3269] dark:bg-white rounded-full" />
        </div>
      </div>

      {/* Approved */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group">
        <div className="flex justify-center mb-1">
          <div className="p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
          </div>
        </div>
        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
          {filteredStats.approved}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Approved</p>
        <div className="mt-2 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full w-3/4 bg-emerald-500 dark:bg-emerald-400 rounded-full" />
        </div>
      </div>

      {/* Pending */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group">
        <div className="flex justify-center mb-1">
          <div className="p-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 group-hover:bg-amber-500 transition-colors">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:text-white" />
          </div>
        </div>
        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
          {filteredStats.pending}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pending</p>
        <div className="mt-2 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-amber-500 dark:bg-amber-400 rounded-full" />
        </div>
      </div>

      {/* Rejected */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group">
        <div className="flex justify-center mb-1">
          <div className="p-2 rounded-lg bg-red-500/10 dark:bg-red-500/20 group-hover:bg-red-500 transition-colors">
            <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 group-hover:text-white" />
          </div>
        </div>
        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
          {filteredStats.rejected}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Rejected</p>
        <div className="mt-2 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full w-1/4 bg-red-500 dark:bg-red-400 rounded-full" />
        </div>
      </div>
    </div>
  </CardContent>
</Card>
  </div>
)}

</div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav 
          activeTab={mobileTab}
          onTabChange={setMobileTab}
          badgeCount={invites.length + rooms.reduce((acc, r) => acc + r.unread, 0)}
        />

{/* Premium Mobile Application Details Bottom Sheet - Modern Advanced */}
<AnimatePresence mode="wait">
  {showMobileDetails && selectedMobileApp && (
    <>
      {/* Backdrop with blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
        onClick={() => setShowMobileDetails(false)}
      />
      
      {/* Bottom Sheet */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 280, mass: 0.8 }}
        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0A0A0F] rounded-t-3xl z-50 max-h-[92vh] overflow-y-auto shadow-2xl shadow-black/40"
      >
        {/* Drag Handle */}
        <div className="sticky top-0 z-20 flex justify-center pt-3 pb-1 bg-transparent">
          <div className="w-16 h-1.5 rounded-full bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600" />
        </div>

        {/* Header */}
        <div className="sticky top-3 z-20 bg-white/95 dark:bg-[#0A0A0F]/95 backdrop-blur-xl px-5 pb-4 border-b border-gray-100/80 dark:border-white/5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0A3269] via-[#1A4A8A] to-[#2A5A9A] flex items-center justify-center shadow-lg shadow-[#0A3269]/30 flex-shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-[#0A0A0F]",
                    selectedMobileApp.status === 'approved' ? 'bg-emerald-500' :
                    selectedMobileApp.status === 'rejected' ? 'bg-red-500' :
                    selectedMobileApp.status === 'under_review' ? 'bg-yellow-500' :
                    'bg-gray-400'
                  )} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                    {selectedMobileApp.sponsor.firstName} {selectedMobileApp.sponsor.lastName}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {selectedMobileApp.sponsor.email}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                <ModernStatusBadge status={selectedMobileApp.status} />
                <Badge className="inline-flex items-center gap-1.5 bg-gray-100/80 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-0 text-[10px] font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Calendar className="w-3 h-3" />
                  {new Date(selectedMobileApp.metadata.submittedAt || '').toLocaleDateString()}
                </Badge>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMobileDetails(false)}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-300 flex-shrink-0 -mt-1"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 pb-8">
          {/* Application Details */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[#0A3269] to-[#4A8ABF]" />
              <h4 className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Application Details
              </h4>
            </div>
            <div className="bg-gradient-to-br from-gray-50/80 to-white/80 dark:from-white/5 dark:to-transparent rounded-2xl p-4 space-y-3 border border-gray-100/80 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100/60 dark:border-white/5">
                <span className="text-xs text-gray-500 dark:text-gray-400">Application ID</span>
                <span className="font-mono font-medium text-xs text-gray-900 dark:text-white bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                  #{selectedMobileApp._id.slice(-8)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100/60 dark:border-white/5">
                <span className="text-xs text-gray-500 dark:text-gray-400">Submitted</span>
                <span className="font-medium text-xs text-gray-900 dark:text-white">
                  {new Date(selectedMobileApp.metadata.submittedAt || '').toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100/60 dark:border-white/5">
                <span className="text-xs text-gray-500 dark:text-gray-400">Documents</span>
                <span className="font-medium text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                  <div className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-[#0A3269]" />
                    <span>{selectedMobileApp.attachments.length} uploaded</span>
                  </div>
                </span>
              </div>
              {(selectedMobileApp.metadata as any)?.govStage && (
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Government Stage</span>
                  <Badge className="bg-[#0A3269]/10 text-[#0A3269] dark:bg-[#0A3269]/20 dark:text-[#4A8ABF] border-0 rounded-full px-3 py-1 text-[10px] font-medium">
                    {(selectedMobileApp.metadata as any).govStage}
                  </Badge>
                </div>
              )}
            </div>
          </motion.div>

          {/* Documents with Image Preview */}
          {selectedMobileApp.attachments.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[#0A3269] to-[#4A8ABF]" />
                  <h4 className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Uploaded Documents ({selectedMobileApp.attachments.length})
                  </h4>
                </div>
                <span className="text-[9px] text-gray-400 dark:text-gray-500">
                  {selectedMobileApp.attachments.filter((d: any) => d.status === 'approved').length} approved
                </span>
              </div>
              <div className="space-y-2">
                {selectedMobileApp.attachments.slice(0, 5).map((doc: any, idx: number) => {
                  const fileUrl = doc.url || doc.fileUrl || doc.path || '';
                  const isImage = fileUrl?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|heic|heif)$/i) ||
                                  doc.mimeType?.startsWith('image/');
                  
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.01, x: 2 }}
                      className="flex items-center gap-3 bg-white dark:bg-white/5 p-3 rounded-xl border border-gray-100/80 dark:border-white/5 hover:border-[#0A3269]/20 dark:hover:border-[#0A3269]/30 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      {/* Document Thumbnail Preview */}
                      <div 
                        className="relative flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer"
                        onClick={() => {
                          if (fileUrl) {
                            window.open(fileUrl, '_blank');
                          }
                        }}
                      >
                        {fileUrl && isImage ? (
                          <img 
                            src={fileUrl} 
                            alt={doc.type || 'Document'}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const fallback = document.createElement('div');
                                fallback.className = 'w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700';
                                fallback.innerHTML = `<svg class="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0A3269]/10 to-[#4A8ABF]/10 dark:from-[#0A3269]/20 dark:to-[#4A8ABF]/20">
                            <FileText className="w-5 h-5 text-[#0A3269] dark:text-[#4A8ABF]" />
                          </div>
                        )}
                        
                        {/* Status Badge on Thumbnail */}
                        {doc.status && (
                          <div className="absolute -top-1 -right-1">
                            <Badge 
                              className={cn(
                                'text-[7px] rounded-full px-1.5 py-0.5 border-0 shadow-sm',
                                doc.status === 'approved' && 'bg-emerald-500 text-white',
                                doc.status === 'rejected' && 'bg-red-500 text-white',
                                doc.status === 'pending' && 'bg-amber-500 text-white',
                                doc.status === 'under_review' && 'bg-blue-500 text-white'
                              )}
                            >
                              {doc.status === 'approved' ? '✓' :
                               doc.status === 'rejected' ? '✕' :
                               doc.status === 'pending' ? '⏳' :
                               doc.status === 'under_review' ? '⟳' :
                               doc.status?.slice(0, 1).toUpperCase()}
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      {/* Document Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                          {doc.type?.replace(/_/g, ' ') || 'Document'}
                        </p>
                        {doc.originalName && (
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{doc.originalName}</p>
                        )}
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] text-gray-400 dark:text-gray-500">
                            {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(0)} KB` : ''}
                          </span>
                          {fileUrl && (
                            <>
                              <span className="w-px h-2 bg-gray-300 dark:bg-gray-600" />
                              <button 
                                className="text-[9px] text-[#0A3269] dark:text-[#4A8ABF] hover:underline flex items-center gap-0.5"
                                onClick={() => window.open(fileUrl, '_blank')}
                              >
                                <Eye className="w-2.5 h-2.5" />
                                Preview
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                {selectedMobileApp.attachments.length > 5 && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-center text-gray-400 dark:text-gray-500 py-1.5 bg-gray-50 dark:bg-white/5 rounded-xl"
                  >
                    +{selectedMobileApp.attachments.length - 5} more documents
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[#0A3269] to-[#4A8ABF]" />
                <h4 className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-[#0A3269]" />
                  Quick Actions
                </h4>
              </div>
              <span className="text-[9px] text-gray-400 dark:text-gray-500">
                Tap to execute
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: Upload, label: 'Upload', action: () => handleDocumentUpload(selectedMobileApp._id), color: 'blue', desc: 'Add documents' },
                { icon: FileText, label: 'Result', action: () => handleResultDocumentUpload(selectedMobileApp._id), color: 'emerald', desc: 'Upload result' },
                { icon: FileCheck, label: 'Review', action: () => handleDocumentReview(selectedMobileApp._id), disabled: !selectedMobileApp.attachments?.length, color: 'purple', desc: 'Review docs' },
                { icon: Key, label: 'OTP', action: () => handleRequestOTP(selectedMobileApp._id), color: 'amber', desc: 'Request OTP' },
                { icon: Shield, label: 'Fraud', action: () => handleFraudCheck(selectedMobileApp._id), color: 'red', desc: 'Check fraud' },
                { icon: AlertCircle, label: 'Status', action: () => handleStatusUpdateClick(selectedMobileApp._id, selectedMobileApp.status), color: 'blue', desc: 'Update status' },
              ].map((action, idx) => {
                const colorMap: Record<string, string> = {
                  blue: 'hover:border-[#0A3269]/40 hover:bg-[#0A3269]/5 dark:hover:bg-[#0A3269]/20 hover:text-[#0A3269] dark:hover:text-[#4A8ABF]',
                  emerald: 'hover:border-emerald-300 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400',
                  purple: 'hover:border-purple-300 hover:bg-purple-50/80 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400',
                  amber: 'hover:border-amber-300 hover:bg-amber-50/80 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400',
                  red: 'hover:border-red-300 hover:bg-red-50/80 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400',
                };
                
                const iconColorMap: Record<string, string> = {
                  blue: 'text-[#0A3269] dark:text-[#4A8ABF]',
                  emerald: 'text-emerald-500',
                  purple: 'text-purple-500',
                  amber: 'text-amber-500',
                  red: 'text-red-500',
                };
                
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={action.disabled}
                    onClick={() => {
                      action.action();
                      setShowMobileDetails(false);
                    }}
                    className={cn(
                      'group relative flex items-center gap-2.5 p-3.5 rounded-xl transition-all duration-300 border',
                      'bg-white/90 dark:bg-gray-900/90 border-gray-200/80 dark:border-gray-700/80',
                      colorMap[action.color],
                      action.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                      'pl-4 shadow-sm hover:shadow-lg'
                    )}
                  >
                    <div className={cn(
                      'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full transition-all duration-300',
                      colorMap[action.color].includes('[#0A3269]') ? 'bg-gradient-to-b from-[#0A3269] to-[#4A8ABF]' :
                      colorMap[action.color].includes('emerald') ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' :
                      colorMap[action.color].includes('purple') ? 'bg-gradient-to-b from-purple-400 to-purple-600' :
                      colorMap[action.color].includes('amber') ? 'bg-gradient-to-b from-amber-400 to-amber-600' :
                      'bg-gradient-to-b from-red-400 to-red-600',
                      'opacity-0 group-hover:opacity-100 group-hover:h-10 group-hover:scale-y-110'
                    )} />
                    
                    <div className={cn(
                      'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                      'bg-gradient-to-r from-transparent via-white/5 to-transparent'
                    )} />
                    
                    <div className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 relative z-10',
                      'bg-gray-100/80 dark:bg-gray-800/80 group-hover:bg-white/20',
                      'shadow-sm group-hover:shadow-md'
                    )}>
                      <action.icon className={cn(
                        'w-4.5 h-4.5 transition-all duration-300',
                        iconColorMap[action.color],
                        'group-hover:scale-110 group-hover:rotate-3'
                      )} />
                    </div>
                    
                    <div className="flex-1 text-left min-w-0 relative z-10">
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 block group-hover:text-current transition-colors duration-300 truncate">
                        {action.label}
                      </span>
                      <span className="text-[9px] text-gray-400 dark:text-gray-500 block group-hover:text-current/70 transition-colors duration-300 truncate">
                        {action.desc}
                      </span>
                    </div>
                    
                    <ChevronRight className={cn(
                      'w-3.5 h-3.5 transition-all duration-300 flex-shrink-0 relative z-10',
                      'text-gray-300 dark:text-gray-600',
                      'group-hover:text-current group-hover:translate-x-1 group-hover:scale-110'
                    )} />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Footer Action */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => setShowMobileDetails(false)}
            className="w-full py-3.5 rounded-xl bg-gray-100/80 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-200/80 dark:hover:bg-white/10 transition-all duration-300 border border-gray-200/50 dark:border-white/5 backdrop-blur-sm"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
        {/* Dialogs */}
        <DocumentUploadDialog
          open={showDocumentUpload}
          onOpenChange={setShowDocumentUpload}
          applicationId={(selectedApplication as any)?._id || ''}
          onUploadComplete={() => {
            handleDocumentsUploaded([]);
            fetchAllApplications();
          }}
          isResultDocument={false}
        />

        <DocumentUploadDialog
          open={showResultDocumentUpload}
          onOpenChange={setShowResultDocumentUpload}
          applicationId={(selectedApplication as any)?._id || ''}
          onUploadComplete={() => {
            fetchAllApplications();
          }}
          isResultDocument={true}
        />

        <DocumentReviewDialog
          open={showDocumentReview}
          onOpenChange={setShowDocumentReview}
          documents={(selectedApplication?.attachments || []).map((att: any) => ({
            ...att,
            status: att.status || 'pending'
          }))}
          applicationId={selectedApplication?._id || ''}
          onReview={handleAttachmentReview}
        />

     {/* Status Dialog */}
<Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
  <DialogContent className="sm:max-w-md rounded-2xl bg-white dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-800 shadow-2xl">
    <DialogHeader>
      <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <RefreshCw className="w-5 h-5 text-[#0A3269] dark:text-[#4A8ABF]" />
        Update Status
      </DialogTitle>
      <DialogDescription className="text-gray-500 dark:text-gray-400">
        Change the status of this application and add a note if needed.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">Current Status</Label>
        <div className="mt-1.5">
          {statusUpdateData && <ModernStatusBadge status={statusUpdateData.currentStatus} />}
        </div>
      </div>
      <div>
        <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">New Status</Label>
        <Select 
          value={statusUpdateData?.newStatus || ''} 
          onValueChange={(value) => setStatusUpdateData(prev => prev ? {...prev, newStatus: value} : null)}
        >
          <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/90 hover:border-[#0A3269]/40 dark:hover:border-[#4A8ABF]/40 transition-colors">
            <SelectValue placeholder="Select new status" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
            <SelectItem value="submitted" className="hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:bg-gray-50 dark:focus:bg-gray-700/50">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Submitted
              </span>
            </SelectItem>
            <SelectItem value="under_review" className="hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:bg-gray-50 dark:focus:bg-gray-700/50">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                Under Review
              </span>
            </SelectItem>
            <SelectItem value="docs_required" className="hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:bg-gray-50 dark:focus:bg-gray-700/50">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Documents Required
              </span>
            </SelectItem>
            <SelectItem value="approved" className="hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:bg-gray-50 dark:focus:bg-gray-700/50">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Approved
              </span>
            </SelectItem>
            <SelectItem value="rejected" className="hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:bg-gray-50 dark:focus:bg-gray-700/50">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Rejected
              </span>
            </SelectItem>
            <SelectItem value="closed" className="hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:bg-gray-50 dark:focus:bg-gray-700/50">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                Closed
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">Note (Optional)</Label>
        <Input
          placeholder="Add a note about this status change..."
          value={statusUpdateData?.note || ''}
          onChange={(e) => setStatusUpdateData(prev => prev ? {...prev, note: e.target.value} : null)}
          className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/90 focus:border-[#0A3269]/40 dark:focus:border-[#4A8ABF]/40 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button
          onClick={() => {
            if (statusUpdateData) {
              handleStatusUpdateDialog(statusUpdateData.applicationId, statusUpdateData.newStatus, statusUpdateData.note);
            }
          }}
          disabled={!statusUpdateData?.newStatus || statusUpdateData?.newStatus === statusUpdateData?.currentStatus}
          className="flex-1 rounded-xl bg-[#0A3269] hover:bg-[#1A4A8A] text-white shadow-lg shadow-[#0A3269]/25 hover:shadow-xl hover:shadow-[#0A3269]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-0"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Update Status
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setShowStatusDialog(false)}
          className="rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          Cancel
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>

        {/* OTP Dialog */}
   {/* OTP Dialog - Modern Premium */}
<Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
  <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-800 shadow-2xl">
    <DialogHeader className="sticky top-0 bg-white dark:bg-gray-900/95 z-10 pb-4 border-b border-gray-100 dark:border-gray-800">
      <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Key className="w-5 h-5 text-[#0A3269] dark:text-[#4A8ABF]" />
        Request OTP
      </DialogTitle>
      <DialogDescription className="text-gray-500 dark:text-gray-400">
        Send a one-time code to the applicant and verify within the selected time.
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-5 py-4">
      {/* OTP Duration Selection */}
      <div>
        <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">OTP Duration</Label>
        <div className="grid grid-cols-3 gap-2 mt-1.5">
          {[2, 3, 5].map(m => (
            <Button 
              key={m} 
              variant={otpMinutes === m ? 'default' : 'outline'}
              className={cn(
                'rounded-xl h-11 transition-all duration-300',
                otpMinutes === m 
                  ? 'bg-[#0A3269] hover:bg-[#1A4A8A] text-white shadow-lg shadow-[#0A3269]/25 border-0 hover:shadow-xl hover:shadow-[#0A3269]/30' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-[#0A3269]/40 dark:hover:border-[#4A8ABF]/40 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              )}
              onClick={() => setOtpMinutes(m)}
            >
              {m} min
            </Button>
          ))}
        </div>
      </div>

      {/* Phone Input */}
      <div>
        <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">Applicant Phone</Label>
        <div className="relative mt-1.5">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <Input 
            value={otpPhone} 
            onChange={(e) => setOtpPhone(e.target.value)} 
            placeholder="e.g. +971 50 123 4567"
            className="pl-10 rounded-xl h-11 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/90 focus:border-[#0A3269]/40 dark:focus:border-[#4A8ABF]/40 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Send OTP Button */}
      {!otpExpiresAt && (
        <Button 
          disabled={!otpPhone || otpLoading} 
          onClick={async () => {
            try {
              setOtpLoading(true);
              const token = localStorage.getItem('authToken') || '';
              await fetch(`${apiBase}/api/v1/auth/otp/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ phoneNumber: otpPhone, expiresInMinutes: otpMinutes })
              });
              const expire = Date.now() + otpMinutes * 60 * 1000;
              setOtpExpiresAt(expire);
              toast.success('OTP sent to applicant');
            } catch (e) {
              console.error(e);
              toast.error('Failed to send OTP');
            } finally { setOtpLoading(false); }
          }}
          className="w-full rounded-xl h-11 bg-[#0A3269] hover:bg-[#1A4A8A] text-white shadow-lg shadow-[#0A3269]/25 hover:shadow-xl hover:shadow-[#0A3269]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-0"
        >
          {otpLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send OTP
            </>
          )}
        </Button>
      )}

      {/* OTP Verification Section */}
      {otpExpiresAt && (
        <div className="space-y-4 pt-2">
          {/* Timer */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">Expires in</span>
            </div>
            <span className="font-mono font-bold text-lg text-[#0A3269] dark:text-[#4A8ABF]">
              {otpCountdown}
            </span>
          </div>

          {/* OTP Code Input */}
          <div>
            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400">Enter Verification Code</Label>
            <Input 
              maxLength={6} 
              value={otpCode} 
              onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} 
              placeholder="Enter 6-digit code"
              className="text-center text-lg font-mono tracking-[0.3em] rounded-xl h-11 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/90 focus:border-[#0A3269]/40 dark:focus:border-[#4A8ABF]/40 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              className="flex-1 rounded-xl h-11 bg-[#0A3269] hover:bg-[#1A4A8A] text-white shadow-lg shadow-[#0A3269]/25 hover:shadow-xl hover:shadow-[#0A3269]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-0"
              disabled={otpCode.length !== 6 || otpLoading}
              onClick={async () => {
                try {
                  setOtpLoading(true);
                  const token = localStorage.getItem('authToken') || '';
                  const res = await fetch(`${apiBase}/api/v1/auth/otp/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ phoneNumber: otpPhone, code: otpCode })
                  });
                  const data = await res.json();
                  if (res.ok && (data?.success || data?.status === 'success')) {
                    toast.success('OTP verified successfully');
                    setShowOtpDialog(false);
                    setOtpCode('');
                    setOtpExpiresAt(null);
                  } else {
                    toast.error(data?.message || 'Invalid code');
                  }
                } catch (e) {
                  console.error(e);
                  toast.error('Verification failed');
                } finally { setOtpLoading(false); }
              }}
            >
              {otpLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="rounded-xl h-11 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              onClick={() => { 
                setOtpExpiresAt(null); 
                setOtpCode(''); 
                setOtpLoading(false);
                toast.info('OTP reset, you can request a new one');
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Resend
            </Button>
          </div>
        </div>
      )}

      {/* Cancel Button (when not in OTP verification) */}
      {!otpExpiresAt && (
        <Button 
          variant="outline" 
          onClick={() => setShowOtpDialog(false)}
          className="w-full rounded-xl h-11 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          Cancel
        </Button>
      )}
    </div>
  </DialogContent>
</Dialog>
      </div>
    );
  }

  // ========== TABLET & DESKTOP VIEW ==========
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
    {/* Modern Header */}
<motion.header
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  className="sticky top-0 z-40 bg-white/90 dark:bg-black/10 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5 shadow-sm"
>
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="flex items-center justify-between h-14 sm:h-16">
    {/* Logo Section */}
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0A3269] dark:bg-white flex items-center justify-center shadow-lg shadow-[#0A3269]/25 dark:shadow-white/25">
        <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-white dark:text-[#0A3269]" strokeWidth={1.8} />
      </div>
      <div>
        <h1 className="text-sm sm:text-lg font-bold text-[#0A3269] dark:text-white tracking-tight flex items-center gap-1.5">
          <span className="text-[#0A3269] dark:text-white text-base font-medium">
            TMMT Portal
          </span>
        </h1>
        <p className="text-[9px] sm:text-[11px] text-[#0A3269]/60 dark:text-white/60 font-medium hidden xs:block">
          Government Services
        </p>
      </div>
    </div>

      {/* Right Section */}
      <div className="flex items-center gap-1.5 sm:gap-3">

        {/* Language & Theme */}
        <LanguageSwitcher />
        <ThemeSelector compact />

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-1.5 sm:p-2 rounded-xl hover:bg-[#0A3269]/5 dark:hover:bg-[#0A3269]/10 transition-colors"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] sm:min-w-[20px] h-4 sm:h-5 px-1 sm:px-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-[8px] sm:text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
            {totalNotifications > 9 ? '9+' : totalNotifications}
          </span>
        </motion.button>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 sm:h-8 bg-gray-200 dark:bg-gray-700" />

        {/* User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#0A3269] transition-colors">
              {(user as any)?.firstName} {(user as any)?.lastName}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">Amer Officer</p>
          </div>
          <div className="relative">
 <Avatar className="w-8 h-8 sm:w-10 sm:h-10 ring-2 ring-[#0A3269]/20 dark:ring-white/10 group-hover:ring-[#0A3269]/40 dark:group-hover:ring-white/30 transition-all duration-300 ring-offset-2 shadow-sm">
  <AvatarImage src={(user as any)?.avatar} />
  <AvatarFallback className="bg-[#0A3269] dark:bg-white text-white dark:text-[#0A3269] font-medium text-xs sm:text-sm">
    {(user as any)?.firstName?.[0]}{(user as any)?.lastName?.[0]}
  </AvatarFallback>
</Avatar>
          </div>
        </div>
      </div>
    </div>
  </div>
</motion.header>



      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Invites Banner */}
        {invites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {invites[0].userName || 'User'} needs assistance
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Service: {invites[0].service || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25 border-0"
                    onClick={() => {
                      const inv = invites[0];
                      const socket = getSocket();
                      socket.emit('officer_accept_request', { requestId: inv.requestId || inv.roomId });
                      setInvites(prev => prev.slice(1));
                      setRooms(prev => prev.find(r => r.roomId === inv.roomId) ? prev : [{ roomId: inv.roomId, userName: inv.userName, service: inv.service, unread: 0 }, ...prev]);
                      setCurrentRoomId(inv.roomId);
                    }}
                  >
                    Accept & Join
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="rounded-xl border-gray-200 dark:border-gray-800"
                    onClick={() => setInvites(prev => prev.slice(1))}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
{/* ─── Modern Stats Grid ─────────────────────────────────────────────── */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-8"
>
  {[
    {
      icon: Users,
      label: 'Total Applications',
      value: applications.length,
      trend: '+12%',
      trendLabel: 'vs last month',
      color: '#0A3269',
    },
    {
      icon: Clock,
      label: 'Submitted',
      value: (stats as any)?.byStatus?.find?.((x: any) => x._id === 'submitted')?.count || 0,
      trend: 'Pending Review',
      trendLabel: 'Awaiting',
      color: '#F59E0B',
    },
    {
      icon: Clock3,
      label: 'Under Review',
      value: (stats as any)?.byStatus?.find?.((x: any) => x._id === 'under_review')?.count || 0,
      trend: 'In Progress',
      trendLabel: 'Active',
      color: '#8B5CF6',
    },
    {
      icon: CheckCircle,
      label: 'Approved',
      value: (stats as any)?.byStatus?.find?.((x: any) => x._id === 'approved')?.count || 0,
      trend: 'Completed',
      trendLabel: 'Success',
      color: '#10B981',
    },
  ].map((stat, index) => (
    <motion.div
      key={stat.label}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
        {/* Subtle Glow */}
        <div
          className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10 blur-2xl"
          style={{ background: `radial-gradient(circle at top right, ${stat.color}, transparent 70%)` }}
        />

        <div className="relative flex items-start justify-between gap-2">
          <div className="space-y-0.5 min-w-0 flex-1">
            <p className="text-[9px] sm:text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              {stat.label}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              {stat.value}
            </p>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-[9px] sm:text-[10px] font-light text-muted-foreground">
                {stat.trend}
              </span>
              <span className="text-[9px] sm:text-[10px] font-light text-muted-foreground/60">
                {stat.trendLabel}
              </span>
            </div>
          </div>

          {/* Icon Container with Gradient */}
          <div
            className="rounded-xl p-2.5 shadow-lg flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${stat.color}, ${stat.color}dd)` }}
          >
            <stat.icon className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-1 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min((stat.value / (applications.length || 1)) * 100, 100)}%`,
            }}
            transition={{ duration: 0.6, delay: 0.2 + index * 0.05 }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(to right, ${stat.color}, ${stat.color}cc)` }}
          />
        </div>
      </div>
    </motion.div>
  ))}
</motion.div>





        {/* Security Alert Banner */}
        {fraudAlerts?.filter(alert => alert.status === 'open').length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Security Alert</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    {fraudAlerts?.filter(alert => alert.status === 'open').length} active alerts require attention
                  </p>
                </div>
              </div>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-lg shadow-amber-500/25 border-0">
                Review Alerts
              </Button>
            </div>
          </motion.div>
        )}
        












{/* ─── Tabs ────────────────────────────────────────────────────────── */}
<Tabs defaultValue="applications" className="w-full">
 <TabsList className={cn(
  "relative bg-white dark:bg-black/10 border border-gray-200/60 dark:border-white/5 p-1 rounded-xl shadow-sm w-full",
  isTablet ? "flex-wrap gap-1" : ""
)}>
  {[
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'package-applications', label: 'Package Apps', icon: Package },
    { id: 'checks', label: 'Status Checks', icon: CheckCircle },
    { id: 'fraud', label: 'Fraud', icon: Shield },
    { id: 'penalties', label: 'Penalties', icon: Gavel },
    { id: 'otp', label: 'OTP', icon: Key },
    { id: 'statistics', label: 'Stats', icon: BarChart3 },
    { id: 'conversations', label: 'Chat', icon: MessageCircle },
  ].map((tab, index) => (
    <motion.div
      key={tab.id}
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn("flex-1", isTablet ? "min-w-[60px]" : "")}
    >
      <TabsTrigger 
        value={tab.id}
        className={cn(
          'relative rounded-lg px-3 py-1.5 text-xs font-light transition-all duration-300 w-full',
          isTablet ? 'min-w-[60px]' : 'w-full',
          'data-[state=active]:bg-[#0A3269] dark:data-[state=active]:bg-white',
          'data-[state=active]:text-white dark:data-[state=active]:text-black',
          'data-[state=active]:shadow-sm',
          'data-[state=inactive]:text-gray-500 dark:data-[state=inactive]:text-gray-400',
          'data-[state=inactive]:hover:bg-gray-100/50 dark:data-[state=inactive]:hover:bg-white/5',
          'hover:scale-[1.02] active:scale-[0.98]'
        )}
      >
        <span className="relative flex items-center justify-center gap-1.5 z-10">
          <tab.icon className={cn(
            "w-3.5 h-3.5 transition-all duration-300",
            "data-[state=active]:text-white dark:data-[state=active]:text-black",
            "data-[state=inactive]:text-gray-400 dark:data-[state=inactive]:text-gray-500",
            "data-[state=active]:scale-105"
          )} />
          <span className="hidden xs:inline">{tab.label}</span>
          <span className="xs:hidden">{tab.label.substring(0,3)}</span>
          {tab.id === 'conversations' && (
            <span className="ml-1 px-1.5 py-0.5 bg-rose-500/90 text-white text-[9px] font-light rounded-full">
              {invites.length + rooms.reduce((acc, r) => acc + r.unread, 0)}
            </span>
          )}
        </span>
      </TabsTrigger>
    </motion.div>
  ))}
</TabsList>
  <TabsContent value="applications" className="space-y-4">
    {/* ─── Search & Filter ────────────────────────────────────────────────── */}
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="flex-1 min-w-[180px]">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-focus-within:text-[#0A3269] dark:group-focus-within:text-white transition-colors" />
          </div>
          <Input
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-2 bg-white dark:bg-black/10 border-gray-200/60 dark:border-white/10 rounded-lg focus:ring-1 focus:ring-[#0A3269]/30 dark:focus:ring-white/20 focus:border-[#0A3269] dark:focus:border-white transition-all text-sm font-light text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 h-9"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] bg-white dark:bg-black/10 border-gray-200/60 dark:border-white/10 rounded-lg text-sm font-light text-gray-900 dark:text-white h-9">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="rounded-lg bg-white dark:bg-black/15 border-gray-200/60 dark:border-white/10">
            <SelectItem value="all">
              <span className="flex items-center gap-2 text-sm font-light text-gray-700 dark:text-gray-300">
                <FileText className="w-3.5 h-3.5" />
                All Statuses
              </span>
            </SelectItem>
            <SelectItem value="submitted">
              <span className="flex items-center gap-2 text-sm font-light text-gray-700 dark:text-gray-300">
                <Clock className="w-3.5 h-3.5" />
                Submitted
              </span>
            </SelectItem>
            <SelectItem value="under_review">
              <span className="flex items-center gap-2 text-sm font-light text-gray-700 dark:text-gray-300">
                <Clock3 className="w-3.5 h-3.5" />
                Under Review
              </span>
            </SelectItem>
            <SelectItem value="docs_required">
              <span className="flex items-center gap-2 text-sm font-light text-gray-700 dark:text-gray-300">
                <AlertCircle className="w-3.5 h-3.5" />
                Docs Required
              </span>
            </SelectItem>
            <SelectItem value="approved">
              <span className="flex items-center gap-2 text-sm font-light text-gray-700 dark:text-gray-300">
                <CheckCircle className="w-3.5 h-3.5" />
                Approved
              </span>
            </SelectItem>
            <SelectItem value="rejected">
              <span className="flex items-center gap-2 text-sm font-light text-gray-700 dark:text-gray-300">
                <XCircle className="w-3.5 h-3.5" />
                Rejected
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg bg-white dark:bg-black/40 border border-gray-200/60 dark:border-white/10 hover:border-[#0A3269]/30 dark:hover:border-white/20 transition-all duration-300 h-9 w-9 flex items-center justify-center"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FilterIcon className={cn(
            "w-3.5 h-3.5 transition-colors duration-300",
            showFilters ? "text-[#0A3269] dark:text-white" : "text-gray-400 dark:text-gray-500"
          )} />
        </motion.button>
      </div>
    </div>

    {/* ─── Quick Stats Chips ────────────────────────────────────────────────── */}
    <div className="flex flex-wrap gap-1.5 mb-4">
      {[
        { label: 'All', count: applications.length },
        { label: 'Submitted', count: (stats as any)?.byStatus?.find?.((x: any) => x._id==='submitted')?.count || 0 },
        { label: 'Review', count: (stats as any)?.byStatus?.find?.((x: any) => x._id==='under_review')?.count || 0 },
        { label: 'Approved', count: (stats as any)?.byStatus?.find?.((x: any) => x._id==='approved')?.count || 0 },
        { label: 'Rejected', count: (stats as any)?.byStatus?.find?.((x: any) => x._id==='rejected')?.count || 0 },
      ].map((chip) => {
        const isActive = statusFilter === chip.label.toLowerCase() || (chip.label === 'All' && statusFilter === 'all');
        return (
          <motion.button
            key={chip.label}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
              'px-3 py-1 rounded-full text-[10px] font-light transition-all duration-300',
              isActive
                ? 'bg-[#0A3269] dark:bg-white text-white dark:text-black shadow-sm shadow-[#0A3269]/20'
                : 'bg-gray-100/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-white/10'
            )}
            onClick={() => setStatusFilter(chip.label === 'All' ? 'all' : chip.label.toLowerCase())}
          >
            {chip.label} <span className="opacity-50">({chip.count})</span>
          </motion.button>
        );
      })}
    </div>

    {/* ─── Applications List ────────────────────────────────────────────────── */}
    {isTablet ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredApplications.map((application) => (
          <MobileApplicationCard
            key={application._id}
            application={application}
            onPress={() => {
              setSelectedApplication(application);
              setShowApplicationDetails(true);
            }}
            onAction={(action) => {
              const app = application;
              switch (action) {
                case 'view':
                  setSelectedApplication(app);
                  setShowApplicationDetails(true);
                  break;
                case 'upload':
                  handleDocumentUpload(app._id);
                  break;
                case 'review':
                  handleDocumentReview(app._id);
                  break;
                case 'otp':
                  handleRequestOTP(app._id);
                  break;
                case 'fraud':
                  handleFraudCheck(app._id);
                  break;
                case 'result':
                  handleResultDocumentUpload(app._id);
                  break;
                default:
                  break;
              }
            }}
          />
        ))}
        {filteredApplications.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <div className="w-14 h-14 rounded-xl bg-gray-100/60 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-7 h-7 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-base font-light text-gray-900 dark:text-white mb-1">No applications found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    ) : (
      <div className="space-y-2.5">
        {filteredApplications.map((application) => (
          <ApplicationRow
            key={application._id}
            application={application}
            isExpanded={expandedRows.has(application._id)}
            onToggle={() => toggleRowExpansion(application._id)}
            onStatusUpdate={handleStatusUpdateClick}
            onDocumentUpload={handleDocumentUpload}
            onDocumentReview={handleDocumentReview}
            onResultUpload={handleResultDocumentUpload}
            onRequestOTP={handleRequestOTP}
            onFraudCheck={handleFraudCheck}
            onSetGovStage={handleSetGovStage}
            onViewDetails={(app) => {
              setSelectedApplication(app);
              setShowApplicationDetails(true);
            }}
          />
        ))}
        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-xl bg-gray-100/60 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-7 h-7 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-base font-light text-gray-900 dark:text-white mb-1">No applications found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    )}
  </TabsContent>

  <TabsContent value="package-applications" className="space-y-4">
    <PackageApplicationsAdmin />
  </TabsContent>

  <TabsContent value="checks" className="space-y-4">
    <ChecksReviewPanel />
  </TabsContent>

  {/* ─── Other Tabs (Fraud, Penalties, OTP, Stats, Chat) ──────────────────── */}
  <TabsContent value="fraud" className="space-y-4">
    <div className="text-center py-12 text-sm font-light text-gray-500 dark:text-gray-400">
      Fraud alerts section
    </div>
  </TabsContent>

  <TabsContent value="penalties" className="space-y-4">
    <div className="text-center py-12 text-sm font-light text-gray-500 dark:text-gray-400">
      Penalties section
    </div>
  </TabsContent>

  <TabsContent value="otp" className="space-y-4">
    <div className="text-center py-12 text-sm font-light text-gray-500 dark:text-gray-400">
      OTP requests section
    </div>
  </TabsContent>

  <TabsContent value="statistics" className="space-y-4">
    <div className="text-center py-12 text-sm font-light text-gray-500 dark:text-gray-400">
      Statistics dashboard
    </div>
  </TabsContent>

  <TabsContent value="conversations" className="space-y-4">
    <div className="text-center py-12 text-sm font-light text-gray-500 dark:text-gray-400">
      Conversations (chat) section
    </div>
  </TabsContent>
<TabsContent value="conversations" className="space-y-6">
  <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
    <div className={cn(
      "grid",
      isTablet ? "grid-cols-12 h-[500px]" : "grid-cols-12 h-[600px]"
    )}>
    {/* ─── Chat Rooms Sidebar ────────────────────────────────────────── */}
<div className="col-span-4 border-r border-gray-200/60 dark:border-gray-800/60 p-4 overflow-y-auto bg-gradient-to-b from-gray-50/80 to-white/80 dark:from-black/40 dark:to-black/60 backdrop-blur-sm">
  {/* Header – with animated count */}
  <div className="flex items-center justify-between mb-5">
    <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2.5">
      <span className="relative">
        <MessageCircle className="w-4 h-4 text-black dark:text-white" />
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      </span>
      Active Rooms
    </h3>
    <Badge className="bg-gradient-to-r from-black to-gray-700 dark:from-white dark:to-gray-300 text-white dark:text-black rounded-full px-3 py-0.5 text-xs font-medium shadow-md">
      {rooms.length}
    </Badge>
  </div>

  <div className="space-y-2">
    {rooms.map((room) => (
      <motion.button
        key={room.roomId}
        whileHover={{ scale: 1.02, x: 4 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          setCurrentRoomId(room.roomId);
          setRooms(prev => prev.map(r => r.roomId === room.roomId ? { ...r, unread: 0 } : r));
          const socket = getSocket();
          const officerId = (user as any)?.id || (user as any)?._id;
          socket.emit('join_chat_room', { roomId: room.roomId, userId: officerId, officerId });
        }}
        className={cn(
          'w-full text-left p-3 rounded-xl border transition-all duration-300 relative overflow-hidden',
          currentRoomId === room.roomId 
            ? 'border-black dark:border-white bg-black/5 dark:bg-white/5 shadow-lg shadow-black/5 dark:shadow-white/5' 
            : 'border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-white/5 hover:bg-gray-100/70 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-gray-600'
        )}
      >
        {/* Active indicator glow */}
        {currentRoomId === room.roomId && (
          <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />
        )}
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar with status dot */}
            <div className="relative flex-shrink-0">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300',
                currentRoomId === room.roomId
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              )}>
                {room.userName?.[0] || 'U'}
              </div>
              {/* Online status indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900" />
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[100px]">
                  {room.userName || 'User'}
                </span>
                {room.unread > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[80px]">
                  {room.service || 'General'}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                <span className="text-[10px] text-gray-400 dark:text-gray-500">Active</span>
              </div>
            </div>
          </div>
          
          {/* Unread badge – animated */}
          {room.unread > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full text-[10px] px-2.5 min-w-[24px] h-6 flex items-center justify-center shadow-lg shadow-red-500/30">
                {room.unread > 9 ? '9+' : room.unread}
              </Badge>
            </motion.div>
          )}
        </div>
      </motion.button>
    ))}
    
    {/* Empty state – with illustration */}
    {rooms.length === 0 && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700" />
          <MessageCircle className="absolute inset-0 m-auto w-6 h-6 text-gray-400 dark:text-gray-500" />
        </div>
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300">No active rooms</h4>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-[150px]">
          Accept an invite to start chatting
        </p>
      </motion.div>
    )}
  </div>
</div>
      {/* Chat Content */}
      <div className="col-span-8 flex flex-col bg-white dark:bg-black">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {rooms.find(r => r.roomId === currentRoomId)?.userName || 'Select a room'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {rooms.find(r => r.roomId === currentRoomId)?.service || ''}
            </div>
          </div>
          {currentRoomId && (
            <Button 
              variant="outline" 
              size="sm"
              className="rounded-xl border-gray-200 dark:border-gray-800 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all"
              onClick={() => {
                const socket = getSocket();
                const officerId = (user as any)?.id || (user as any)?._id;
                socket.emit('leave_chat_room', { roomId: currentRoomId, userId: officerId });
                setRooms(prev => prev.filter(r => r.roomId !== currentRoomId));
                setCurrentRoomId(null);
              }}
            >
              <X className="w-4 h-4 mr-1" />
              Leave
            </Button>
          )}
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-black/30 max-h-[350px]">
          {(messagesByRoom[currentRoomId || ''] || []).map((m, idx) => {
            const mine = ((user as any)?.id || (user as any)?._id) === m.sender;
            return (
              <div key={`${m.id || 'm'}-${idx}`} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${mine ? 'order-2' : 'order-1'}`}>
                  <div className={cn(
                    'rounded-2xl px-4 py-2.5 text-sm',
                    m.type === 'system' 
                      ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      : mine 
                        ? 'bg-black dark:bg-white text-white dark:text-black shadow-md' 
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
                  )}>
                    {m.type === 'file' ? (
                      <div className="space-y-2">
                        <img src={apiBase + m.metadata?.fileUrl} alt={m.metadata?.fileName || 'File'} className="max-w-[150px] rounded-lg" />
                        <a href={apiBase + m.metadata?.fileUrl} target="_blank" className="text-xs underline block">
                          {m.metadata?.fileName || 'File'}
                        </a>
                      </div>
                    ) : (
                      <span>{m.content}</span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(m.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })}
          {typingByRoom[currentRoomId || ''] && (
            <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>Typing...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        
        {/* Chat Input */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-gray-50/80 dark:bg-gray-800/80 rounded-2xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-black/20 dark:focus-within:ring-white/20 transition-all">
              <button
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 transition-colors"
                disabled={!currentRoomId}
                onClick={() => {
                  const el = document.createElement('input');
                  el.type = 'file';
                  el.onchange = async (e: any) => {
                    const file = e.target.files?.[0];
                    if (!file || !currentRoomId) return;
                    const token = localStorage.getItem('authToken') || '';
                    const form = new FormData();
                    form.append('file', file);
                    form.append('roomId', currentRoomId);
                    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/chat/upload?roomId=${currentRoomId}`, {
                      method: 'POST',
                      headers: { Authorization: `Bearer ${token}` },
                      body: form
                    });
                    if (!res.ok) return;
                    const data = await res.json();
                    const { fileUrl, fileName } = data.data || {};
                    const socket = getSocket();
                    const officerId = (user as any)?.id || (user as any)?._id;
                    socket.emit('file_upload_start', { roomId: currentRoomId, userId: officerId, fileName: file.name, fileSize: file.size });
                    socket.emit('file_upload_complete', { roomId: currentRoomId, userId: officerId, fileUrl, fileName: fileName || file.name, fileSize: file.size });
                  };
                  el.click();
                }}
              >
                <Upload className="w-4 h-4" />
              </button>
              <Input
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder={currentRoomId ? 'Type a message...' : 'Select a room to chat'}
                value={chatInput}
                onChange={(e) => {
                  setChatInput(e.target.value);
                  if (currentRoomId) {
                    const socket = getSocket();
                    const officerId = (user as any)?.id || (user as any)?._id;
                    socket.emit('typing_start', { roomId: currentRoomId, userId: officerId });
                  }
                }}
                onBlur={() => {
                  if (currentRoomId) {
                    const socket = getSocket();
                    const officerId = (user as any)?.id || (user as any)?._id;
                    socket.emit('typing_stop', { roomId: currentRoomId, userId: officerId });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!chatInput.trim() || !currentRoomId) return;
                    const socket = getSocket();
                    const officerMessage = {
                      id: Date.now().toString(),
                      type: 'amer',
                      content: chatInput.trim(),
                      sender: 'amer',
                      timestamp: new Date().toISOString(),
                      metadata: { roomId: currentRoomId }
                    };
                    setMessagesByRoom(prev => ({
                      ...prev,
                      [currentRoomId]: [...(prev[currentRoomId] || []), officerMessage]
                    }));
                    socket.emit('chat_message', { 
                      message: chatInput.trim(), 
                      chatId: currentRoomId, 
                      type: 'text' 
                    });
                    setChatInput('');
                    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
                  }
                }}
                disabled={!currentRoomId}
              />
            </div>
            <Button
              className="rounded-2xl bg-black dark:bg-white text-white dark:text-black hover:shadow-md border-0 px-4 transition-all disabled:opacity-50"
              disabled={!currentRoomId}
              onClick={() => {
                if (!chatInput.trim() || !currentRoomId) return;
                const socket = getSocket();
                const officerMessage = {
                  id: Date.now().toString(),
                  type: 'amer',
                  content: chatInput.trim(),
                  sender: 'amer',
                  timestamp: new Date().toISOString(),
                  metadata: { roomId: currentRoomId }
                };
                setMessagesByRoom(prev => ({
                  ...prev,
                  [currentRoomId]: [...(prev[currentRoomId] || []), officerMessage]
                }));
                socket.emit('chat_message', { 
                  message: chatInput.trim(), 
                  chatId: currentRoomId, 
                  type: 'text' 
                });
                setChatInput('');
                setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
              }}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</TabsContent>
</Tabs>      </div>

      {/* Dialogs */}
      <DocumentUploadDialog
        open={showDocumentUpload}
        onOpenChange={setShowDocumentUpload}
        applicationId={(selectedApplication as any)?._id || ''}
        onUploadComplete={() => {
          handleDocumentsUploaded([]);
          fetchAllApplications();
        }}
        isResultDocument={false}
      />

      <ApplicationDetailsDrawer
        isOpen={showApplicationDetails}
        onClose={() => setShowApplicationDetails(false)}
        application={selectedApplication}
        onStatusUpdate={handleStatusUpdateOriginal}
        onDocumentUpload={handleDocumentUpload}
        onRequestDocuments={async (id, requested, note) => {
          await requestAdditionalDocuments(id, requested, note);
          await fetchAllApplications();
        }}
      />

      <DocumentReviewDialog
        open={showDocumentReview}
        onOpenChange={setShowDocumentReview}
        documents={(selectedApplication?.attachments || []).map((att: any) => ({
          ...att,
          status: att.status || 'pending'
        }))}
        applicationId={selectedApplication?._id || ''}
        onReview={handleAttachmentReview}
      />

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Update Status</DialogTitle>
            <DialogDescription>
              Change the status of this application and add a note if needed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-gray-500">Current Status</Label>
              <div className="mt-1">
                {statusUpdateData && <ModernStatusBadge status={statusUpdateData.currentStatus} />}
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-500">New Status</Label>
              <Select 
                value={statusUpdateData?.newStatus || ''} 
                onValueChange={(value) => setStatusUpdateData(prev => prev ? {...prev, newStatus: value} : null)}
              >
                <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-800">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="docs_required">Documents Required</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-500">Note (Optional)</Label>
              <Input
                placeholder="Add a note about this status change..."
                value={statusUpdateData?.note || ''}
                onChange={(e) => setStatusUpdateData(prev => prev ? {...prev, note: e.target.value} : null)}
                className="rounded-xl border-gray-200 dark:border-gray-800"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (statusUpdateData) {
                    handleStatusUpdateDialog(statusUpdateData.applicationId, statusUpdateData.newStatus, statusUpdateData.note);
                  }
                }}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25 border-0"
              >
                Update Status
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowStatusDialog(false)}
                className="rounded-xl border-gray-200 dark:border-gray-800"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Request OTP</DialogTitle>
            <DialogDescription>
              Send a one-time code to the applicant and verify within the selected time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[2,3,5].map(m => (
                <Button 
                  key={m} 
                  variant={otpMinutes===m ? 'default' : 'outline'}
                  className={cn(
                    'rounded-xl',
                    otpMinutes===m && 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0'
                  )}
                  onClick={() => setOtpMinutes(m)}
                >
                  {m} min
                </Button>
              ))}
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-500">Applicant Phone</Label>
              <Input 
                value={otpPhone} 
                onChange={(e)=>setOtpPhone(e.target.value)} 
                placeholder="e.g. +9715xxxxxxxx"
                className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            {!otpExpiresAt && (
              <Button 
                disabled={!otpPhone || otpLoading} 
                onClick={async ()=>{
                  try {
                    setOtpLoading(true);
                    const token = localStorage.getItem('authToken') || '';
                    await fetch(`${apiBase}/api/v1/auth/otp/request`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ phoneNumber: otpPhone, expiresInMinutes: otpMinutes })
                    });
                    const expire = Date.now() + otpMinutes*60*1000;
                    setOtpExpiresAt(expire);
                    toast.success('OTP sent to applicant');
                  } catch (e) {
                    console.error(e);
                    toast.error('Failed to send OTP');
                  } finally { setOtpLoading(false); }
                }}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25 border-0"
              >
                Send OTP
              </Button>
            )}
            {otpExpiresAt && (
              <div className="space-y-3">
                <div className="text-sm text-gray-500">Expires in <span className="font-mono font-bold text-gray-900">{otpCountdown}</span></div>
                <Input 
                  maxLength={6} 
                  value={otpCode} 
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} 
                  placeholder="Enter 6-digit code"
                  className="text-center text-lg font-mono tracking-widest rounded-xl border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500/20"
                />
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25 border-0"
                    disabled={otpCode.length!==6 || otpLoading}
                    onClick={async ()=>{
                      try {
                        setOtpLoading(true);
                        const token = localStorage.getItem('authToken') || '';
                        const res = await fetch(`${apiBase}/api/v1/auth/otp/verify`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ phoneNumber: otpPhone, code: otpCode })
                        });
                        const data = await res.json();
                        if (res.ok && (data?.success || data?.status==='success')) {
                          toast.success('OTP verified');
                          setShowOtpDialog(false);
                        } else {
                          toast.error(data?.message || 'Invalid code');
                        }
                      } catch (e) {
                        console.error(e);
                        toast.error('Verification failed');
                      } finally { setOtpLoading(false); }
                    }}
                  >
                    Verify
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-xl border-gray-200 dark:border-gray-800"
                    onClick={()=>{ setOtpExpiresAt(null); setOtpCode(''); }}
                  >
                    Resend
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <DocumentUploadDialog
        open={showResultDocumentUpload}
        onOpenChange={setShowResultDocumentUpload}
        applicationId={(selectedApplication as any)?._id || ''}
        onUploadComplete={() => {
          fetchAllApplications();
        }}
        isResultDocument={true}
      />
    </div>
  );
};

export default AmerDashboard;