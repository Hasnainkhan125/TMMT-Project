// src/components/SubscriptionUpsellCard.tsx
"use client";

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Check, ArrowRight, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PLANS, getEffectivePlan, isEidOfferActive } from '@/lib/plans';

interface SubscriptionUpsellCardProps {
  currentCheckPrice: number; // in AED
  serviceTitle: string;
}

/**
 * Compact subscription upsell shown INSIDE the CheckFormSheet payment step.
 * Tells the user "save money — subscribe instead." Routes them to /subscribe.
 */
export function SubscriptionUpsellCard({
  currentCheckPrice,
  serviceTitle,
}: SubscriptionUpsellCardProps) {
  const navigate = useNavigate();
  const eidActive = isEidOfferActive();

  // Find the best-value yearly plan
  const yearlyPlan = PLANS.find((p) => p.id === 'yearly');
  if (!yearlyPlan) return null;

  const yearlyPrice = getEffectivePlan(yearlyPlan);

  // Calculate value prop: if 1 check = X AED, how many checks until subscription pays off?
  const checksToBreakEven = Math.ceil(yearlyPrice.amount / currentCheckPrice);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-emerald-500/10 p-4 space-y-3"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
          {eidActive ? (
            <Gift className="h-4 w-4 text-amber-600" />
          ) : (
            <Sparkles className="h-4 w-4 text-amber-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm">
              Save with Tammat Membership
            </p>
            {eidActive && (
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] h-5">
                Eid Offer
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Unlimited checks for{' '}
            <span className="font-semibold text-foreground">
              AED {yearlyPrice.amount}/year
            </span>
            {yearlyPrice.isOffer && (
              <span className="line-through text-muted-foreground/60 ml-1">
                AED {yearlyPrice.regularAmount}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-start gap-1.5">
          <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
          <span>All checks free</span>
        </div>
        <div className="flex items-start gap-1.5">
          <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
          <span>Fast-track included</span>
        </div>
        <div className="flex items-start gap-1.5">
          <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
          <span>Cancel anytime</span>
        </div>
        <div className="flex items-start gap-1.5">
          <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
          <span>Pays for itself in {checksToBreakEven} checks</span>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full bg-background hover:bg-background/80 border-amber-500/40 gap-2"
        onClick={() => navigate('/subscription')}
      >
        See plans
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </motion.div>
  );
}