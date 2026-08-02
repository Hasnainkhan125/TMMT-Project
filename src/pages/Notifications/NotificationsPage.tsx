import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Bell, Mail, MessageSquare, Smartphone, Check } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

const NotificationsPage: React.FC = () => {
  const { notifications, loading, error, markAsRead, fetchNotifications } = useNotifications();

  return (
    <div className="container mx-auto max-w-5xl py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications & Reminders</h1>
        <Badge>Smart Reminders</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email</div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Smartphone className="w-4 h-4" /> SMS</div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> WhatsApp</div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Reminders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-md bg-muted">
            <div>
              <p className="font-medium">Emirates ID Renewal</p>
              <p className="text-sm text-muted-foreground">Due in 28 days</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-md bg-muted">
            <div>
              <p className="font-medium">Visa Expiry</p>
              <p className="text-sm text-muted-foreground">Due in 54 days</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
          {error && <div className="text-sm text-red-500">{error}</div>}
          {notifications.map((n) => (
            <div key={n._id} className={`p-3 rounded-md border flex items-start justify-between ${n.read ? 'opacity-70' : ''}`}>
              <div>
                <div className="text-sm font-medium">{n.title || n.type.replace('_',' ')}</div>
                <div className="text-sm text-muted-foreground">{n.message}</div>
                {n.metadata?.requested?.length ? (
                  <div className="mt-1 text-xs">Requested: {n.metadata.requested.join(', ')}</div>
                ) : null}
              </div>
              <div className="flex gap-2">
                {!n.read && (
                  <Button variant="outline" size="sm" onClick={() => markAsRead(n._id)}>
                    <Check className="w-4 h-4 mr-1" /> Mark read
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={fetchNotifications}>Refresh</Button>
              </div>
            </div>
          ))}
          {(!loading && notifications.length === 0) && (
            <div className="text-sm text-muted-foreground">No notifications</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;


