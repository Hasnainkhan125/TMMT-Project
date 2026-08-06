import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  FileText, 
  Users, 
  Building2, 
  Plane, 
  Briefcase,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles,
  ArrowRight,
  BookOpen,
  HelpCircle,
  X,
  Filter,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '@/components/SEO/SEO';

// ─── Service Type Icons ──────────────────────────────────────────────────────
const SERVICE_ICONS: Record<string, any> = {
  tourist: Plane,
  residence: Users,
  investor: Building2,
  work: Briefcase,
  student: BookOpen,
  family: Users,
  default: FileText,
};

const SERVICE_LABELS: Record<string, string> = {
  tourist: 'Tourist Visa',
  residence: 'Residence Visa',
  investor: 'Investor Visa',
  work: 'Work Permit',
  student: 'Student Visa',
  family: 'Family Visa',
  default: 'Visa Service',
};

// ─── Main Component ──────────────────────────────────────────────────────────

const KnowledgeHubPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5001';

  // ─── Fetch Services ────────────────────────────────────────────────────────
  const fetchServices = useCallback(async (searchTerm = '') => {
    try {
      setLoading(true);
      setError(null);
      const url = `${apiBase}/api/v1/services/search?q=${encodeURIComponent(searchTerm || 'visa')}&limit=50`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to load services');
      
      const items = (data?.data?.services || []).map((s: any) => ({
        id: s._id || s.id,
        name: s.serviceName || s.name || 'Service',
        description: s.outsideDescription || s.description || 'No description available',
        type: s.serviceType || s.type || 'default',
        category: s.category || s.type || 'general',
        requirements: s.requiredDocuments || s.requirements || [],
        estimatedTime: s.estimatedTime || s.processingTime || '3-5 business days',
        price: s.price || s.cost || 'Contact us',
        tags: s.tags || [],
        popularity: s.popularity || 0,
        isPopular: s.isPopular || false,
        icon: s.icon || 'default',
      }));
      setServices(items);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Could not load services');
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  // ─── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // ─── Debounce search ──────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery !== undefined) {
      fetchServices(debouncedQuery);
    }
  }, [debouncedQuery, fetchServices]);

  // ─── Filter by category ────────────────────────────────────────────────────
  const filteredServices = useMemo(() => {
    if (activeTab === 'all') return services;
    return services.filter(s => 
      s.type?.toLowerCase() === activeTab || 
      s.category?.toLowerCase() === activeTab
    );
  }, [services, activeTab]);

  // ─── Category stats ───────────────────────────────────────────────────────
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: services.length };
    services.forEach(s => {
      const key = s.type || s.category || 'general';
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [services]);

  // ─── Render Helpers ──────────────────────────────────────────────────────
  const renderServiceCard = (service: any, index: number) => {
    const Icon = SERVICE_ICONS[service.type] || SERVICE_ICONS.default;
    const typeLabel = SERVICE_LABELS[service.type] || service.type || 'Service';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        key={service.id || index}
        className="group"
      >
        <Card className="h-full overflow-hidden border border-gray-200/70 dark:border-white/10 bg-white dark:bg-black/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#0A3269]/10 p-2.5 text-[#0A3269] dark:bg-[#4A8ABF]/20 dark:text-[#4A8ABF]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                    {service.name}
                  </CardTitle>
                  <Badge variant="outline" className="mt-1 text-[10px] font-normal text-gray-500 dark:text-gray-400">
                    {typeLabel}
                  </Badge>
                </div>
              </div>
              {service.isPopular && (
                <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px]">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Popular
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
              {service.description}
            </p>

            {service.requirements && service.requirements.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Requirements
                </p>
                <ul className="space-y-0.5">
                  {service.requirements.slice(0, 3).map((req: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                      <CheckCircle className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                      <span>{req}</span>
                    </li>
                  ))}
                  {service.requirements.length > 3 && (
                    <li className="text-[10px] text-gray-400 dark:text-gray-500">
                      +{service.requirements.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200/50 dark:border-white/5">
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {service.estimatedTime}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {service.requirements?.length || 0} docs
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs text-[#0A3269] hover:text-[#0A3269]/80 hover:bg-[#0A3269]/10 dark:text-[#4A8ABF] dark:hover:bg-[#4A8ABF]/20 dark:hover:text-[#4A8ABF]/80"
                onClick={() => navigate('/apply')}
              >
                Learn More
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // ─── Loading State ────────────────────────────────────────────────────────
  if (loading && services.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#0A3269] dark:text-[#4A8ABF]" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading knowledge base...</p>
        </div>
      </div>
    );
  }

  // ─── Error State ──────────────────────────────────────────────────────────
  if (error && services.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
          <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">Failed to load resources</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 border-[#0A3269]/30 text-[#0A3269] hover:bg-[#0A3269]/10 dark:border-[#4A8ABF]/30 dark:text-[#4A8ABF] dark:hover:bg-[#4A8ABF]/20"
            onClick={() => fetchServices()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // ─── Main Render ──────────────────────────────────────────────────────────
  return (
    <>
      <SEO
        title="Knowledge Hub - UAE Visa Requirements & FAQs | Tammat"
        description="Find comprehensive guides, visa requirements, FAQs, and expert tips for UAE visas. Everything you need to know about tourist, residence, and investor visas in one place."
        keywords="UAE visa requirements, visa FAQs, Dubai visa guide, visa documentation, visa application tips, UAE immigration guide"
        canonicalUrl="/knowledge"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "name": "UAE Visa Knowledge Hub",
          "description": "Comprehensive guides and FAQs about UAE visa services"
        }}
      />

      <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* ─── Header ────────────────────────────────────────────────────────── */}
        <div className="mb-8 space-y-3">
          <h2 className="text-2xl tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Knowledge Hub
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Explore visa requirements, guides, and essential information for your UAE journey.
          </p>
        </div>

        {/* ─── Search Bar ────────────────────────────────────────────────────── */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            className="h-11 pl-9 pr-4 rounded-xl border-gray-200/70 bg-white/80 text-sm shadow-sm focus:border-[#0A3269] focus:ring-[#0A3269] dark:border-white/10 dark:bg-black/40 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#4A8ABF] dark:focus:ring-[#4A8ABF]"
            placeholder="Search for visa types, requirements, documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ─── Tabs + Filter ────────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="inline-flex h-auto flex-wrap gap-1 bg-transparent p-0">
              <TabsTrigger
                value="all"
                className="rounded-full border border-gray-200/70 px-4 py-1.5 text-xs data-[state=active]:border-[#0A3269] data-[state=active]:bg-[#0A3269]/10 data-[state=active]:text-[#0A3269] dark:border-white/10 dark:data-[state=active]:border-[#4A8ABF] dark:data-[state=active]:bg-[#4A8ABF]/20 dark:data-[state=active]:text-[#4A8ABF]"
              >
                All ({categoryCounts.all || 0})
              </TabsTrigger>
              {Object.entries(categoryCounts)
                .filter(([key]) => key !== 'all')
                .map(([key, count]) => {
                  const label = SERVICE_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);
                  return (
                    <TabsTrigger
                      key={key}
                      value={key}
                      className="rounded-full border border-gray-200/70 px-4 py-1.5 text-xs data-[state=active]:border-[#0A3269] data-[state=active]:bg-[#0A3269]/10 data-[state=active]:text-[#0A3269] dark:border-white/10 dark:data-[state=active]:border-[#4A8ABF] dark:data-[state=active]:bg-[#4A8ABF]/20 dark:data-[state=active]:text-[#4A8ABF]"
                    >
                      {label} ({count})
                    </TabsTrigger>
                  );
                })}
            </TabsList>
          </Tabs>

        </div>

        {/* ─── Results Grid ──────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {filteredServices.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service, idx) => renderServiceCard(service, idx))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200/60 bg-gray-50/30 py-16 dark:border-white/10 dark:bg-white/5"
            >
              <HelpCircle className="h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="mt-3 text-base font-medium text-gray-600 dark:text-gray-400">No results found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Try adjusting your search or filter.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Footer note ──────────────────────────────────────────────────── */}
        <div className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500">
          <p>Information is for guidance only. Always verify with official UAE authorities.</p>
        </div>
      </div>
    </>
  );
};

export default KnowledgeHubPage;