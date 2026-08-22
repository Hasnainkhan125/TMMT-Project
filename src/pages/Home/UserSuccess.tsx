// UserSuccess.tsx – Advanced Animated Dialog, Fully Responsive, Dark/Light Mode
// ✅ Persists data to localStorage – survives refresh / direct navigation
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import {
  Mail,
  Phone,
  Globe,
  MapPin,
  Briefcase,
  Clock,
  MessageCircle,
  Monitor,
  Smartphone,
  Tablet,
  Chrome,
  Home,
  X,
  ArrowRight,
  ChevronDown,
  User,
} from 'lucide-react';

const NAVY = '#0A3269';
const STORAGE_KEY = 'submissionData';

interface SuccessData {
  name: string;
  email: string;
  phone: string;
  nationality: string;
  emirate: string;
  service: string;
  urgency: string;
  contact: string;
  message: string;
  timestamp: string;
  device: string;
  os: string;
  browser: string;
}

const getDeviceIcon = (device: string) => {
  const d = (device || '').toLowerCase();
  if (d.includes('mobile')) return Smartphone;
  if (d.includes('tablet')) return Tablet;
  return Monitor;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.18 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const UserSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState<SuccessData | null>(null);
  const [messageExpanded, setMessageExpanded] = useState(false);
  const [fromStorage, setFromStorage] = useState(false);

  // Auto‑dismiss after 5 seconds (if data exists)
  useEffect(() => {
    if (!data) return;
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);
    return () => clearTimeout(timer);
  }, [data, navigate]);

  // Load data: first from location.state, then from localStorage
  useEffect(() => {
    const stateData = location.state as SuccessData;
    if (stateData && Object.keys(stateData).length > 0) {
      // Fresh data from navigation – save and use it
      setData(stateData);
      setFromStorage(false);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateData));
    } else {
      // Try localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as SuccessData;
          setData(parsed);
          setFromStorage(true);
        } catch {
          setData(null);
        }
      } else {
        setData(null);
      }
    }
  }, [location.state]);

  // If no data at all, show fallback
  if (!data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-white dark:bg-[#0A3269] rounded-2xl border border-gray-200 dark:border-[#1A4A8A] max-w-sm w-full p-6 text-center"
        >
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">No submission found</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Please submit the form first.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 text-white rounded-lg transition-colors duration-200"
            style={{ backgroundColor: NAVY }}
          >
            Go Home
          </button>
        </motion.div>
      </div>
    );
  }

  const DeviceIcon = getDeviceIcon(data.device);
  const refCode = `${data.email.split('@')[0].slice(0, 6).toUpperCase()}-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 dark:bg-black/60 backdrop-blur-sm p-3 sm:p-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] sm:max-h-[92vh] bg-white dark:bg-[#0A3269]/10 rounded-[1.5rem] overflow-hidden flex flex-col"
      >
        {/* Ambient glow */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-16 h-56 w-56 rounded-full blur-[80px]"
          style={{ background: `${NAVY}14` }}
          animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.1, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -right-10 h-44 w-44 rounded-full blur-[70px]"
          style={{ background: '#10B98118' }}
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.12, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        />

        {/* Close button */}
        <motion.button
          onClick={() => navigate('/')}
          whileHover={{ rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#1A4A8A]/40 transition-colors duration-200 z-20"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-400 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white" strokeWidth={2} />
        </motion.button>

        {/* Scrollable content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative z-10 flex-1 overflow-y-auto p-5 sm:p-8"
        >
          {/* Header */}
          <div className="text-center">
            <motion.div
              variants={itemVariants}
              className="relative mx-auto w-16 h-16 sm:w-[4.75rem] sm:h-[4.75rem] flex items-center justify-center"
            >
              <motion.span
                className="absolute inset-0 rounded-full border-2"
                style={{ borderColor: '#10B98155' }}
                animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative w-14 h-14 sm:w-[4.25rem] sm:h-[4.25rem] rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700/40 flex items-center justify-center">
                <motion.svg
                  viewBox="0 0 24 24"
                  className="w-7 h-7 sm:w-9 sm:h-9"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    d="M20 6 9 17l-5-5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.55, delay: 0.45, ease: 'easeOut' }}
                  />
                </motion.svg>
              </div>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="mt-3 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
            >
              Congratulations, {data.name}!
            </motion.h2>
            <motion.p variants={itemVariants} className="mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-300">
              Your <span className="font-semibold text-gray-700 dark:text-gray-200">{data.service}</span> request has been submitted successfully.
            </motion.p>
            <motion.p
              variants={itemVariants}
              className="mt-2 inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono font-semibold tracking-wide text-gray-400 dark:text-gray-400 bg-gray-50 dark:bg-[#1A4A8A]/30 border border-gray-200/70 dark:border-[#1A4A8A]/40 rounded-full px-3 py-1"
            >
              REF {refCode}
            </motion.p>
            {fromStorage && (
              <motion.p
                variants={itemVariants}
                className="mt-1 text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1"
              >
                📦 Restored from storage
              </motion.p>
            )}
          </div>

          {/* Status timeline */}
          <motion.div variants={itemVariants} className="mt-5 sm:mt-6 flex items-center justify-center">
            <div className="flex items-center w-full max-w-xs sm:max-w-sm">
              {['Submitted', 'Under Review', 'Confirmation'].map((step, idx) => (
                <div key={step} className="flex items-center flex-1 last:flex-initial">
                  <div className="flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.65 + idx * 0.12, ease: 'backOut' }}
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                      style={{ backgroundColor: idx === 0 ? '#10B981' : '#4A7A9A' }}
                    />
                    <span
                      className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap"
                      style={{ color: idx === 0 ? '#10B981' : '#1A4A8A' }}
                    >
                      {step}
                    </span>
                  </div>
                  {idx < 2 && (
                    <div className="h-[2px] flex-1 mx-1 sm:mx-2 mb-4 sm:mb-4.5 rounded-full bg-gray-200 dark:bg-[#1A4A8A]/40 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: '#10B98166' }}
                        initial={{ width: '0%' }}
                        animate={{ width: idx === 0 ? '100%' : '0%' }}
                        transition={{ duration: 0.6, delay: 0.95 }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Summary Grid */}
          <div className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <motion.div
              variants={itemVariants}
              className="rounded-xl border border-gray-200/60 dark:border-[#1A4A8A]/20 bg-gray-50/70 dark:bg-[#071F42]/20 p-3.5 sm:p-4 space-y-1.5 sm:space-y-2"
            >
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase text-gray-400 dark:text-gray-400 tracking-wider">
                Your Details
              </p>
              <DetailItem icon={Mail} label="Email" value={data.email} />
              <DetailItem icon={Phone} label="Phone" value={data.phone} />
              <DetailItem icon={Globe} label="Nationality" value={data.nationality} />
              <DetailItem icon={MapPin} label="Emirate" value={data.emirate} />
              <DetailItem icon={Briefcase} label="Service" value={data.service} highlight />
              <DetailItem icon={Clock} label="Urgency" value={data.urgency} />
              <DetailItem icon={MessageCircle} label="Contact" value={data.contact} />
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="rounded-xl border p-3.5 sm:p-4 space-y-1.5 sm:space-y-2"
              style={{ backgroundColor: `${NAVY}08`, borderColor: `${NAVY}1a` }}
            >
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider" style={{ color: `${NAVY}b3` }}>
                Technical Info
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/80 dark:bg-[#071F42]/20 flex items-center justify-center border"
                  style={{ color: NAVY, borderColor: `${NAVY}1a` }}
                >
                  <DeviceIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-400">Device</p>
                  <p className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200">{data.device}</p>
                </div>
              </div>
              <DetailItem icon={Monitor} label="OS" value={data.os} />
              <DetailItem icon={Chrome} label="Browser" value={data.browser} />
              <div className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-400 mt-1 pt-1.5 border-t border-gray-200/50 dark:border-[#1A4A8A]/40">
                Submitted at {data.timestamp}
              </div>
            </motion.div>
          </div>

          {/* ─── User Message (collapsible with arrow + user icon) ───── */}
          {data.message && data.message !== 'No message provided' && (
            <motion.div
              variants={itemVariants}
              className="mt-3 sm:mt-4 rounded-xl border border-gray-200/60 dark:border-[#1A4A8A]/50 bg-gray-50/70 dark:bg-[#071F42]/50 p-3.5 sm:p-4"
            >
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setMessageExpanded(!messageExpanded)}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-400" strokeWidth={2} />
                  <p className="text-[10px] sm:text-[11px] font-semibold uppercase text-gray-400 dark:text-gray-400 tracking-wider">
                    Your Message
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: messageExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-400" strokeWidth={2} />
                </motion.div>
              </div>
              {messageExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="mt-1.5 flex items-start gap-2"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-400 shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 italic leading-relaxed">
                    {data.message}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// ─── Helper DetailItem ──────────────────────────────────────────────
const DetailItem = ({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: any;
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-400 shrink-0" strokeWidth={1.75} />
    <span className="text-gray-500 dark:text-gray-400 text-[10px] sm:text-[11px] font-medium min-w-[60px] sm:min-w-[70px]">
      {label}
    </span>
    <span
      className={`text-gray-800 dark:text-gray-200 font-medium truncate text-sm sm:text-base ${highlight ? 'dark:text-[#C9A227]' : ''}`}
      style={highlight ? { color: NAVY } : undefined}
    >
      {value}
    </span>
  </div>
);

export default UserSuccess;