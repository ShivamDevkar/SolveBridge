import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { mockAdminAdapter } from '@/services/mockAdminAdapter';
import type { AdminAuditLogEntry } from '@/types/admin';
import {
  ScrollText,
  Search,
  RotateCw,
  Clock,
  ArrowRight,
  Eye,
  Terminal,
} from 'lucide-react';

export function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  // Detail inspection modal
  const [selectedLog, setSelectedLog] = useState<AdminAuditLogEntry | null>(null);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await mockAdminAdapter.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const entityTypes = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => set.add(l.entityType));
    return Array.from(set);
  }, [logs]);

  const actionTypes = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => set.add(l.action));
    return Array.from(set);
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (entityFilter !== 'ALL' && log.entityType !== entityFilter) {
        return false;
      }
      if (actionFilter !== 'ALL' && log.action !== actionFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAdmin = log.adminName.toLowerCase().includes(q) || log.adminId.toLowerCase().includes(q);
        const matchesEntityId = log.entityId.toLowerCase().includes(q);
        const matchesAction = log.action.toLowerCase().includes(q);
        const matchesReason = log.reason ? log.reason.toLowerCase().includes(q) : false;
        const matchesLogId = log.id.toLowerCase().includes(q);
        if (!matchesAdmin && !matchesEntityId && !matchesAction && !matchesReason && !matchesLogId) {
          return false;
        }
      }
      return true;
    });
  }, [logs, entityFilter, actionFilter, searchQuery]);

  const getActionBadge = (action: string) => {
    if (action.includes('APPROVE') || action.includes('RESOLVE')) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {action}
        </span>
      );
    }
    if (action.includes('REJECT') || action.includes('DELETE') || action.includes('DISMISS')) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
          {action}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
            Governance & Compliance
          </span>
          <h1 className="text-xl sm:text-2xl font-bold mt-0.5">
            Immutable Administrative Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Tamper-resistant historical ledger of all professional verifications, dispute arbitrations, and taxonomy revisions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadLogs}
            className="flex items-center gap-1.5 text-xs text-slate-200 border-white/20 hover:bg-white/10"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Reload Trail
          </Button>
          <Link to="/admin/dashboard">
            <Button variant="ghost" size="sm" className="text-xs text-purple-200 hover:text-white hover:bg-white/10">
              Admin Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Log ID, Admin, Entity ID, or reason keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Entity Type Filter */}
            <div>
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option value="ALL">All Entity Types ({entityTypes.length})</option>
                {entityTypes.map((et) => (
                  <option key={et} value={et}>
                    {et.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Filter */}
            <div>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option value="ALL">All Actions ({actionTypes.length})</option>
                {actionTypes.map((act) => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 space-y-3">
          <Clock className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
          <p className="text-sm font-medium">Querying audit logs...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <Card className="text-center p-12">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <ScrollText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No Audit Events Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            No audit log entries matched your filter parameters.
          </p>
          {(searchQuery || entityFilter !== 'ALL' || actionFilter !== 'ALL') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setEntityFilter('ALL');
                setActionFilter('ALL');
              }}
              className="mt-4 text-xs"
            >
              Reset Filters
            </Button>
          )}
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold">
                  <th className="p-3 pl-4">Log ID</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Administrator</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target Entity</th>
                  <th className="p-3">State Transition</th>
                  <th className="p-3">Reason / Details</th>
                  <th className="p-3 pr-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 pl-4 font-mono font-bold text-slate-700">
                      {log.id}
                    </td>
                    <td className="p-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{log.adminName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.adminId}</div>
                    </td>
                    <td className="p-3">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-mono font-medium text-slate-800">{log.entityId}</div>
                      <div className="text-[10px] text-slate-400">{log.entityType.replace(/_/g, ' ')}</div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {log.previousState || log.newState ? (
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <span className="text-slate-500">{log.previousState || 'NONE'}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="font-bold text-purple-700">{log.newState || 'NONE'}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-3 max-w-xs truncate text-slate-600" title={log.reason}>
                      {log.reason || '—'}
                    </td>
                    <td className="p-3 pr-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        className="text-xs h-7 px-2 text-purple-700 hover:text-purple-900 hover:bg-purple-50"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* DETAIL INSPECTION MODAL */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Record: ${selectedLog.id}`}
          description={`Logged at ${new Date(selectedLog.timestamp).toISOString()}`}
          size="md"
          footer={
            <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)} className="text-xs">
              Close Inspection
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Action:</span>
                <span className="font-bold text-slate-900">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Entity:</span>
                <span className="font-mono font-semibold text-purple-700">
                  {selectedLog.entityType} ({selectedLog.entityId})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Administrator:</span>
                <span className="font-semibold text-slate-800">
                  {selectedLog.adminName} ({selectedLog.adminId})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-700">{new Date(selectedLog.timestamp).toLocaleString('en-IN')}</span>
              </div>
              {selectedLog.previousState && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Previous State:</span>
                  <span className="font-mono text-slate-700">{selectedLog.previousState}</span>
                </div>
              )}
              {selectedLog.newState && (
                <div className="flex justify-between">
                  <span className="text-slate-500">New State:</span>
                  <span className="font-mono font-bold text-emerald-700">{selectedLog.newState}</span>
                </div>
              )}
            </div>

            {selectedLog.reason && (
              <div>
                <h4 className="font-bold text-slate-700 mb-1">Administrative Justification / Reason:</h4>
                <p className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed italic">
                  "{selectedLog.reason}"
                </p>
              </div>
            )}

            <div>
              <h4 className="font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-purple-600" />
                Raw Audit Event Payload:
              </h4>
              <pre className="p-3 rounded-lg bg-slate-900 text-purple-300 font-mono text-[11px] overflow-x-auto">
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
