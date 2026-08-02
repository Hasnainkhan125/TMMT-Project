import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Shield, MessageSquare, Send, Upload } from 'lucide-react';
import { getSocket } from '@/lib/socket';
import { toast } from 'sonner';

const OfficerDashboard: React.FC = () => {
  const [rooms, setRooms] = useState<Array<{ roomId: string; userName?: string; service?: string; unread: number }>>([])
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, any[]>>({})
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const socket = getSocket()
    socket.emit('register_amer', { name: 'Officer' })
    socket.on('new_chat', (payload: any) => {
      setRooms(prev => [{ roomId: payload.chatId, service: payload.service, unread: 0 }, ...prev])
      setCurrentRoomId(payload.chatId)
    })
    socket.on('message', (msg: any) => {
      const roomId = currentRoomId
      if (!roomId) return
      setMessagesByRoom(prev => ({ ...prev, [roomId]: [...(prev[roomId] || []), msg] }))
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    })
    return () => {
      socket.off('new_chat')
      socket.off('message')
    }
  }, [currentRoomId])

  return (
    <div className="container mx-auto max-w-6xl py-10 space-y-6">
      <h1 className="text-2xl font-semibold flex items-center gap-2"><Shield className="w-5 h-5" /> Officer Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Assigned Applications</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Search by ID or email" />
            <div className="p-3 border rounded-md text-sm text-muted-foreground">No assignments yet.</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Secure Chat</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-12 h-72">
              <div className="col-span-4 border-r p-2 overflow-y-auto">
                {rooms.map((r)=> (
                  <button key={r.roomId} onClick={()=>setCurrentRoomId(r.roomId)} className={`w-full text-left p-2 rounded ${currentRoomId===r.roomId?'bg-blue-50':'hover:bg-surface-light'}`}>
                    <div className="text-sm font-medium">{r.userName || 'User'}</div>
                    <div className="text-xs text-gray-500">{r.service || r.roomId}</div>
                  </button>
                ))}
                {rooms.length===0 && (
                  <div className="text-xs text-gray-500">No rooms</div>
                )}
              </div>
              <div className="col-span-8 flex flex-col">
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {(messagesByRoom[currentRoomId || ''] || []).map((m,idx)=>(
                    <div key={idx} className={`text-sm ${m.type==='amer'?'text-blue-900':'text-foreground'}`}>{m.content}</div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-2 border-t flex gap-2">
                  <Input value={chatInput} onChange={(e)=>setChatInput(e.target.value)} placeholder="Type a message" />
                  <Button onClick={()=>{
                    if (!currentRoomId || !chatInput.trim()) return
                    const socket = getSocket()
                    const msg = { content: chatInput.trim(), type: 'text', metadata: { roomId: currentRoomId } }
                    socket.emit('send_message', { roomId: currentRoomId, message: msg, userId: 'amer' })
                    setChatInput('')
                  }}><Send className="w-4 h-4" /></Button>
                  <Button variant="outline" onClick={()=>{
                    if (!currentRoomId) return
                    const el = document.createElement('input'); el.type='file'; el.onchange= async (e:any)=>{
                      const file = e.target.files?.[0]; if (!file) return;
                      const token = localStorage.getItem('authToken') || ''
                      const form = new FormData(); form.append('file', file); form.append('roomId', currentRoomId)
                      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/chat/upload?roomId=${currentRoomId}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form })
                      if (!res.ok) { toast.error('Upload failed'); return }
                      const data = await res.json(); const { fileUrl, fileName } = data.data || {}
                      const socket = getSocket(); socket.emit('file_upload_complete', { roomId: currentRoomId, userId: 'amer', fileUrl, fileName })
                    }; el.click();
                  }}><Upload className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>AI Assistance</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Textarea placeholder="Ask: Is this applicant eligible for Golden Visa?" id="aiq" />
          <Button onClick={async ()=>{
            try {
              const q = (document.getElementById('aiq') as HTMLTextAreaElement)?.value || ''
              if (!q) return
              const token = localStorage.getItem('authToken') || ''
              const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/chat/process`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ message: q, context: {} }) })
              const data = await res.json();
              if (res.ok) toast.success('AI', { description: data.response || 'Done' })
              else toast.error(data.message || 'AI error')
            } catch (e) { toast.error('AI error') }
          }}>Ask AI</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfficerDashboard;


