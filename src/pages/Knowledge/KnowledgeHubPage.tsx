import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import SEO from '@/components/SEO/SEO';

const KnowledgeHubPage: React.FC = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5001'

  const searchGuides = async () => {
    try {
      setLoading(true); setError(null)
      const res = await fetch(`${apiBase}/api/v1/services/search?q=${encodeURIComponent(query||'visa')}&limit=20`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to search')
      const items = (data?.data?.services || []).map((s:any)=>({
        title: s.serviceName || s.name,
        desc: s.outsideDescription || s.description,
        reqs: s.requiredDocuments || s.requirements || [],
      }))
      setResults(items)
    } catch (e:any) { setError(e.message) } finally { setLoading(false) }
  }
  useEffect(()=>{ searchGuides() }, [])
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
      <div className="container mx-auto max-w-5xl py-10 space-y-6">
        <h1 className="text-2xl font-semibold">Knowledge Hub</h1>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search FAQs, guides, requirements..." value={query} onChange={(e)=>setQuery(e.target.value)} onKeyDown={(e)=>{ if (e.key==='Enter') searchGuides() }} />
      </div>
      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Visa Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {results.slice(0,5).map((r,i)=> (
                <li key={i}>{r.title}: {r.reqs.slice(0,4).join(', ')}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {results.slice(5,10).map((r,i)=> (
                <li key={i}>{r.title}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};

export default KnowledgeHubPage;


