"use client";

import {
  CalendarClock,
  Plane,
  BriefcaseBusiness,
  MapPin,
  FileSearch,
  FileWarning,
  Building2,
  Clock,
  ArrowUpRight,
  Sparkles,
  Star,
  Timer,
  Users,
  Shield,
  Gem,
  TrendingUp,
  CheckCircle,
  Zap,
  Crown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Service } from '@/lib/services';
import { motion } from 'framer-motion';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'calendar-clock': CalendarClock,
  'plane-off': Plane,
  'briefcase-off': BriefcaseBusiness,
  'map-pin': MapPin,
  'file-search': FileSearch,
  'file-warning': FileWarning,
  'building-2': Building2,
  'clock-alert': Clock,
};

// Premium color gradients for cards
const GRADIENT_MAP: Record<string, string> = {
  'calendar-clock': 'from-blue-500 to-cyan-500',
  'plane-off': 'from-purple-500 to-pink-500',
  'briefcase-off': 'from-amber-500 to-orange-500',
  'map-pin': 'from-emerald-500 to-teal-500',
  'file-search': 'from-violet-500 to-indigo-500',
  'file-warning': 'from-red-500 to-rose-500',
  'building-2': 'from-slate-600 to-gray-600',
  'clock-alert': 'from-yellow-500 to-amber-500',
};

const SHADOW_MAP: Record<string, string> = {
  'calendar-clock': 'shadow-blue-500/20',
  'plane-off': 'shadow-purple-500/20',
  'briefcase-off': 'shadow-amber-500/20',
  'map-pin': 'shadow-emerald-500/20',
  'file-search': 'shadow-violet-500/20',
  'file-warning': 'shadow-red-500/20',
  'building-2': 'shadow-slate-600/20',
  'clock-alert': 'shadow-yellow-500/20',
};

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
  index: number;
}

export function ServiceCard({ service, onSelect, index }: ServiceCardProps) {
  const Icon = iconMap[service.icon] || FileSearch;
  const gradient = GRADIENT_MAP[service.icon] || 'from-slate-500 to-gray-500';
  const shadow = SHADOW_MAP[service.icon] || 'shadow-slate-500/20';

  // Card variants for animation
  const cardVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5, 
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1] 
      }
    },
    hover: {
      y: -8,
      transition: { 
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1] 
      }
    }
  };

  const iconVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.1, 
      rotate: -6,
      transition: { duration: 0.3 }
    }
  };

  const arrowVariants = {
    initial: { rotate: 0 },
    hover: { 
      rotate: -45,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.button
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(service)}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl",
        "bg-white dark:bg-[#0A1628]",
        "border border-slate-200/60 dark:border-white/8",
        "transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
        "shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.4)]",
        "hover:shadow-[0_20px_60px_-15px_rgba(10,50,105,0.2)] dark:hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
        "text-left w-full"
      )}
    >
      {/* Premium Glass Shimmer - subtle */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 dark:from-white/3 dark:to-white/3" />
      </div>

      {/* Background Glow - subtle on hover */}
      <div className="absolute -inset-px pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-[var(--primary)]/5 blur-2xl" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-blue-500/5 blur-2xl" />
      </div>

      {/* Popular Badge - Premium */}
      {service.popular && (
        <div className="absolute top-4 right-4 z-20">
          <Badge className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 text-white border-0 shadow-[0_4px_16px_-4px_rgba(10,50,105,0.3)] gap-1.5 backdrop-blur-sm px-3 py-1.5 text-[10px] font-bold rounded-full">
            <Sparkles className="h-3 w-3" />
            Popular
          </Badge>
        </div>
      )}

      {/* New Badge */}
      {service.new && (
        <div className="absolute top-4 left-4 z-20">
          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-[0_4px_16px_-4px_rgba(16,185,129,0.3)] gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-full">
            <Zap className="h-3 w-3" />
            New
          </Badge>
        </div>
      )}

      {/* Image Section - Premium */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
        <img
          src={service.image}
          alt={service.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        
        {/* Shine sweep */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:translate-x-full transition-transform duration-[1100ms] ease-out" />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Bottom overlay with icon */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              variants={iconVariants}
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                "bg-white/95 dark:bg-[#0A1628]/95 backdrop-blur-md",
                "border border-white/20 dark:border-white/10",
                `shadow-[0_8px_24px_-8px_rgba(0,0,0,0.15)]`,
                "transition-all duration-300"
              )}
            >
              <Icon className="h-5 w-5 text-[var(--primary)] dark:text-white" strokeWidth={1.8} />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-white/70 uppercase tracking-wider">
                {service.authority}
              </span>
              <span className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-emerald-400" />
                Verified Service
              </span>
            </div>
          </div>
          
        </div>
      </div>

      {/* Content Section - Premium */}
      <div className="relative flex flex-col flex-1 p-5 sm:p-6">
        {/* Title */}
        <div className="mb-2">
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground dark:text-white leading-snug transition-colors duration-300 group-hover:text-[var(--primary)]">
            {service.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground dark:text-white/60 mb-4 line-clamp-2 flex-1 leading-relaxed">
          {service.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {service.processingTime && (
            <span className="flex items-center gap-1.5 text-[10px] font-medium text-[var(--primary)] bg-[var(--primary)]/10 rounded-full px-2.5 py-1 border border-[var(--primary)]/20">
              <Timer className="h-3 w-3" />
              {service.processingTime}
            </span>
          )}
          {service.docs && (
            <span className="flex items-center gap-1.5 text-[10px] font-medium rounded-full px-2.5 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/50 border border-slate-200/50 dark:border-white/5">
              <FileSearch className="h-3 w-3" />
              {service.docs} docs
            </span>
          )}
   
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 dark:border-white/6">
          {/* Animated border line */}
          <span className="pointer-events-none absolute -top-px left-0 h-px w-0 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/30 transition-all duration-500 ease-out group-hover:w-full" />
          
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.6rem] font-medium uppercase tracking-wider text-muted-foreground/60 dark:text-white/30">
              Starting from
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-muted-foreground/60 dark:text-white/40">AED</span>
              <p className="text-2xl font-extrabold tracking-tight tabular-nums transition-all duration-300 bg-gradient-to-br from-foreground to-foreground/70 dark:from-white dark:to-white/70 bg-clip-text text-transparent group-hover:from-[var(--primary)] group-hover:to-[var(--primary)]">
                {service.priceStandard}
              </p>
            </div>
          </div>

          <motion.div
            variants={arrowVariants}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white/50",
              "transition-all duration-300 ease-out",
              "group-hover:bg-[var(--primary)] group-hover:text-white",
              "group-hover:shadow-[0_0_0_6px_rgba(10,50,105,0.12)] dark:group-hover:shadow-[0_0_0_6px_rgba(255,255,255,0.05)]",
              "group-hover:scale-110"
            )}
          >
            <ArrowUpRight className="h-4.5 w-4.5" strokeWidth={2} />
          </motion.div>
        </div>

      </div>
    </motion.button>
  );
}