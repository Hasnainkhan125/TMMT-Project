import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  position?: 'left' | 'right' | 'bottom';
  showOverlay?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

const positionClasses = {
  left: 'left-0 top-0 h-full',
  right: 'right-0 top-0 h-full',
  bottom: 'left-0 right-0 bottom-0 h-3/4',
};

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  position = 'right',
  showOverlay = true,
  className,
}) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {showOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={handleOverlayClick}
            />
          )}
          
          <motion.div
            initial={{
              x: position === 'left' ? '-100%' : position === 'right' ? '100%' : 0,
              y: position === 'bottom' ? '100%' : 0,
            }}
            animate={{
              x: 0,
              y: 0,
            }}
            exit={{
              x: position === 'left' ? '-100%' : position === 'right' ? '100%' : 0,
              y: position === 'bottom' ? '100%' : 0,
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed z-50 bg-background shadow-2xl',
              positionClasses[position],
              sizeClasses[size],
              position === 'bottom' ? 'rounded-t-2xl' : '',
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-background sticky top-0 z-10">
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-surface transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Collapsible section component for drawer content
interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = false,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className={cn('border-b border-gray-100', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-light transition-colors"
      >
        <span className="font-medium text-foreground">{title}</span>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-gray-500 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Action button component for drawer
interface DrawerActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  className?: string;
}

export const DrawerActionButton: React.FC<DrawerActionButtonProps> = ({
  onClick,
  children,
  variant = 'primary',
  disabled = false,
  className,
}) => {
  const baseClasses = 'w-full px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-surface text-foreground hover:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(baseClasses, variantClasses[variant], className)}
    >
      {children}
    </button>
  );
};
