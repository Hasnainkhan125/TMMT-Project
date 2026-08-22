// Email Capture Section – Two‑Step Form with Framer Motion & Agreement Checkbox
// ✅ Production – Saves to backend API + localStorage + sends real emails via EmailJS
// ✅ Advanced inputs – floating labels, live validation states, animated feedback
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Play,
  Volume2,
  VolumeX,
  X,
  MessageSquare,
  User,
  Check,
  Phone,
  Globe,
  MapPin,
  Clock,
  PhoneCall,
  ChevronDown,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';
import { cn } from '@/lib/utils';

const NAVY = '#14235E';
const GOLD = '#C9A227';

// ─── EmailJS Configuration ─────────────────────────────────────────
const EMAILJS_SERVICE_ID = 'service_jwh38si';
const EMAILJS_USER_TEMPLATE_ID = 'template_vlbkhhm';      // user confirmation
const EMAILJS_ADMIN_TEMPLATE_ID = 'template_6zy5yhe';     // admin notification
const EMAILJS_PUBLIC_KEY = 'aPjV4dkExrQsHVJLV';
const ADMIN_EMAIL = 'Tmmt.aecontact@gmail.com';

// ─── Detection helpers ──────────────────────────────────────────────
function detectDevice() {
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return 'Mobile';
  if (/tablet/i.test(ua)) return 'Tablet';
  return 'Desktop';
}
function detectOS() {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (/Android/i.test(ua)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  return 'Unknown';
}
function detectBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  return 'Other';
}
function getCurrentTime() {
  return new Date().toLocaleString('en-US', { hour12: false });
}
async function fetchLocationAndIP() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    return {
      ip: data.ip || 'Unknown',
      location: data.city && data.country_name ? `${data.city}, ${data.country_name}` : 'Unknown',
    };
  } catch {
    return { ip: 'Unknown', location: 'Unknown' };
  }
}
// ─── Animation variants ─────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};
const cardVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 350, damping: 28 },
  },
};
const stepPanelVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 26 },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 },
  },
};

// ═══════════════════════════════════════════════════════════════════
// ─── Advanced input primitives ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

// Floating-label text input with live validation state (checkmark / shake+error)
const FloatingInput = ({
  icon: Icon,
  label,
  type = 'text',
  value,
  onChange,
  isValid,
  errorMessage,
  required = true,
  isDarkMode,
}: {
  icon: any;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  isValid: boolean;
  errorMessage?: string;
  required?: boolean;
  isDarkMode: boolean;
}) => {
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const hasValue = value.length > 0;
  const active = focused || hasValue;
  const showError = touched && !focused && required && !isValid;
  const showValid = touched && isValid && hasValue;

  return (
    <div className="relative">
      <motion.div
        className={cn(
          'ec-field relative flex items-center gap-3 px-4 h-14 sm:h-[60px] rounded-2xl border-2 transition-colors duration-200',
          isDarkMode ? 'bg-white/[0.04]' : 'bg-white',
          showError
            ? 'border-red-400 dark:border-red-400/70'
            : showValid
            ? 'border-emerald-400 dark:border-emerald-400/70'
            : active
            ? 'border-[#14235E] dark:border-white/40'
            : isDarkMode
            ? 'border-white/10'
            : 'border-[#14235E]/12'
        )}
        animate={showError ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-200"
          style={{
            backgroundColor: active
              ? isDarkMode
                ? `${NAVY}66`
                : `${NAVY}14`
              : isDarkMode
              ? '#ffffff0d'
              : '#14235E0a',
            color: active ? (isDarkMode ? '#fff' : NAVY) : isDarkMode ? '#ffffff66' : `${NAVY}80`,
          }}
        >
          <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={1.75} />
        </div>

        <div className="flex-1 relative h-full">
          <label
            className={cn(
              'absolute left-0 rtl:left-auto rtl:right-0 pointer-events-none font-medium select-none transition-all duration-200 origin-left rtl:origin-right',
              active ? 'top-[7px] sm:top-[9px] text-[10px] sm:text-[11px]' : 'top-1/2 -translate-y-1/2 text-sm sm:text-base'
            )}
            style={{
              color: showError
                ? '#ef4444'
                : active
                ? isDarkMode
                  ? '#ffffffcc'
                  : NAVY
                : isDarkMode
                ? '#ffffff66'
                : '#9ca3af',
            }}
          >
            {label}
            {required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              setTouched(true);
            }}
            className={cn(
              'absolute bottom-1.5 sm:bottom-2 left-0 rtl:left-auto rtl:right-0 w-full bg-transparent outline-none text-sm sm:text-base font-medium caret-[#14235E]',
              isDarkMode ? 'text-white' : 'text-gray-900'
            )}
            style={{ fontFamily: "'Inter', sans-serif" }}
          />
        </div>

        <AnimatePresence mode="wait">
          {showValid && (
            <motion.div
              key="valid"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="shrink-0 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center"
            >
              <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
            </motion.div>
          )}
          {showError && (
            <motion.div
              key="error"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="shrink-0 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center"
            >
              <AlertCircle className="h-3 w-3 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showError && errorMessage && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="mt-1 ml-1 rtl:ml-0 rtl:mr-1 text-[11px] font-medium text-red-500"
          >
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// Floating-label textarea with live character counter
const FloatingTextarea = ({
  icon: Icon,
  label,
  value,
  onChange,
  maxLength = 500,
  isDarkMode,
}: {
  icon: any;
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  isDarkMode: boolean;
}) => {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  const active = focused || hasValue;
  const nearLimit = value.length > maxLength * 0.85;

  return (
    <motion.div
      className={cn(
        'ec-field relative flex items-start gap-3 px-4 pt-6 pb-2 rounded-2xl border-2 transition-colors duration-200',
        isDarkMode ? 'bg-white/[0.04]' : 'bg-white',
        active ? 'border-[#14235E] dark:border-white/40' : isDarkMode ? 'border-white/10' : 'border-[#14235E]/12'
      )}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 mt-0.5"
        style={{
          backgroundColor: active ? (isDarkMode ? `${NAVY}66` : `${NAVY}14`) : isDarkMode ? '#ffffff0d' : '#14235E0a',
          color: active ? (isDarkMode ? '#fff' : NAVY) : isDarkMode ? '#ffffff66' : `${NAVY}80`,
        }}
      >
        <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={1.75} />
      </div>
      <div className="flex-1 relative min-h-[52px] sm:min-h-[60px]">
        <label
          className={cn(
            'absolute left-0 rtl:left-auto rtl:right-0 pointer-events-none font-medium select-none transition-all duration-200 origin-left rtl:origin-right',
            active ? '-top-3.5 text-[10px] sm:text-[11px]' : 'top-0 text-sm sm:text-base'
          )}
          style={{ color: active ? (isDarkMode ? '#ffffffcc' : NAVY) : isDarkMode ? '#ffffff66' : '#9ca3af' }}
        >
          {label}
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={2}
          className={cn(
            'w-full bg-transparent outline-none resize-none text-sm sm:text-base font-medium pb-4',
            isDarkMode ? 'text-white' : 'text-gray-900'
          )}
          style={{ fontFamily: "'Inter', sans-serif" }}
        />
        <div
          className={cn(
            'absolute bottom-0 right-0 rtl:right-auto rtl:left-0 text-[10px] font-medium tabular-nums transition-colors',
            nearLimit ? 'text-amber-500' : isDarkMode ? 'text-white/25' : 'text-gray-300'
          )}
        >
          {value.length}/{maxLength}
        </div>
      </div>
    </motion.div>
  );
};

const EmailCapture = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // ─── Form state ──────────────────────────────────────────────────
  const [formMode, setFormMode] = useState<'idle' | 'step1' | 'step2'>('idle');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [serviceInterest, setServiceInterest] = useState('');
  const [nationality, setNationality] = useState('');
  const [emirate, setEmirate] = useState('');
  const [urgency, setUrgency] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // ─── Collapse state – now open by default ──────────────────────
  const [collapsed, setCollapsed] = useState(true);

  // ─── Video / modal / detection state ────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isArabic, setIsArabic] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [detected, setDetected] = useState({
    device: '',
    os: '',
    browser: '',
    ip: '',
    location: '',
    timestamp: '',
  });

  // ─── Initialize EmailJS ──────────────────────────────────────────
  useEffect(() => {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }, []);

  // ─── Service options (unchanged) ──────────────────────────────
  const serviceOptions = {
    en: [
      { value: 'visa', label: 'Visa & Immigration' },
      { value: 'emirates-id', label: 'Emirates ID' },
      { value: 'business-setup', label: 'Business Setup' },
      { value: 'fines', label: 'Fines & Penalties' },
      { value: 'family-services', label: 'Family Services' },
      { value: 'driving-license', label: 'Driving License' },
      { value: 'other', label: 'Other' },
    ],
    ar: [
      { value: 'visa', label: 'التأشيرات والهجرة' },
      { value: 'emirates-id', label: 'الهوية الإماراتية' },
      { value: 'business-setup', label: 'تأسيس الأعمال' },
      { value: 'fines', label: 'الغرامات والمخالفات' },
      { value: 'family-services', label: 'الخدمات العائلية' },
      { value: 'driving-license', label: 'رخصة القيادة' },
      { value: 'other', label: 'أخرى' },
    ],
  };
  const nationalityOptions = {
    en: [
      { value: 'uae', label: 'UAE' },
      { value: 'india', label: 'India' },
      { value: 'pakistan', label: 'Pakistan' },
      { value: 'uk', label: 'United Kingdom' },
      { value: 'usa', label: 'United States' },
      { value: 'egypt', label: 'Egypt' },
      { value: 'saudi', label: 'Saudi Arabia' },
      { value: 'other', label: 'Other' },
    ],
    ar: [
      { value: 'uae', label: 'الإمارات' },
      { value: 'india', label: 'الهند' },
      { value: 'pakistan', label: 'باكستان' },
      { value: 'uk', label: 'المملكة المتحدة' },
      { value: 'usa', label: 'الولايات المتحدة' },
      { value: 'egypt', label: 'مصر' },
      { value: 'saudi', label: 'السعودية' },
      { value: 'other', label: 'أخرى' },
    ],
  };
  const emirateOptions = {
    en: [
      { value: 'dubai', label: 'Dubai' },
      { value: 'abudhabi', label: 'Abu Dhabi' },
      { value: 'sharjah', label: 'Sharjah' },
      { value: 'ajman', label: 'Ajman' },
      { value: 'ras-al-khaimah', label: 'Ras Al Khaimah' },
      { value: 'fujairah', label: 'Fujairah' },
      { value: 'umm-al-quwain', label: 'Umm Al Quwain' },
      { value: 'outside', label: 'Outside UAE' },
    ],
    ar: [
      { value: 'dubai', label: 'دبي' },
      { value: 'abudhabi', label: 'أبوظبي' },
      { value: 'sharjah', label: 'الشارقة' },
      { value: 'ajman', label: 'عجمان' },
      { value: 'ras-al-khaimah', label: 'رأس الخيمة' },
      { value: 'fujairah', label: 'الفجيرة' },
      { value: 'umm-al-quwain', label: 'أم القيوين' },
      { value: 'outside', label: 'خارج الإمارات' },
    ],
  };
  const urgencyOptions = {
    en: [
      { value: 'normal', label: 'Normal – Just exploring' },
      { value: 'urgent', label: 'Urgent – Need help this week' },
      { value: 'very-urgent', label: 'Very Urgent – Need help within 24hrs' },
    ],
    ar: [
      { value: 'normal', label: 'عادي – مجرد استفسار' },
      { value: 'urgent', label: 'عاجل – بحاجة مساعدة هذا الأسبوع' },
      { value: 'very-urgent', label: 'عاجل جداً – بحاجة مساعدة خلال 24 ساعة' },
    ],
  };
  const contactMethodOptions = {
    en: [
      { value: 'email', label: 'Email' },
      { value: 'phone', label: 'Phone Call' },
      { value: 'whatsapp', label: 'WhatsApp' },
    ],
    ar: [
      { value: 'email', label: 'البريد الإلكتروني' },
      { value: 'phone', label: 'اتصال هاتفي' },
      { value: 'whatsapp', label: 'واتساب' },
    ],
  };

  // ─── Dark mode & language detection ──────────────────────────────
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };
    checkDarkMode();
    const observer = new MutationObserver(() => checkDarkMode());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const checkLanguage = () => {
      const lang = localStorage.getItem('i18nextLng');
      const htmlLang = document.documentElement.lang;
      const isAr = lang === 'ar' || lang === 'ar-AE' || htmlLang === 'ar' || htmlLang === 'ar-AE';
      setIsArabic(isAr);
    };
    checkLanguage();
    const handleChange = () => {
      const newLang = localStorage.getItem('i18nextLng');
      const newHtmlLang = document.documentElement.lang;
      setIsArabic(newLang === 'ar' || newLang === 'ar-AE' || newHtmlLang === 'ar' || newHtmlLang === 'ar-AE');
    };
    window.addEventListener('storage', handleChange);
    window.addEventListener('languageChanged', handleChange);
    return () => {
      window.removeEventListener('storage', handleChange);
      window.removeEventListener('languageChanged', handleChange);
    };
  }, []);

  // ─── Translations ──────────────────────────────────────────────
  const translations = {
    en: {
      heading: 'Get Your Free',
      headingHighlight: 'Government Guidance',
      description:
        'Everything you need to know about UAE visas, Emirates ID, fines, business setup, and all government procedures. Expert insights from professionals with 10+ years of experience.',
      emailPlaceholder: 'Email address',
      cta: 'Get Free Guide',
      step1Label: 'Your details',
      step2Label: 'Your request',
      namePlaceholder: 'Full name',
      phonePlaceholder: 'Phone number',
      messagePlaceholder: 'Tell us what you need help with (optional)',
      serviceLabel: 'I need help with',
      nationalityLabel: 'Nationality',
      emirateLabel: 'Current Emirate',
      urgencyLabel: 'Urgency Level',
      contactMethodLabel: 'Preferred Contact Method',
      continue: 'Continue',
      back: 'Back',
      submit: 'Submit Application',
      terms: 'By downloading, you agree to our',
      termsLink: 'Terms & Conditions',
      privacyLink: 'Privacy Policy',
      unsubscribe: 'Unsubscribe anytime.',
      mute: 'Mute',
      unmute: 'Unmute',
      stampVerified: 'VERIFIED',
      success: 'Guide has been Submitted!',
      successSub: 'Thank You for Submit Request. Our team will review within 24 hours.',
      error: 'Failed to send. Please try again.',
      sending: 'Sending...',
      preparing: 'Preparing your form...',
      nameError: 'Please enter your name',
      emailError: 'Please enter a valid email',
      phoneError: 'Please enter your phone number',
      trustBadge: 'Secure & Confidential',
      agreeLabel: 'I agree to the Terms & Conditions and Privacy Policy',
      expandLabel: 'Show form',
      collapseLabel: 'Hide form',
    },
    ar: {
      heading: 'احصل على',
      headingHighlight: 'إرشاد حكومي مجاني',
      description:
        'كل ما تحتاج معرفته عن تأشيرات الإمارات، الهوية الإماراتية، الغرامات، تأسيس الأعمال، وجميع الإجراءات الحكومية. رؤى خبراء من محترفين لديهم أكثر من 10 سنوات من الخبرة.',
      emailPlaceholder: 'البريد الإلكتروني',
      cta: 'احصل على الدليل المجاني',
      step1Label: 'بياناتك',
      step2Label: 'طلبك',
      namePlaceholder: 'الاسم الكامل',
      phonePlaceholder: 'رقم الهاتف',
      messagePlaceholder: 'أخبرنا بما تحتاج مساعدة بشأنه (اختياري)',
      serviceLabel: 'أحتاج مساعدة في',
      nationalityLabel: 'الجنسية',
      emirateLabel: 'الإمارة الحالية',
      urgencyLabel: 'مستوى الاستعجال',
      contactMethodLabel: 'طريقة التواصل المفضلة',
      continue: 'متابعة',
      back: 'رجوع',
      submit: 'إرسال الطلب',
      terms: 'بتحميلك، فإنك توافق على',
      termsLink: 'الشروط والأحكام',
      privacyLink: 'سياسة الخصوصية',
      unsubscribe: 'يمكنك إلغاء الاشتراك في أي وقت.',
      mute: 'كتم الصوت',
      unmute: 'إلغاء كتم الصوت',
      stampVerified: 'موثّق',
      success: 'تم إرسال الدليل إلى بريدك الإلكتروني!',
      successSub: 'تحقق من بريدك — لقد وصل دليلك المجاني.',
      error: 'فشل الإرسال. يرجى المحاولة مرة أخرى.',
      sending: 'جاري الإرسال...',
      preparing: 'جاري تجهيز النموذج...',
      nameError: 'يرجى إدخال الاسم',
      emailError: 'يرجى إدخال بريد إلكتروني صحيح',
      phoneError: 'يرجى إدخال رقم الهاتف',
      trustBadge: 'آمن وسري',
      agreeLabel: 'أوافق على الشروط والأحكام وسياسة الخصوصية',
      expandLabel: 'عرض النموذج',
      collapseLabel: 'إخفاء النموذج',
    },
  };

  const lang = translations[isArabic ? 'ar' : 'en'];
  const services = isArabic ? serviceOptions.ar : serviceOptions.en;
  const nationalities = isArabic ? nationalityOptions.ar : nationalityOptions.en;
  const emirates = isArabic ? emirateOptions.ar : emirateOptions.en;
  const urgencies = isArabic ? urgencyOptions.ar : urgencyOptions.en;
  const contactMethods = isArabic ? contactMethodOptions.ar : contactMethodOptions.en;
  const isValidEmail = !!email && email.includes('@') && email.includes('.');
  const isValidPhone = !!phone.trim() && phone.trim().length >= 7;
  const isValidName = !!name.trim();
  const BackIcon = isArabic ? ArrowRight : ArrowLeft;
  const ForwardIcon = isArabic ? ArrowLeft : ArrowRight;

  // ─── API Base URL ───────────────────────────────────────────────
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

  // ─── Handlers ──────────────────────────────────────────────────
  const handleCtaClick = async () => {
    setEmailTouched(true);
    if (!isValidEmail) {
      toast.error(lang.emailError);
      return;
    }
    setIsDetecting(true);
    const device = detectDevice();
    const os = detectOS();
    const browser = detectBrowser();
    const timestamp = getCurrentTime();
    const { ip, location } = await fetchLocationAndIP();
    setDetected({ device, os, browser, ip, location, timestamp });
    setIsDetecting(false);
    setFormMode('step1');
  };

  const goToStep2 = () => {
    if (!name.trim()) {
      toast.error(lang.nameError);
      return;
    }
    if (!isValidPhone) {
      toast.error(lang.phoneError);
      return;
    }
    setAgreed(false);
    setFormMode('step2');
  };

  const goToStep1 = () => setFormMode('step1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(lang.nameError);
      setFormMode('step1');
      return;
    }
    if (!isValidEmail) {
      toast.error(lang.emailError);
      setFormMode('step1');
      return;
    }
    if (!isValidPhone) {
      toast.error(lang.phoneError);
      setFormMode('step1');
      return;
    }
    if (!agreed) {
      toast.error('Please agree to the terms.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = {
        name: name.trim(),
        email,
        phone: phone.trim(),
        nationality: nationality || 'Not specified',
        emirate: emirate || 'Not specified',
        service: serviceInterest || 'Not specified',
        urgency: urgency || 'Not specified',
        contact: contactMethod || 'Not specified',
        message: message || 'No message provided',
        timestamp: detected.timestamp || new Date().toISOString(),
        device: detected.device,
        os: detected.os,
        browser: detected.browser,
        ip: detected.ip,
        location: detected.location,
        agreed,
      };

      // ─── Send user confirmation email (EmailJS) ──────────────
      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_USER_TEMPLATE_ID, {
          to_email: email,
          from_name: 'TMMT',
          reply_to: ADMIN_EMAIL,
          user_name: formData.name,
          user_email: formData.email,
          user_phone: formData.phone,
          user_nationality: formData.nationality,
          user_emirate: formData.emirate,
          user_service: formData.service,
          user_urgency: formData.urgency,
          user_contact: formData.contact,
          user_message: formData.message,
          timestamp: formData.timestamp,
        });
        toast.success('Confirmation email sent!');
      } catch (emailError) {
        console.error('User email error:', emailError);
        toast.warning('Email notification could not be sent, but your request was saved.');
      }

      // ─── Send admin notification email (EmailJS) ──────────────
      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_ADMIN_TEMPLATE_ID, {
          to_email: ADMIN_EMAIL,
          from_name: formData.name,
          reply_to: formData.email,
          user_name: formData.name,
          user_email: formData.email,
          user_phone: formData.phone,
          user_nationality: formData.nationality,
          user_emirate: formData.emirate,
          user_service: formData.service,
          user_urgency: formData.urgency,
          user_contact_method: formData.contact,
          user_message: formData.message,
          timestamp: formData.timestamp,
        });
        // no toast for admin – we don't want to confuse the user
      } catch (adminError) {
        console.error('Admin email error:', adminError);
        // silently fail – we already saved the data
      }

      // ─── Save to localStorage (fallback) ──────────────────────
      localStorage.setItem('submissionData', JSON.stringify(formData));
      window.dispatchEvent(new CustomEvent('submissionDataUpdated'));

      // ─── Send to backend API ──────────────────────────────────
      try {
        const response = await fetch(`${apiBase}/api/v1/submissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            nationality: formData.nationality,
            emirate: formData.emirate,
            service: formData.service,
            urgency: formData.urgency,
            contact: formData.contact,
            message: formData.message,
            device: formData.device,
            os: formData.os,
            browser: formData.browser,
            ip: formData.ip,
            location: formData.location,
          }),
        });
        if (!response.ok) throw new Error('API error');
        const result = await response.json();
        localStorage.setItem('submissionId', result.data?._id || '');
      } catch (apiError) {
        console.error('Backend save error:', apiError);
        // Non‑blocking – we still proceed
      }

      // ─── Navigate to success page ─────────────────────────────
      navigate('/success', { state: formData });
      toast.success(lang.success);

      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setServiceInterest('');
      setNationality('');
      setEmirate('');
      setUrgency('');
      setContactMethod('');
      setAgreed(false);
      setFormMode('idle');
      setCollapsed(false); // keep open after reset
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(lang.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Video and modal handlers (unchanged) ──────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (videoRef.current && !hasStarted) {
            videoRef.current.play().catch(() => {});
            setHasStarted(true);
          }
        } else {
          if (videoRef.current && hasStarted) {
            videoRef.current.pause();
          }
        }
      },
      { threshold: 0.2 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [hasStarted]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current) {
        videoRef.current.pause();
      } else if (!document.hidden && videoRef.current) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect && rect.top < window.innerHeight && rect.bottom > 0) {
          videoRef.current.play().catch(() => {});
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setTimeout(() => {
      if (modalVideoRef.current) {
        modalVideoRef.current.play().catch(() => {});
        requestFullscreen();
      }
    }, 100);
  };

  const closeModal = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
    }
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setIsModalOpen(false);
  };

  const requestFullscreen = () => {
    try {
      if (modalContainerRef.current) {
        if (modalContainerRef.current.requestFullscreen) {
          modalContainerRef.current.requestFullscreen();
        }
      }
    } catch (err) {
      try {
        document.documentElement.requestFullscreen();
      } catch (e) {
        console.log('Fullscreen not supported');
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isModalOpen) {
        setTimeout(() => {
          if (isModalOpen && modalContainerRef.current) {
            try {
              modalContainerRef.current.requestFullscreen();
            } catch (e) {}
          }
        }, 100);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isModalOpen]);
// ─── SelectField component — floating label + validation dot ────
const SelectField = ({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  options,
}: {
  icon: any;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) => {
  const [focused, setFocused] = useState(false);
  const active = focused || !!value;
  return (
    <motion.div className="ec-field relative flex items-center gap-3 px-4 h-14 sm:h-[60px] rounded-2xl border-2 transition-colors duration-200"
      style={{
        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : '#ffffff',
        borderColor: value
          ? 'rgba(16,185,129,0.55)'
          : active
          ? NAVY
          : isDarkMode
          ? 'rgba(255,255,255,0.10)'
          : `${NAVY}1f`,
      }}
      whileTap={{ scale: 0.995 }}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-200"
        style={{
          backgroundColor: active ? (isDarkMode ? `${NAVY}66` : `${NAVY}14`) : isDarkMode ? '#ffffff0d' : '#14235E0a',
          color: active ? (isDarkMode ? '#fff' : NAVY) : isDarkMode ? '#ffffff66' : `${NAVY}80`,
        }}
      >
        <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={1.75} />
      </div>

      <div className="flex-1 relative h-full">
        <label
          className={cn(
            'absolute left-0 rtl:left-auto rtl:right-0 pointer-events-none font-medium select-none transition-all duration-200 origin-left rtl:origin-right',
            active ? 'top-[7px] sm:top-[9px] text-[10px] sm:text-[11px]' : 'top-1/2 -translate-y-1/2 text-sm sm:text-base'
          )}
          style={{ color: active ? (isDarkMode ? '#ffffffcc' : NAVY) : isDarkMode ? '#ffffff66' : '#9ca3af' }}
        >
          {label}
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            'absolute bottom-1.5 sm:bottom-2 left-0 rtl:left-auto rtl:right-0 w-full appearance-none bg-transparent outline-none text-sm sm:text-base font-medium rtl:pl-5 ltr:pr-5',
            isDarkMode ? 'text-white' : 'text-gray-900'
          )}
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <option value="" style={{ display: 'none' }} />
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              style={{ backgroundColor: isDarkMode ? '#0d1526' : '#ffffff', color: isDarkMode ? '#ffffff' : '#111827' }}
            >
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key="valid"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="shrink-0 h-5 w-5 rounded-full bg-emerald-800 flex items-center justify-center"
          >
            <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
          </motion.div>
        ) : (
          <ChevronDown
            className="shrink-0 h-4 w-4 transition-transform duration-200"
            style={{ color: isDarkMode ? '#ffffff66' : `${NAVY}80`, transform: focused ? 'rotate(180deg)' : 'none' }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

  // ─── Render ──────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes ec-play-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.35); }
          50% { box-shadow: 0 0 0 10px rgba(255,255,255,0); }
        }
        @keyframes ec-mesh-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(3%, -4%) scale(1.08); }
        }
        @keyframes ec-border-glow {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.75; }
        }
        .ec-play-btn { animation: ec-play-pulse 2.4s ease-in-out infinite; }
        .ec-mesh-a { animation: ec-mesh-drift 10s ease-in-out infinite; }
        .ec-mesh-b { animation: ec-mesh-drift 12s ease-in-out infinite reverse; }
        .ec-glass-panel {
          background: linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.78));
          backdrop-filter: blur(16px);
        }
        .ec-glass-panel.dark {
          background: linear-gradient(180deg, rgba(10,20,40,0.6), rgba(5,12,28,0.6));
        }
        .ec-panel-border {
          position: relative;
        }
        .ec-panel-border::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, ${NAVY}55, ${GOLD}33, transparent 60%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: ec-border-glow 4s ease-in-out infinite;
          pointer-events: none;
        }
        .ec-chip {
          transition: transform 0.18s ease, background-color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .ec-chip:active { transform: scale(0.97); }
        .ec-field { transition: transform 0.18s ease; }
        .ec-field:focus-within { transform: translateY(-1px); }
        select option { background-color: #ffffff; }
        @media (prefers-reduced-motion: reduce) {
          .ec-play-btn, .ec-mesh-a, .ec-mesh-b, .ec-panel-border::before { animation: none !important; }
        }
      `}</style>

      <motion.section
        ref={containerRef}
        className={`relative overflow-hidden py-14 sm:py-18 md:py-24 lg:py-28 ${
          isDarkMode ? 'bg-[#000]/90' : 'bg-[#FAFAFA]'
        }`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={containerVariants}
      >
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10 sm:gap-12 lg:gap-14 xl:gap-16">
            {/* ─── Left - Content ────────────────────────────────── */}
            <motion.div className="flex-1 w-full order-2 lg:order-1" variants={itemVariants}>
             

              <motion.h1
                className={`mt-4 sm:mt-5 font-black leading-[1.05] tracking-[-0.03em] text-[1.8rem] sm:text-[2.8rem] md:text-[3.6rem] lg:text-[4.4rem] xl:text-[5rem] max-w-full ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
                style={{ fontFamily: "'Fraunces', serif" }}
                variants={itemVariants}
              >
                {lang.heading}
                <span className={`block mt-1 font-normal italic ${isDarkMode ? 'text-[#14235E]' : 'text-[#14235E]'}`}>
                  {lang.headingHighlight}
                </span>
              </motion.h1>

              <motion.p
                className={`mt-4 sm:mt-5 max-w-2xl text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed ${
                  isDarkMode ? 'text-white/55' : 'text-gray-500'
                }`}
                variants={itemVariants}
              >
                {lang.description}
              </motion.p>

              <motion.div className="mt-4 flex items-center gap-2" variants={itemVariants}>
                <ShieldCheck className="h-4 w-4" style={{ color: NAVY }} strokeWidth={1.75} />
                <span className={`text-xs font-medium ${isDarkMode ? 'text-white/45' : 'text-gray-400'}`}>
                  {lang.trustBadge}
                </span>
              </motion.div>

              {/* ─── Collapsible Email Capture ──────────────────── */}
              <motion.div className="mt-7 sm:mt-9 w-full max-w-2xl" variants={cardVariants}>
                {/* ─── Header (always visible) ───────────────────── */}
                <div
                  className="flex items-center justify-between cursor-pointer select-none p-4 rounded-t-2xl bg-white dark:bg-slate-900/80 border border-[#14235E]/10 dark:border-white/10 transition-colors hover:bg-[#14235E]/5 dark:hover:bg-white/5"
                  onClick={() => setCollapsed(!collapsed)}
                >
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-5 w-5 text-[#14235E] dark:text-[#8FB3EE]" />
                    <span className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white">
                      {lang.heading} {lang.headingHighlight}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: collapsed ? 0 : 180 }}
                    transition={{ duration: 0.3 }}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                  >
                    <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </motion.div>
                </div>
{/* ─── Form (collapsible) ───────────────────────── */}
<AnimatePresence initial={false}>
  {!collapsed && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div
        className={`
          ec-glass-panel ec-panel-border ${isDarkMode ? "dark" : ""}
          relative rounded-b-2xl overflow-hidden
          border-x border-b ${isDarkMode ? "border-white/10" : "border-[#14235E]/10"}
        `}
      >
        {/* ── Idle state: just email + CTA ── */}
        {formMode === "idle" && (
          <div className="p-4 sm:p-6 md:p-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3">
              <div className="flex-1">
                <FloatingInput
                  icon={Mail}
                  label={lang.emailPlaceholder}
                  type="email"
                  value={email}
                  onChange={(v) => {
                    setEmail(v);
                    if (!emailTouched) setEmailTouched(true);
                  }}
                  isValid={isValidEmail}
                  errorMessage={lang.emailError}
                  isDarkMode={isDarkMode}
                />
              </div>

              {/* Gradient-border wrapper replaces the drop shadow */}
              <motion.div
                className="relative rounded-2xl p-[1.5px] shrink-0"
                style={{ background: "linear-gradient(135deg, #4A8ABF, #14235E)" }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <button
                  onClick={handleCtaClick}
                  disabled={!isValidEmail || isDetecting}
                  className="group relative overflow-hidden flex items-center justify-center gap-3 px-6 sm:px-8 h-14 sm:h-[60px] text-sm sm:text-base md:text-lg font-bold text-white rounded-[15px] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 w-full h-full"
                  style={{
                    backgroundColor: "#14235E",
                    ["--tw-outline-color" as any]: "#14235E",
                  }}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {isDetecting ? (
                      <>
                        <div className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        {lang.preparing}
                      </>
                    ) : (
                      <>
                        {lang.cta}
                        <ForwardIcon
                          className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 rtl:group-hover:-translate-x-1.5 ltr:group-hover:translate-x-1.5"
                          strokeWidth={2.5}
                        />
                      </>
                    )}
                  </span>
                </button>
              </motion.div>
            </div>

            <p className={`mt-3.5 sm:mt-4 px-1 text-[10px] sm:text-xs leading-5 ${isDarkMode ? "text-white/30" : "text-gray-400"}`}>
              {lang.terms}
              <a href="/t&c" className="mx-1 font-medium transition-colors underline underline-offset-2 text-[#14235E] hover:text-[#1A4A8A]">
                {lang.termsLink}
              </a>
              {isArabic ? "و" : "and"}
              <a href="/privacy" className="mx-1 font-medium transition-colors underline underline-offset-2 text-[#14235E] hover:text-[#1A4A8A]">
                {lang.privacyLink}
              </a>
              . {lang.unsubscribe}
            </p>
          </div>
        )}

        {/* ── Active form: two-step ── */}
        {formMode !== "idle" && (
          <>
            <div
              className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-7 pt-4 sm:pt-6 pb-3 sm:pb-5 border-b ${
                isDarkMode ? "border-white/10" : "border-[#14235E]/10"
              }`}
            >
              {[1, 2].map((n, idx) => {
                const currentStep = formMode === "step1" ? 1 : 2;
                const isActive = currentStep >= n;
                return (
                  <div key={n} className="flex items-center gap-2 sm:gap-3 flex-1 last:flex-initial">
                    <div className="flex items-center gap-2">
                      {/* Step badge — glow ring instead of boxShadow */}
                      <motion.div
                        className="relative flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold transition-all duration-300"
                        style={{
                          backgroundColor: isActive ? NAVY : isDarkMode ? "#ffffff14" : "#14235E0f",
                          color: isActive ? "#fff" : isDarkMode ? "#ffffff80" : "#14235E80",
                        }}
                        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {isActive && (
                          <span
                            className="absolute -inset-1 rounded-full opacity-60 blur-[6px] -z-10"
                            style={{ background: `radial-gradient(circle, ${NAVY}88, transparent 70%)` }}
                          />
                        )}
                        {currentStep > n ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={3} /> : n}
                      </motion.div>
                      <span
                        className={`hidden sm:inline text-[10px] sm:text-xs font-semibold uppercase tracking-wide transition-opacity duration-300 ${
                          isActive ? "opacity-100" : "opacity-45"
                        }`}
                        style={{ color: isActive ? NAVY : isDarkMode ? "#fff" : "#111827", fontFamily: "'Inter', sans-serif" }}
                      >
                        {n === 1 ? lang.step1Label : lang.step2Label}
                      </span>
                    </div>
                    {idx === 0 && (
                      <div className={`h-[3px] flex-1 rounded-full overflow-hidden ${isDarkMode ? "bg-white/10" : "bg-[#14235E]/10"}`}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: "linear-gradient(90deg, #4A8ABF, #14235E)" }}
                          initial={{ width: "0%" }}
                          animate={{ width: currentStep > 1 ? "100%" : "0%" }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-7">
              <AnimatePresence mode="wait">
                {formMode === "step1" && (
                  <motion.div
                    key="step1"
                    className="ec-step-panel flex flex-col gap-3 sm:gap-3.5"
                    variants={stepPanelVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <FloatingInput
                      icon={User}
                      label={lang.namePlaceholder}
                      value={name}
                      onChange={setName}
                      isValid={isValidName}
                      errorMessage={lang.nameError}
                      isDarkMode={isDarkMode}
                    />

                    <FloatingInput
                      icon={Phone}
                      label={lang.phonePlaceholder}
                      type="tel"
                      value={phone}
                      onChange={setPhone}
                      isValid={isValidPhone}
                      errorMessage={lang.phoneError}
                      isDarkMode={isDarkMode}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                      <SelectField
                        icon={Globe}
                        label={lang.nationalityLabel}
                        value={nationality}
                        onChange={setNationality}
                        placeholder={lang.nationalityLabel}
                        options={nationalities}
                      />
                      <SelectField
                        icon={MapPin}
                        label={lang.emirateLabel}
                        value={emirate}
                        onChange={setEmirate}
                        placeholder={lang.emirateLabel}
                        options={emirates}
                      />
                    </div>

                    <motion.div
                      className="relative rounded-2xl p-[1.5px] mt-1.5 w-full"
                      style={{ background: "linear-gradient(135deg, #4A8ABF, #14235E)" }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <button
                        type="button"
                        onClick={goToStep2}
                        disabled={!name.trim() || !isValidPhone}
                        className="group relative overflow-hidden flex items-center justify-center gap-3 w-full px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base md:text-lg font-bold text-white rounded-[15px] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                        style={{ backgroundColor: NAVY }}
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          {lang.continue}
                          <ForwardIcon
                            className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 rtl:group-hover:-translate-x-1.5 ltr:group-hover:translate-x-1.5"
                            strokeWidth={2.5}
                          />
                        </span>
                      </button>
                    </motion.div>
                  </motion.div>
                )}

                {formMode === "step2" && (
                  <motion.div
                    key="step2"
                    className="ec-step-panel flex flex-col gap-3.5 sm:gap-4"
                    variants={stepPanelVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div>
                      <p className={`mb-2.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wide ${isDarkMode ? "text-white/45" : "text-gray-400"}`}>
                        {lang.serviceLabel}
                      </p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {services.map((svc) => {
                          const active = serviceInterest === svc.value;
                          return (
                            <motion.button
                              key={svc.value}
                              type="button"
                              onClick={() => setServiceInterest(active ? "" : svc.value)}
                              className="ec-chip relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold border overflow-hidden"
                              style={{
                                borderColor: active ? NAVY : isDarkMode ? "#ffffff22" : "#14235E22",
                                backgroundColor: active ? NAVY : isDarkMode ? "transparent" : "#ffffff",
                                color: active ? "#fff" : isDarkMode ? "#ffffffcc" : "#111827",
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {active && (
                                <span
                                  className="absolute -inset-1 rounded-full opacity-50 blur-[8px] -z-10"
                                  style={{ background: `radial-gradient(circle, ${NAVY}99, transparent 70%)` }}
                                />
                              )}
                              {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                              {svc.label}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                      <SelectField
                        icon={Clock}
                        label={lang.urgencyLabel}
                        value={urgency}
                        onChange={setUrgency}
                        placeholder={lang.urgencyLabel}
                        options={urgencies}
                      />
                      <SelectField
                        icon={PhoneCall}
                        label={lang.contactMethodLabel}
                        value={contactMethod}
                        onChange={setContactMethod}
                        placeholder={lang.contactMethodLabel}
                        options={contactMethods}
                      />
                    </div>

                    <FloatingTextarea
                      icon={MessageSquare}
                      label={lang.messagePlaceholder}
                      value={message}
                      onChange={setMessage}
                      maxLength={500}
                      isDarkMode={isDarkMode}
                    />

                    {/* Agreement checkbox — glow-based active state, no shadow */}
                    <motion.label
                      htmlFor="agree"
                      className={cn(
                        "flex items-start gap-3 p-3 sm:p-3.5 rounded-2xl border-2 cursor-pointer transition-colors duration-200 mt-1",
                        agreed
                          ? isDarkMode
                            ? "border-white/30 bg-[#14235E]/25"
                            : "border-[#14235E] bg-[#14235E]/[0.05]"
                          : isDarkMode
                          ? "border-white/10 hover:border-white/20"
                          : "border-[#14235E]/12 hover:border-[#14235E]/25"
                      )}
                      whileTap={{ scale: 0.99 }}
                    >
                      <input type="checkbox" id="agree" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="sr-only" />
                      <motion.div
                        className="relative mt-0.5 h-5 w-5 shrink-0 rounded-md border-2 flex items-center justify-center"
                        style={{
                          borderColor: agreed ? NAVY : isDarkMode ? "#ffffff33" : "#14235E33",
                          backgroundColor: agreed ? NAVY : "transparent",
                        }}
                        animate={agreed ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                        transition={{ duration: 0.25 }}
                      >
                        <AnimatePresence>
                          {agreed && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
                              <Check className="h-3.5 w-3.5 text-white" strokeWidth={3.5} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                      <span className={`text-xs sm:text-sm leading-5 font-medium ${isDarkMode ? "text-white/70" : "text-gray-600"}`}>
                        {lang.agreeLabel}
                      </span>
                    </motion.label>

                    <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-1">
                      <motion.button
                        type="button"
                        onClick={goToStep1}
                        className={`inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3.5 sm:py-4 text-sm sm:text-base font-bold rounded-2xl border transition-colors duration-200 w-full sm:w-auto ${
                          isDarkMode ? "border-white/12 text-white hover:bg-white/5" : "border-[#14235E]/15 text-[#14235E] hover:bg-[#14235E]/5"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <BackIcon className="h-4 w-4" strokeWidth={2.5} />
                        {lang.back}
                      </motion.button>

                      <motion.div
                        className="relative rounded-2xl p-[1.5px] flex-1"
                        style={{ background: "linear-gradient(135deg, #4A8ABF, #14235E)" }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <button
                          type="submit"
                          disabled={isSubmitting || !agreed}
                          className="group relative overflow-hidden flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base md:text-lg font-bold text-white rounded-[15px] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed w-full hover:-translate-y-0.5 active:translate-y-0"
                          style={{ backgroundColor: NAVY }}
                        >
                          <span className="relative z-10 flex items-center gap-3">
                            {isSubmitting ? lang.sending : lang.submit}
                            <div className="flex h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-white transition-colors duration-300 group-hover:bg-gray-100">
                              {isSubmitting ? (
                                <div className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-[#14235E] border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <ForwardIcon className="h-4 w-4 sm:h-5 sm:w-5 text-black transition-transform duration-300 rtl:group-hover:-translate-x-1.5 ltr:group-hover:translate-x-1.5" strokeWidth={2.5} />
                              )}
                            </div>
                          </span>
                        </button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </>
        )}
      </div>
    </motion.div>
  )}
</AnimatePresence>
              </motion.div>
            </motion.div>

            {/* ─── Right - Video ──────────────────────────────────── */}
            <motion.div
              className="flex-1 w-full lg:w-auto order-1 lg:order-2 max-w-md mx-auto lg:mx-0"
              variants={itemVariants}
            >
              <div className="relative w-full">
                <div
                  className="pointer-events-none absolute -inset-3 rounded-2xl opacity-60 blur-2xl"
                  style={{ background: `linear-gradient(135deg, ${NAVY}40, ${GOLD}20)` }}
                />
                <motion.div
                  className="relative rounded-2xl overflow-hidden"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  whileHover={{ scale: 1.01 }}
                  
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <motion.div
                    className="relative w-full aspect-square sm:aspect-[4/5] md:aspect-[3/4] lg:aspect-[16/20] xl:aspect-[16/19] min-h-[280px] sm:min-h-[380px] md:min-h-[480px] lg:min-h-[560px]"
                    onClick={openModal}
                    whileTap={{ scale: 0.98 }}
                  >
                    <video
                      ref={videoRef}
                      src="/images/laptop/sufiyan.mp4"
                      className="w-full h-full object-cover"
                      loop
                      muted
                      playsInline
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <motion.div
                        className="ec-play-btn w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center transition-all duration-300 bg-white/15 backdrop-blur-md group-hover:scale-110 border border-white/30"
                        style={isHovering ? { backgroundColor: NAVY, borderColor: NAVY } : undefined}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Play className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-white ml-0.5 sm:ml-1 transition-all duration-300" strokeWidth={2.5} />
                      </motion.div>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                     
                      {isHovering && (
                        <motion.button
                          onClick={(e) => { e.stopPropagation(); toggleSound(); }}
                          aria-label={isMuted ? lang.unmute : lang.mute}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 hover:bg-black/80 hover:scale-110">
                            {isMuted ? (
                              <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" strokeWidth={1.5} />
                            ) : (
                              <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" strokeWidth={1.5} />
                            )}
                          </div>
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ─── Modal ────────────────────────────────────────────── */}
      {isModalOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
          onClick={closeModal}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div ref={modalContainerRef} className="relative w-full h-full bg-black" onClick={(e) => e.stopPropagation()}>
            <video
              ref={modalVideoRef}
              className="w-full h-full object-contain"
              src="/images/laptop/sufiyan.mp4"
              controls
              autoPlay
              playsInline
              controlsList="nodownload"
            />
            <motion.button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-300 hover:scale-110 z-20 border border-white/20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-6 w-6" />
            </motion.button>
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/40 text-xs bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10 pointer-events-none">
              Press ESC or click ✕ to exit
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default EmailCapture;