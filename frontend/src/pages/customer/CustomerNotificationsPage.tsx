import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await apiFetch<{ data: { notifications: Notification[] } }>(
        '/api/v1/notifications?pageSize=50',
      );
      setNotifications(response.data.notifications);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  const markAllRead = async () => {
    await apiFetch('/api/v1/notifications/read-all', { method: 'POST' });
    await loadNotifications();
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="border-b border-slate-100 flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" /> Notifications
          </CardTitle>
          {notifications.some((notification) => !notification.isRead) && (
            <Button variant="outline" size="sm" onClick={markAllRead} leftIcon={<CheckCheck className="w-4 h-4" />}>
              Mark all read
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500">Loading notifications...</p>
          ) : error ? (
            <p className="py-8 text-center text-sm text-red-700">{error}</p>
          ) : notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No notifications yet.</p>
          ) : (
            notifications.map((notification) => {
              const content = (
                <article
                  className={`p-4 rounded-xl border ${
                    notification.isRead
                      ? 'border-slate-200 bg-white'
                      : 'border-blue-200 bg-blue-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{notification.title}</p>
                      <p className="text-xs text-slate-600 mt-1">{notification.message}</p>
                    </div>
                    {!notification.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </article>
              );
              return notification.linkUrl ? (
                <Link key={notification.id} to={notification.linkUrl}>
                  {content}
                </Link>
              ) : (
                <div key={notification.id}>{content}</div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
