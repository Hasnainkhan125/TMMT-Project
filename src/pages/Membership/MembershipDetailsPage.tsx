// src/pages/MembershipDetailsPage.jsx
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Check, 
  ArrowRight, 
  Crown, 
  Zap, 
  Gem, 
  Shield, 
  Users, 
  Clock, 
  Sparkles,
  Star,
  Award,
  TrendingUp,
  MessageSquare,
  Rocket,
  BadgeCheck,
  Home
} from 'lucide-react';
import { PLANS, getEffectivePlan } from '@/lib/plans';

const MembershipDetailsPage = () => {
  const { planId } = useParams();
  const plan = PLANS.find(p => p.id === planId);
  
  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black dark:text-white">Plan not found</h2>
          <Link to="/" className="text-[var(--primary)] hover:underline mt-4 inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const effectivePlan = getEffectivePlan(plan);

  const getPlanIcon = () => {
    if (plan.id === 'monthly') return <Zap className="h-8 w-8 text-[var(--primary)]" />;
    if (plan.id === 'yearly') return <Crown className="h-8 w-8 text-[var(--primary)]" />;
    return <Gem className="h-8 w-8 text-[var(--primary)]" />;
  };

  const getPlanGradient = () => {
    if (plan.id === 'monthly') return 'from-blue-500/10 to-blue-600/5';
    if (plan.id === 'yearly') return 'from-[var(--primary)]/15 to-[var(--primary)]/5';
    return 'from-amber-500/15 to-amber-600/5';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white dark:from-black dark:via-[#0A0A0F] dark:to-black py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Button - Goes to Home */}
        <Link 
          to="/" 
          className="group inline-flex items-center gap-2 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-all duration-300 mb-6 sm:mb-8"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Back</span>
          <Home className="h-4 w-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Premium Header Card */}
          <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${getPlanGradient()} border border-black/10 dark:border-white/10 p-6 sm:p-8 md:p-10 mb-8 sm:mb-10`}>
            {/* Decorative Elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[var(--primary)]/5 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[var(--primary)]/5 blur-3xl" />
            
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-[var(--primary)]/10 dark:bg-[var(--primary)]/20 border border-[var(--primary)]/20">
                  {getPlanIcon()}
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black dark:text-white">
                      {plan.label} Plan
                    </h1>
                    {plan.popular && (
                      <span className="inline-flex items-center gap-1.5 bg-[var(--primary)] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-[var(--primary)]/30">
                        <Star className="h-3 w-3 fill-white" />
                        Most Popular
                      </span>
                    )}
                  </div>
                  <p className="text-base sm:text-lg text-black/60 dark:text-white/50 mt-1">
                    {plan.headline}
                  </p>
                </div>
              </div>

              {/* Price Badge */}
              <div className="flex-shrink-0">
                <div className="bg-white/80 dark:bg-black/50 backdrop-blur-xl rounded-2xl px-6 py-4 border border-black/10 dark:border-white/10 shadow-lg">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-bold text-black dark:text-white">
                      AED {effectivePlan.amount}
                    </span>
                    <span className="text-sm text-black/50 dark:text-white/50">
                      /{plan.intervalLabel}
                    </span>
                  </div>
                  {effectivePlan.isOffer && (
                    <span className="inline-block mt-1 text-xs font-medium text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1 rounded-full">
                      🎉 Save AED {effectivePlan.savings}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Full Membership Details */}
          <div className="space-y-8 sm:space-y-10">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-[var(--primary)] rounded-full" />
              <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
                Complete Membership Details
              </h2>
            </div>

            {/* Premium Comparison Grid - 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <motion.div 
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group bg-white/80 dark:bg-black/50 backdrop-blur-sm border border-black/10 dark:border-white/10 rounded-2xl p-5 sm:p-6 hover:border-[var(--primary)]/40 hover:shadow-lg hover:shadow-[var(--primary)]/5 transition-all duration-300"
              >
                <h3 className="font-semibold text-black dark:text-white mb-3 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[var(--primary)]/10 group-hover:bg-[var(--primary)]/20 transition-colors">
                    <Shield className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  Service Limits
                </h3>
                <p className="text-black/70 dark:text-white/60 leading-relaxed">{plan.serviceLimits}</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group bg-white/80 dark:bg-black/50 backdrop-blur-sm border border-black/10 dark:border-white/10 rounded-2xl p-5 sm:p-6 hover:border-[var(--primary)]/40 hover:shadow-lg hover:shadow-[var(--primary)]/5 transition-all duration-300"
              >
                <h3 className="font-semibold text-black dark:text-white mb-3 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[var(--primary)]/10 group-hover:bg-[var(--primary)]/20 transition-colors">
                    <MessageSquare className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  Questions & Requests
                </h3>
                <p className="text-black/70 dark:text-white/60 leading-relaxed">{plan.questionLimits}</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group bg-white/80 dark:bg-black/50 backdrop-blur-sm border border-black/10 dark:border-white/10 rounded-2xl p-5 sm:p-6 hover:border-[var(--primary)]/40 hover:shadow-lg hover:shadow-[var(--primary)]/5 transition-all duration-300"
              >
                <h3 className="font-semibold text-black dark:text-white mb-3 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[var(--primary)]/10 group-hover:bg-[var(--primary)]/20 transition-colors">
                    <Sparkles className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  AI Capabilities
                </h3>
                <p className="text-black/70 dark:text-white/60 leading-relaxed">{plan.aiCapabilities}</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group bg-white/80 dark:bg-black/50 backdrop-blur-sm border border-black/10 dark:border-white/10 rounded-2xl p-5 sm:p-6 hover:border-[var(--primary)]/40 hover:shadow-lg hover:shadow-[var(--primary)]/5 transition-all duration-300"
              >
                <h3 className="font-semibold text-black dark:text-white mb-3 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[var(--primary)]/10 group-hover:bg-[var(--primary)]/20 transition-colors">
                    <Clock className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  Response Priority
                </h3>
                <p className="text-black/70 dark:text-white/60 leading-relaxed">{plan.responsePriority}</p>
              </motion.div>
            </div>

            {/* Discounts & Benefits - Full Width Premium Card */}
            <motion.div 
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--primary)]/5 via-[var(--primary)]/3 to-transparent dark:from-[var(--primary)]/10 dark:via-[var(--primary)]/5 border border-[var(--primary)]/20 p-6 sm:p-8"
            >
              <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-[var(--primary)]/10 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-[var(--primary)]/20">
                    <Award className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-black dark:text-white">
                    Discounts & Benefits
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <span className="inline-flex items-center gap-2 bg-[var(--primary)]/10 dark:bg-[var(--primary)]/20 px-4 py-2 rounded-full border border-[var(--primary)]/20">
                    <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
                    <span className="text-sm font-medium text-black/80 dark:text-white/80">{plan.discounts}</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {plan.additionalBenefits.map((benefit, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-white/50 dark:bg-white/5 hover:bg-[var(--primary)]/5 transition-colors duration-300"
                    >
                      <Check className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
                      <span className="text-sm text-black/70 dark:text-white/60">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Plan Details - 3 columns on desktop */}
            <div>
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
                <Rocket className="h-5 w-5 text-[var(--primary)]" />
                Plan Comparison
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { label: 'Service Limit', value: plan.planDetails.serviceLimit },
                  { label: 'Questions/Month', value: plan.planDetails.questionsPerMonth },
                  { label: 'AI Level', value: plan.planDetails.aiLevel },
                  { label: 'Priority', value: plan.planDetails.priority },
                  { label: 'Discount', value: plan.planDetails.discountRate },
                  { label: 'Best For', value: plan.planDetails.bestFor },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-xl p-4 text-center border border-black/10 dark:border-white/10 hover:border-[var(--primary)]/30 transition-all duration-300"
                  >
                    <p className="text-[10px] sm:text-xs text-black/40 dark:text-white/40 uppercase tracking-wider font-medium">
                      {item.label}
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-black dark:text-white mt-1">
                      {item.value}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* What's Included - Feature List */}
            <div className="bg-white/80 dark:bg-black/50 backdrop-blur-sm border border-black/10 dark:border-white/10 rounded-2xl p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-[var(--primary)]" />
                What's Included
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plan.bullets.map((bullet, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--primary)]/5 transition-colors duration-300"
                  >
                    <div className="p-1 rounded-full bg-[var(--primary)]/10 shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-[var(--primary)]" />
                    </div>
                    <span className="text-sm text-black/70 dark:text-white/60 leading-relaxed">{bullet}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-black/10 dark:border-white/10">
              <Link
                to="/subscription"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--primary)] text-white font-semibold rounded-full hover:bg-[var(--primary)]/90 transition-all duration-300 shadow-lg shadow-[var(--primary)]/25 hover:shadow-xl hover:shadow-[var(--primary)]/35 hover:-translate-y-0.5"
              >
                Subscribe Now
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/apply"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 border border-black/20 dark:border-white/20 text-black dark:text-white font-semibold rounded-full hover:bg-black/5 dark:hover:bg-white/5 hover:border-[var(--primary)]/40 transition-all duration-300 hover:-translate-y-0.5"
              >
                Explore Services
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MembershipDetailsPage;