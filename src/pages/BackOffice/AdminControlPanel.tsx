import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Users,
  AlertTriangle,
  FileText,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Search,
  Filter,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ─── Helper: format date ──────────────────────────────────────────────
const formatDate = (ts: string | number) =>
  new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// ─── Main Component ────────────────────────────────────────────────────
const AdminControlPanel: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ byStatus: any[]; byStage: any[]; weekly: any[] } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5001';
  const token = localStorage.getItem('authToken') || '';

  // ─── Load audit logs ──────────────────────────────────────────────────
  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${apiBase}/api/v1/admin/audit-logs?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to load logs');
      setLogs(data?.data?.logs || []);
      setLastUpdated(new Date());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [apiBase, token]);

  // ─── Load statistics ──────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      setStatsError(null);
      const res = await fetch(`${apiBase}/api/v1/visa/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to load stats');
      const st = data?.data?.stats || {};
      setStats({
        byStatus: st.byStatus || [],
        byStage: st.byStage || [],
        weekly: st.weekly || [],
      });
      setLastUpdated(new Date());
    } catch (e: any) {
      setStatsError(e.message);
    } finally {
      setLoadingStats(false);
    }
  }, [apiBase, token]);

  // ─── Initial load & auto‑refresh ─────────────────────────────────────
  useEffect(() => {
    loadLogs();
    loadStats();
    const interval = setInterval(() => {
      loadStats();
      loadLogs();
    }, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [loadLogs, loadStats]);

  // ─── Filtered logs ──────────────────────────────────────────────────
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.actor?.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.entity?.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.action || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || log.result === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // ─── COLORS for charts ──────────────────────────────────────────────
  const COLORS = ['#14235E', '#1A4A8A', '#C9A227', '#E67E22', '#2ECC71', '#E74C3C'];

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto max-w-7xl py-8 space-y-8 px-4 sm:px-6">
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#14235E] to-[#1A4A8A] bg-clip-text text-transparent">
            Admin Control Panel
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor applications, audits, and system health
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Last updated: {formatDate(lastUpdated)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadLogs();
              loadStats();
            }}
            disabled={loading || loadingStats}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${(loading || loadingStats) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ─── Stats Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden border-l-4 border-[#14235E] shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <div className="p-3 rounded-full bg-[#14235E]/10">
                <FileText className="h-6 w-6 text-[#14235E]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-yellow-500 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fraud Alerts</p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-500/10">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-red-500 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Penalties Issued</p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <div className="p-3 rounded-full bg-red-500/10">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-green-500 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <Users className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Charts ──────────────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={(stats.byStatus || []).filter((d) => d._id)}
                    dataKey="count"
                    nameKey="_id"
                    outerRadius={80}
                    label
                  >
                    {(stats.byStatus || []).map((entry, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Stage Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={(stats.byStage || []).filter((d) => d._id)}
                    dataKey="count"
                    nameKey="_id"
                    outerRadius={80}
                    label
                  >
                    {(stats.byStage || []).map((entry, idx) => (
                      <Cell key={idx} fill={COLORS[(idx + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Applications Over Time (Weekly)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={(stats.weekly || []).map((d: any) => ({ date: d._id, count: d.count }))}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#14235E"
                    fill="url(#gradient)"
                    fillOpacity={0.3}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14235E" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#14235E" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Audit Logs Table ────────────────────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Audit Logs</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full sm:w-48"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-6 text-red-500">{error}</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((l) => (
                      <TableRow key={l._id}>
                        <TableCell className="text-xs whitespace-nowrap">
                          {formatDate(l.timestamp || l.formatted_timestamp || Date.now())}
                        </TableCell>
                        <TableCell className="text-xs">{l.actor?.id || l.actor?.type || 'System'}</TableCell>
                        <TableCell className="text-xs">{l.entity?.type}:{l.action}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              l.result === 'success'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : l.result === 'error'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }
                          >
                            {l.result}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Access Controls ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">User Access Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input id="userId" placeholder="User ID" className="flex-1" />
              <Select defaultValue="active">
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="frozen">Frozen</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={async () => {
                  const id = (document.getElementById('userId') as HTMLInputElement)?.value;
                  const status = (document.querySelector('#userStatusSelect') as HTMLSelectElement)?.value;
                  if (!id) return;
                  try {
                    const res = await fetch(`${apiBase}/api/v1/admin/users/${id}/status`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ status }),
                    });
                    if (!res.ok) throw new Error('Failed');
                    loadLogs();
                  } catch {}
                }}
              >
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Application Access Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input id="appId" placeholder="Application ID" className="flex-1" />
              <Select defaultValue="normal">
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Access" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="frozen">Frozen</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={async () => {
                  const id = (document.getElementById('appId') as HTMLInputElement)?.value;
                  const accessStatus = (document.querySelector('#appAccessSelect') as HTMLSelectElement)?.value;
                  if (!id) return;
                  try {
                    const res = await fetch(`${apiBase}/api/v1/admin/applications/${id}/access`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ accessStatus }),
                    });
                    if (!res.ok) throw new Error('Failed');
                    loadLogs();
                  } catch {}
                }}
              >
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminControlPanel;