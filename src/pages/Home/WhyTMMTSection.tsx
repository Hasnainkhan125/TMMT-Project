// src/components/Home/WhyTMMTSection.jsx
import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Clock,
  Shield,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Headphones,
  Award,
  Crown,
} from 'lucide-react';

const WhyTMMTSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  
  // ─── Detect language manually ──────────────────────────────────────────
  const [isArabic, setIsArabic] = useState(false);
  
  useEffect(() => {
    const checkLanguage = () => {
      const lang = localStorage.getItem('i18nextLng');
      const htmlLang = document.documentElement.lang;
      const navLang = navigator.language;
      
      const isAr = 
        lang === 'ar' || 
        lang === 'ar-AE' || 
        htmlLang === 'ar' || 
        htmlLang === 'ar-AE' ||
        htmlLang?.startsWith('ar') ||
        navLang === 'ar' ||
        navLang === 'ar-AE';
      
      setIsArabic(isAr);
    };
    
    checkLanguage();
    
    const handleStorageChange = (e) => {
      if (e.key === 'i18nextLng' || e.key === 'language' || e.key === 'lang') {
        checkLanguage();
      }
    };
    
    const handleCustomEvent = () => {
      checkLanguage();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('languageChanged', handleCustomEvent);
    window.addEventListener('i18nLanguageChanged', handleCustomEvent);
    
    const observer = new MutationObserver(() => {
      const lang = document.documentElement.lang;
      setIsArabic(lang === 'ar' || lang === 'ar-AE' || lang?.startsWith('ar'));
    });
    
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['lang'] 
    });
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('languageChanged', handleCustomEvent);
      window.removeEventListener('i18nLanguageChanged', handleCustomEvent);
      observer.disconnect();
    };
  }, []);

  // ─── Benefits for "Why TMMT?" section ──────────────────────────────────
  const benefits = [
    { 
      icon: Clock, 
      text: isArabic ? 'وفّر وقتك وجهدك' : 'Save time and effort',
      description: isArabic 
        ? 'تجاوز الطوابير والارتباك. نحن نتولى الأوراق بينما تركز أنت على حياتك.'
        : 'Skip the queues and confusion. We handle the paperwork while you focus on your life.'
    },
    { 
      icon: Shield, 
      text: isArabic ? 'تجنب الأخطاء المكلفة' : 'Avoid costly mistakes',
      description: isArabic
        ? 'احصل على إرشاد خبير قبل اتخاذ أي قرار حكومي. تجنب الغرامات والرفض.'
        : 'Get expert guidance before making any government decision. Prevent fines and rejections.'
    },
    { 
      icon: CheckCircle2, 
      text: isArabic ? 'كل شيء في مكان واحد' : 'Everything in one place',
      description: isArabic
        ? 'جميع الخدمات الحكومية الإماراتية، الفحوصات، والإجراءات متاحة على منصة واحدة.'
        : 'All UAE government services, checkers, and procedures available on a single platform.'
    },
    { 
      icon: MessageSquare, 
      text: isArabic ? 'اسأل قبل أن تتصرف' : 'Ask before you act',
      description: isArabic
        ? 'احصل على إجابات قبل الدفع أو التوقيع أو تقديم أي طلب. اتخذ قرارات مستنيرة.'
        : 'Get answers before you pay, sign, or submit any application. Make informed decisions.'
    },
    { 
      icon: Sparkles, 
      text: isArabic ? 'إجابات فورية بالذكاء الاصطناعي' : 'Instant AI answers',
      description: isArabic
        ? 'احصل على إجابات فورية على مدار الساعة. يتم التعامل مع الحالات المعقدة من قبل خبرائنا.'
        : 'Get instant answers 24/7. Complex cases are handled by our specialists.'
    },
    { 
      icon: Headphones, 
      text: isArabic ? 'دعم خبراء حقيقيين' : 'Real expert support',
      description: isArabic
        ? 'خبراء مؤهلون متاحون على مدار الساعة طوال أيام الأسبوع كلما احتجت إليهم.'
        : 'Qualified specialists available 24/7 whenever you need them.'
    },
  ];

  return (
    <section ref={sectionRef} className="relative bg-white dark:bg-black overflow-hidden py-12 sm:py-16 md:py-20 lg:py-12 w-full">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0A3269]/20 dark:border-white/10 bg-white/80 dark:bg-black/50 backdrop-blur-sm px-3 py-1.5 mb-4">
            <Award className="h-3.5 w-3.5 text-[#0A3269] dark:text-[#4A8ABF]" />
            <span className="text-[10px] font-light uppercase tracking-[0.2em] text-[#0A3269] dark:text-white/60">
              {isArabic ? 'لماذا TMMT؟' : 'Why TMMT?'}
            </span>
          </div>
          
        <h2 
  className="font-bold text-black dark:text-white leading-tight whitespace-normal break-words"
  style={{
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    fontSize: 'clamp(2rem, 8vw, 3.2rem)'
  }}
>
  {isArabic ? (
    <>
      شريكك الموثوق لـ
      <br className="hidden md:block" />
      <span className="text-[#0A3269] dark:text-[#4A8ABF] font-normal" style={{ fontSize: 'clamp(1.6rem, 7vw, 2.4rem)' }}>
        الخدمات الحكومية
      </span>
    </>
  ) : (
    <>
      <span className="font-bold">Your Trusted Partner for</span>
      <br className="hidden md:block" />
      <span className="text-[#0A3269] dark:text-[#4A8ABF] font-normal" style={{ fontSize: 'clamp(1.6rem, 7vw, 2.4rem)' }}>
        Government Services
      </span>
    </>
  )}
</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-7xl mx-auto w-full">
          {benefits.map((benefit, idx) => {
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.05 + (idx * 0.05), duration: 0.5 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative bg-white dark:bg-black/50 rounded-2xl border border-gray-100 dark:border-white/10 p-5 md:p-6 hover:border-[#0A3269]/30 dark:hover:border-[#4A8ABF]/30 hover:shadow-md hover:shadow-[#0A3269]/5 dark:hover:shadow-[#4A8ABF]/5 transition-all duration-300 w-full"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#0A3269] dark:bg-[#4A8ABF] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="p-2.5 rounded-xl bg-[#0A3269]/10 dark:bg-[#4A8ABF]/10 w-fit mb-3 group-hover:bg-[#0A3269] dark:group-hover:bg-[#4A8ABF] transition-all duration-300">
                  <benefit.icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#0A3269] dark:text-[#4A8ABF] group-hover:text-white dark:group-hover:text-black transition-colors duration-300" strokeWidth={1.75} />
                </div>
                
                <h3 className="text-base sm:text-lg font-normal text-black dark:text-white mb-1.5 group-hover:text-[#0A3269] dark:group-hover:text-[#4A8ABF] transition-colors duration-300">
                  {benefit.text}
                </h3>
                <p className="text-sm text-gray-500 dark:text-white/40 leading-relaxed font-light">
                  {benefit.description}
                </p>

                <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-[#0A3269]/5 dark:bg-[#4A8ABF]/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyTMMTSection;