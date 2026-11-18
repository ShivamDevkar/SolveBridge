import { useEffect, useState } from 'react';
import { Search, Users, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api';

interface AdminUser {
  id: string;
  name: string;
  role: 'CUSTOMER' | 'PROFESSIONAL' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DEACTIVATED';
  phone: string | null;
  createdAt: string;
}

export function AdminUsersListPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ pageSize: '100' });
      if (search.trim()) params.set('search', search.trim());
      const response = await apiFetch<{ data: { users: AdminUser[] } }>(
        `/api/v1/admin/users?${params.toString()}`,
      );
      setUsers(response.data.users);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const updateStatus = async (user: AdminUser, status: 'ACTIVE' | 'SUSPENDED') => {
    try {
      await apiFetch(`/api/v1/admin/users/${encodeURIComponent(user.id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await loadUsers();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update user.');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">User Directory</h1>
        <p className="text-xs text-slate-500 mt-1">Search accounts and manage customer or professional status.</p>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && void loadUsers()} placeholder="Search name or phone" className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg" />
        </div>
        <Button size="sm" onClick={() => void loadUsers()} isLoading={loading}>Search</Button>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <Card>
        <CardHeader className="border-b border-slate-100"><CardTitle className="flex items-center gap-2 text-sm"><Users className="w-4 h-4" /> Accounts</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {loading ? <p className="py-6 text-center text-sm text-slate-500">Loading users...</p> : users.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">No users found.</p> : users.map((user) => (
            <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border border-slate-200 rounded-lg">
              <div>
                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.role} • {user.phone || 'No phone'} • {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded border ${user.status === 'ACTIVE' ? 'text-emerald-700 border-emerald-200 bg-emerald-50' : 'text-red-700 border-red-200 bg-red-50'}`}>{user.status}</span>
                {user.role !== 'ADMIN' && (user.status === 'ACTIVE'
                  ? <Button size="sm" variant="danger" onClick={() => void updateStatus(user, 'SUSPENDED')} leftIcon={<ShieldAlert className="w-3 h-3" />}>Suspend</Button>
                  : <Button size="sm" variant="outline" onClick={() => void updateStatus(user, 'ACTIVE')} leftIcon={<ShieldCheck className="w-3 h-3" />}>Activate</Button>)}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
