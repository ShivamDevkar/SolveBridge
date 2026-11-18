import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { apiJobAdapter } from '@/services/http/jobAdapter';
import { apiMessageAdapter } from '@/services/http/messageAdapter';
import type { Job } from '@/types/job';
import type { ChatMessage } from '@/types/message';
import {
  MessageSquare,
  Clock,
  Search,
  RotateCw,
  Inbox,
} from 'lucide-react';

interface JobThread {
  job: Job;
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export function CustomerMessagesPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<JobThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadThreads = async () => {
    setIsLoading(true);
    try {
      const jobs = await apiJobAdapter.getJobs({
        role: 'CUSTOMER',
        userId: user?.id,
      });

      const threadData: JobThread[] = await Promise.all(
        jobs.map(async (job) => {
          try {
            const msgs = await apiMessageAdapter.getMessages(job.id);
            const unread = user?.id
              ? await apiMessageAdapter.getUnreadCount(job.id, user.id)
              : 0;
            const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : undefined;
            return {
              job,
              lastMessage: lastMsg,
              unreadCount: unread,
            };
          } catch {
            return { job, unreadCount: 0 };
          }
        })
      );

      // Sort threads by latest message timestamp, or job creation
      threadData.sort((a, b) => {
        const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : new Date(a.job.createdAt).getTime();
        const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : new Date(b.job.createdAt).getTime();
        return timeB - timeA;
      });

      setThreads(threadData);
    } catch (err) {
      console.error('Failed to load customer message threads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, [user?.id]);

  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return threads;
    const q = searchQuery.toLowerCase().trim();
    return threads.filter(
      (t) =>
        t.job.id.toLowerCase().includes(q) ||
        t.job.professionalName.toLowerCase().includes(q) ||
        t.job.title.toLowerCase().includes(q) ||
        (t.lastMessage && t.lastMessage.content.toLowerCase().includes(q))
    );
  }, [threads, searchQuery]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/40 to-white border border-blue-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Customer Communications
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Service Chat Channels
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Dedicated conversation channels for your active and completed jobs. Direct message your assigned service professionals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadThreads}
            className="flex items-center gap-1.5 text-xs text-slate-700"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
          <Link to="/customer/dashboard">
            <Button variant="ghost" size="sm" className="text-xs text-slate-600">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations by contractor, job ID, or message text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Thread List */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 space-y-3">
          <Clock className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-sm font-medium">Loading chat channels...</p>
        </div>
      ) : filteredThreads.length === 0 ? (
        <Card className="text-center p-12 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No Chat Channels Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? 'No conversations matched your search keyword.'
              : 'Secure chat channels are created automatically once you accept a proposal from a qualified professional.'}
          </p>
          <div className="pt-2">
            <Link to="/customer/problems">
              <Button variant="outline" size="sm" className="text-xs">
                View My Problems
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredThreads.map(({ job, lastMessage, unreadCount }) => (
            <Card
              key={job.id}
              className="hover:border-blue-300 transition-all hover:shadow-2xs overflow-hidden"
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                      {job.professionalName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-900 truncate">
                          {job.professionalName}
                        </h2>
                        <span className="font-mono text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          #{job.id}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          ({job.status.replace(/_/g, ' ')})
                        </span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white animate-pulse">
                            {unreadCount} New
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-medium text-slate-700 truncate">
                        {job.title}
                      </p>

                      {lastMessage ? (
                        <p className="text-xs text-slate-500 truncate max-w-lg">
                          <span className="font-semibold text-slate-600">
                            {lastMessage.senderRole === 'CUSTOMER' ? 'You' : job.professionalName}:
                          </span>{' '}
                          {lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No messages sent yet. Start the conversation!</p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    {lastMessage && (
                      <span className="text-[11px] text-slate-400">
                        {new Date(lastMessage.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                    <Link to={`/jobs/${job.id}/chat`}>
                      <Button
                        variant="primary"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-1.5 shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Open Chat
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
