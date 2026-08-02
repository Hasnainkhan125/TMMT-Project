import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users } from 'lucide-react';

const FamilyPage: React.FC = () => {
  const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5001'
  const [list, setList] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', relationship: '', passportNumber: '', nationality: '', dateOfBirth: '' })

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : ''

  const load = async () => {
    try {
      const res = await fetch(`${apiBase}/api/v1/dependents`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (res.ok) setList(data?.data?.dependents || [])
    } catch {}
  }

  useEffect(() => { load() }, [])
  return (
    <div className="container mx-auto max-w-5xl py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2"><Users className="w-5 h-5" /> Family & Dependents</h1>
        <Button>Add Dependent</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Dependent</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label>First Name</Label>
            <Input placeholder="First Name" value={form.firstName} onChange={(e)=>setForm({...form, firstName: e.target.value})} />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input placeholder="Last Name" value={form.lastName} onChange={(e)=>setForm({...form, lastName: e.target.value})} />
          </div>
          <div>
            <Label>Relationship</Label>
            <Input placeholder="spouse/child/parent" value={form.relationship} onChange={(e)=>setForm({...form, relationship: e.target.value})} />
          </div>
          <div>
            <Label>Passport Number</Label>
            <Input placeholder="Passport" value={form.passportNumber} onChange={(e)=>setForm({...form, passportNumber: e.target.value})} />
          </div>
          <div>
            <Label>Nationality</Label>
            <Input placeholder="Nationality" value={form.nationality} onChange={(e)=>setForm({...form, nationality: e.target.value})} />
          </div>
          <div>
            <Label>Date of Birth</Label>
            <Input type="date" value={form.dateOfBirth} onChange={(e)=>setForm({...form, dateOfBirth: e.target.value})} />
          </div>
          <div className="col-span-2 flex justify-end">
            <Button disabled={saving} onClick={async ()=>{
              try {
                setSaving(true)
                const res = await fetch(`${apiBase}/api/v1/dependents`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) })
                if (res.ok) { setForm({ firstName:'', lastName:'', relationship:'', passportNumber:'', nationality:'', dateOfBirth:'' }); load() }
              } finally { setSaving(false) }
            }}>Save</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Dependents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {list.length === 0 && (
            <div className="p-3 border rounded-md">
              <p className="text-sm text-muted-foreground">No dependents added</p>
            </div>
          )}
          {list.map((d) => (
            <div key={d._id} className="p-3 border rounded-md flex items-center justify-between">
              <div>
                <p className="font-medium">{d.firstName} {d.lastName}</p>
                <p className="text-sm text-muted-foreground">{d.relationship} • {d.nationality}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={async ()=>{
                  await fetch(`${apiBase}/api/v1/dependents/${d._id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
                  load()
                }}>Remove</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default FamilyPage;


