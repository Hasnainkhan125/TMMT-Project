"use client";

import { useEffect, useRef, useState } from 'react';
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
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Service } from '@/lib/services';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// Primary accent color - #0A3269 (Deep Navy)
const PRIMARY_COLOR = '#0A3269';

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

// Premium color gradients for cards - Using #0A3269 variants
const GRADIENT_MAP: Record<string, string> = {
  'calendar-clock': 'from-[#0A3269] to-[#1A4A8A]',
  'plane-off': 'from-[#0A3269] to-[#2A5A9A]',
  'briefcase-off': 'from-[#0A3269] to-[#3A6AAA]',
  'map-pin': 'from-[#0A3269] to-[#1A4A8A]',
  'file-search': 'from-[#0A3269] to-[#2A5A9A]',
  'file-warning': 'from-[#0A3269] to-[#4A7ABA]',
  'building-2': 'from-[#0A3269] to-[#1A4A8A]',
  'clock-alert': 'from-[#0A3269] to-[#3A6AAA]',
};

const SHADOW_MAP: Record<string, string> = {
  'calendar-clock': 'shadow-[#0A3269]/20',
  'plane-off': 'shadow-[#0A3269]/20',
  'briefcase-off': 'shadow-[#0A3269]/20',
  'map-pin': 'shadow-[#0A3269]/20',
  'file-search': 'shadow-[#0A3269]/20',
  'file-warning': 'shadow-[#0A3269]/20',
  'building-2': 'shadow-[#0A3269]/20',
  'clock-alert': 'shadow-[#0A3269]/20',
};

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
  index: number;
}

/** Counts up from 0 to `value` on mount. */
function AnimatedPrice({ value }: { value: number | string }) {
  const numeric = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!Number.isFinite(numeric)) return;
    let frame: number;
    const duration = 700;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(numeric * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [numeric]);

  if (!Number.isFinite(numeric)) return <>{value}</>;
  return <>{display.toLocaleString()}</>;
}

export function ServiceCard({ service, onSelect, index }: ServiceCardProps) {
  const Icon = iconMap[service.icon] || FileSearch;
  const gradient = GRADIENT_MAP[service.icon] || 'from-[#0A3269] to-[#1A4A8A]';
  const shadow = SHADOW_MAP[service.icon] || 'shadow-[#0A3269]/20';

  // Optional trust signals — only render if the data actually carries them,
  // so cards without this data fall back to today's layout untouched.
  const rating = (service as any).rating as number | undefined;
  const reviewCount = (service as any).reviewCount as number | undefined;

  // Subtle 3D tilt that follows the cursor — the one signature flourish,
  // kept quiet (max ~4deg) so it reads as polish, not a gimmick.
  const cardRef = useRef<HTMLButtonElement>(null);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springX = useSpring(tiltX, { stiffness: 200, damping: 20 });
  const springY = useSpring(tiltY, { stiffness: 200, damping: 20 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-4, 4]);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    tiltX.set((e.clientX - rect.left) / rect.width - 0.5);
    tiltY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

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
      ref={cardRef}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(service)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        '--primary': PRIMARY_COLOR,
        rotateX,
        rotateY,
        transformPerspective: 1000,
      } as React.CSSProperties}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[2rem]",
        "bg-white dark:bg-zinc-950",
        "border border-zinc-200/60 dark:border-zinc-800",
        "transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
        "shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.5)]",
        "hover:shadow-[0_20px_60px_-15px_rgba(10,50,105,0.2)] dark:hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
        "text-left w-full"
      )}
    >
      {/* Premium Glass Shimmer - subtle */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/10 dark:from-white/5 dark:to-white/5" />
      </div>

      {/* Background Glow - subtle on hover */}
      <div className="absolute -inset-px pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-[var(--primary)]/10 dark:bg-[var(--primary)]/20 blur-2xl" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-[#0A3269]/10 dark:bg-[#0A3269]/20 blur-2xl" />
      </div>

      {/* Popular Badge - Premium */}
      {service.popular && (
        <div className="absolute top-4 right-4 z-20">
          <Badge className="bg-[var(--primary)] text-white border-0 shadow-[0_4px_16px_-4px_rgba(10,50,105,0.3)] gap-1.5 backdrop-blur-sm px-3 py-1.5 text-[10px] font-bold rounded-full">
            <Sparkles className="h-3 w-3" />
            Popular
          </Badge>
        </div>
      )}

      {/* New Badge */}
      {service.new && (
        <div className="absolute top-4 left-4 z-20">
          <Badge className="bg-emerald-500 text-white border-0 shadow-[0_4px_16px_-4px_rgba(16,185,129,0.3)] gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-full">
            <Zap className="h-3 w-3" />
            New
          </Badge>
        </div>
      )}

      {/* Image Section - Premium */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <img
          src={service.image}
          alt={service.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        
        {/* Shine sweep */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-[1100ms] ease-out" />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Bottom overlay with icon */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              variants={iconVariants}
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                "bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md",
                "border border-white/20 dark:border-zinc-800",
                "shadow-[0_8px_24px_-8px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)]",
                "transition-all duration-300"
              )}
            >
              <Icon className="h-5 w-5 text-[var(--primary)] dark:text-zinc-200" strokeWidth={1.8} />
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

          {/* Rating chip — only shown when the service data actually has it */}
          {rating !== undefined && (
            <div className="flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-md px-2.5 py-1 border border-white/10">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-[11px] font-semibold text-white">{rating.toFixed(1)}</span>
              {reviewCount !== undefined && (
                <span className="text-[10px] text-white/60">({reviewCount.toLocaleString()})</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Section - Premium */}
      <div className="relative flex flex-col flex-1 p-5 sm:p-6 bg-white dark:bg-zinc-950">
        {/* Title */}
        <div className="mb-2">
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-snug transition-colors duration-300 group-hover:text-[var(--primary)]">
            {service.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2 flex-1 leading-relaxed">
          {service.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {service.processingTime && (
            <span className="flex items-center gap-1.5 text-[10px] font-medium text-[var(--primary)] bg-[var(--primary)]/10 dark:bg-[var(--primary)]/20 rounded-full px-2.5 py-1 border border-[var(--primary)]/20 dark:border-[var(--primary)]/30">
              <Timer className="h-3 w-3" />
              {service.processingTime}
            </span>
          )}
          {service.docs && (
            <span className="flex items-center gap-1.5 text-[10px] font-medium rounded-full px-2.5 py-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800">
              <FileSearch className="h-3 w-3" />
              {service.docs} docs
            </span>
          )}
          {service.popular && (
            <span className="flex items-center gap-1.5 text-[10px] font-medium rounded-full px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <TrendingUp className="h-3 w-3" />
              High demand
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-200/60 dark:border-zinc-800">
          {/* Animated border line */}
          <span className="pointer-events-none absolute -top-px left-0 h-px w-0 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/30 transition-all duration-500 ease-out group-hover:w-full" />
          
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.6rem] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Starting from
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-zinc-400 dark:text-zinc-500">AED</span>
              <p className="text-2xl font-extrabold tracking-tight tabular-nums transition-all duration-300 bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent group-hover:from-[var(--primary)] group-hover:to-[var(--primary)]">
                <AnimatedPrice value={service.priceStandard} />
              </p>
            </div>
          </div>

          <motion.div
            variants={arrowVariants}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300",
              "transition-all duration-300 ease-out",
              "group-hover:bg-[var(--primary)] group-hover:text-white",
              "group-hover:shadow-[0_0_0_6px_rgba(10,50,105,0.12)] dark:group-hover:shadow-[0_0_0_6px_rgba(10,50,105,0.25)]",
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