import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

const AdminControlPanel: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5001'
  const [stats, setStats] = useState<{ byStatus:any[]; byStage:any[]; weekly:any[] } | null>(null)

  const loadLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('authToken') || ''
      const res = await fetch(`${apiBase}/api/v1/admin/audit-logs?limit=50`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to load logs')
      setLogs(data?.data?.logs || [])
    } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }
  const loadStats = async () => {
    try {
      const token = localStorage.getItem('authToken') || ''
      const res = await fetch(`${apiBase}/api/v1/visa/stats`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to load stats')
      const st = data?.data?.stats || {}
      setStats({ byStatus: st.byStatus || [], byStage: st.byStage || [], weekly: st.weekly || [] })
    } catch {}
  }
  useEffect(()=>{ loadLogs(); loadStats() }, [])
  return (
    <div className="container mx-auto max-w-6xl py-10 space-y-6">

      <h1 className="text-2xl font-semibold">Admin Control Panel</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Applications</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Fraud Alerts</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Penalties</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Issued</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Audit Logs</CardTitle></CardHeader>
        <CardContent>
          <div className="flex justify-between mb-2">
            <div className="text-sm text-muted-foreground">Latest 50 entries</div>
            <Button size="sm" variant="outline" onClick={loadLogs}>Refresh</Button>
          </div>
          {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
          {error && <div className="text-sm text-error">{error}</div>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((l)=> (
                <TableRow key={l._id}>
                  <TableCell className="text-xs">{new Date(l.timestamp || l.formatted_timestamp || Date.now()).toLocaleString()}</TableCell>
                  <TableCell className="text-xs">{l.actor?.id || l.actor?.type}</TableCell>
                  <TableCell className="text-xs">{l.entity?.type}:{l.action}</TableCell>
                  <TableCell><Badge variant="outline">{l.result}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    {stats && (
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Status Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={(stats.byStatus||[]).filter((d)=>d._id)} dataKey="count" nameKey="_id" outerRadius={80}>
                  {(stats.byStatus||[]).map((entry, idx)=>(<Cell key={idx} fill={["#8884d8","#82ca9d","#ffc658","#ff7300","#0088fe","#00c49f"][idx%6]} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Stage Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={(stats.byStage||[]).filter((d)=>d._id)} dataKey="count" nameKey="_id" outerRadius={80}>
                  {(stats.byStage||[]).map((entry, idx)=>(<Cell key={idx} fill={["#00c49f","#ff7300","#82ca9d","#8884d8","#ffc658"][idx%5]} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="md:col-span-3">
          <CardHeader><CardTitle>Applications Over Time</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={(stats.weekly||[]).map((d:any)=>({ date: d._id, count: d.count }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date"/>
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.5} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    )}
    {/* Controls */}
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle>User Access Control</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <input id="userId" placeholder="User ID" className="border rounded px-2 py-1 text-sm w-full" />
            <select id="userStatus" className="border rounded px-2 py-1 text-sm">
              <option value="active">active</option>
              <option value="frozen">frozen</option>
              <option value="blocked">blocked</option>
            </select>
            <Button size="sm" onClick={async ()=>{
              const id = (document.getElementById('userId') as HTMLInputElement)?.value
              const status = (document.getElementById('userStatus') as HTMLSelectElement)?.value
              if (!id) return
              try {
                const token = localStorage.getItem('authToken')||''
                const res = await fetch(`${apiBase}/api/v1/admin/users/${id}/status`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body: JSON.stringify({ status }) })
                if (!res.ok) throw new Error('Failed')
                loadLogs()
              } catch {}
            }}>Apply</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Application Access Control</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <input id="appId" placeholder="Application ID" className="border rounded px-2 py-1 text-sm w-full" />
            <select id="appAccess" className="border rounded px-2 py-1 text-sm">
              <option value="normal">normal</option>
              <option value="frozen">frozen</option>
              <option value="blocked">blocked</option>
            </select>
            <Button size="sm" onClick={async ()=>{
              const id = (document.getElementById('appId') as HTMLInputElement)?.value
              const accessStatus = (document.getElementById('appAccess') as HTMLSelectElement)?.value
              if (!id) return
              try {
                const token = localStorage.getItem('authToken')||''
                const res = await fetch(`${apiBase}/api/v1/admin/applications/${id}/access`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body: JSON.stringify({ accessStatus }) })
                if (!res.ok) throw new Error('Failed')
                loadLogs()
              } catch {}
            }}>Apply</Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
};

export default AdminControlPanel;


