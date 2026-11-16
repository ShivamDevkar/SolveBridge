import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { mockMessageAdapter } from '@/services/mockMessageAdapter';
import type { JobWorkspaceContextType } from '@/layouts/JobWorkspaceLayout';
import type { ChatMessage } from '@/types/message';
import {
  Send,
  Paperclip,
  X,
  Check,
  CheckCheck,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  ArrowLeft,
  Clock,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';

export function JobWorkspaceChatPage() {
  const { job } = useOutletContext<JobWorkspaceContextType>();
  const { user, role } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Attachment state (Client-side simulation)
  const [attachment, setAttachment] = useState<{
    name: string;
    dataUrl: string;
    size: number;
    mimeType: string;
  } | null>(null);

  // Full-size image preview modal state
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const loadMessages = useCallback(async (markRead = true) => {
    if (!job) return;
    try {
      const data = await mockMessageAdapter.getMessages(job.id, user?.id);
      setMessages(data);
      if (markRead && user) {
        await mockMessageAdapter.markAsRead(job.id, user.id);
      }
    } catch (err) {
      console.error('Failed to load job messages:', err);
      setErrorMessage('Could not load chat messages.');
    } finally {
      setIsLoading(false);
    }
  }, [job, user]);

  useEffect(() => {
    loadMessages(true);
  }, [loadMessages]);

  useEffect(() => {
    if (!isLoading) {
      scrollToBottom('auto');
    }
  }, [isLoading, messages.length]);

  if (!job) {
    return null; // Handled by JobWorkspaceLayout
  }

  // Access Control (Task G)
  const isParticipant =
    role === 'ADMIN' ||
    (user && (user.id === job.customerId || user.id === job.professionalId));

  if (!isParticipant) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-8 text-center shadow-xs max-w-xl mx-auto my-12 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">Access Restricted</h3>
          <p className="text-sm text-slate-600">
            You are not an authorized participant in this Job Workspace channel. Direct communication is strictly restricted to the registered customer and the assigned professional.
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-700 text-left space-y-1.5 font-mono">
          <p><strong>Job Reference:</strong> #{job.id}</p>
          <p><strong>Customer:</strong> {job.customerName}</p>
          <p><strong>Professional:</strong> {job.professionalName}</p>
          <p><strong>Your Identity:</strong> {user?.name || 'Unauthenticated'} ({role})</p>
        </div>
        <div className="pt-2">
          <Link to={role === 'PROFESSIONAL' ? '/pro/jobs' : '/customer/jobs'}>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Return to My Jobs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isCurrentViewerCustomer = user?.id === job.customerId || role === 'CUSTOMER';
  const counterpartyName = isCurrentViewerCustomer ? job.professionalName : job.customerName;
  const counterpartyRole = isCurrentViewerCustomer ? 'Assigned Professional' : 'Customer';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Invalid file type. Only JPEG, PNG, or WebP images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        dataUrl: reader.result as string,
        size: file.size,
        mimeType: file.type,
      });
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file.');
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!messageText.trim() && !attachment) || isSending) return;

    setIsSending(true);
    setErrorMessage(null);

    try {
      const sentMsg = await mockMessageAdapter.sendMessage(
        {
          jobId: job.id,
          content: messageText.trim(),
          attachment: attachment || undefined,
        },
        {
          id: user?.id || (isCurrentViewerCustomer ? job.customerId : job.professionalId),
          name: user?.name || (isCurrentViewerCustomer ? job.customerName : job.professionalName),
          role: role === 'ADMIN' ? 'ADMIN' : isCurrentViewerCustomer ? 'CUSTOMER' : 'PROFESSIONAL',
        }
      );

      setMessages((prev) => [...prev, sentMsg]);
      setMessageText('');
      setAttachment(null);
      setTimeout(() => scrollToBottom('smooth'), 50);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setErrorMessage(err?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSimulateReply = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setErrorMessage(null);

    try {
      const reply = await mockMessageAdapter.simulateIncomingReply(job.id);
      setMessages((prev) => [...prev, reply]);
      if (user) {
        await mockMessageAdapter.markAsRead(job.id, user.id);
      }
      setTimeout(() => scrollToBottom('smooth'), 50);
    } catch (err: any) {
      console.error('Simulation error:', err);
      setErrorMessage('Failed to simulate reply.');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleRetryMessage = async (messageId: string) => {
    try {
      const retried = await mockMessageAdapter.retryMessage(messageId);
      setMessages((prev) => prev.map((m) => (m.id === messageId ? retried : m)));
    } catch (err: any) {
      setErrorMessage('Retry failed.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Group messages by date
  const formatMessageDate = (isoString: string) => {
    const d = new Date(isoString);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {/* Conversation Header */}
      <Card className="bg-white border-slate-200 shadow-2xs">
        <CardHeader className="py-3.5 px-4 sm:px-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200">
                {counterpartyName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    {counterpartyName}
                  </h2>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {counterpartyRole}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Available in Job Channel
                  </span>
                  <span>•</span>
                  <span>Job Ref: <strong className="font-mono text-slate-700">#{job.id}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSimulateReply}
                disabled={isSimulating}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                className="text-xs"
                title="Frontend mock simulation of counterparty response"
              >
                {isSimulating ? 'Simulating...' : 'Simulate Counterparty Reply'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadMessages(true)}
                className="p-2 text-slate-500 hover:text-slate-800"
                aria-label="Refresh conversation"
                title="Refresh conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Message Stream Container */}
        <CardContent className="p-0 flex flex-col h-[520px] bg-slate-50/50">
          {/* Scrollable messages area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Clock className="w-6 h-6 animate-spin text-blue-600" />
                <p className="text-xs">Loading secure message history...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800">No Messages Yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Start direct coordination with {counterpartyName}. Send updates, ask clarification questions, or share job photos.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isCurrentUser = msg.senderId === user?.id || (isCurrentViewerCustomer && msg.senderRole === 'CUSTOMER');
                const isSystem = msg.messageType === 'SYSTEM';

                // Date separator logic
                const currentDateLabel = formatMessageDate(msg.createdAt);
                const prevDateLabel = index > 0 ? formatMessageDate(messages[index - 1].createdAt) : null;
                const showDateSeparator = currentDateLabel !== prevDateLabel;

                const timeLabel = new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                if (isSystem) {
                  return (
                    <div key={msg.id} className="my-2 flex justify-center">
                      <div className="bg-slate-100 text-slate-600 text-[11px] font-medium px-3 py-1 rounded-full border border-slate-200">
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <React.Fragment key={msg.id}>
                    {showDateSeparator && (
                      <div className="flex items-center justify-center my-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-3 py-0.5 rounded-full shadow-2xs">
                          {currentDateLabel}
                        </span>
                      </div>
                    )}

                    <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                      {/* Sender label for counterparty */}
                      {!isCurrentUser && (
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[11px] font-bold text-slate-800">{msg.senderName}</span>
                          <span className="text-[9px] font-semibold text-slate-500 bg-slate-200 px-1.5 py-0.2 rounded">
                            {msg.senderRole}
                          </span>
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className={`max-w-[85%] sm:max-w-md rounded-2xl px-4 py-2.5 text-sm shadow-2xs ${
                          isCurrentUser
                            ? 'bg-blue-600 text-white rounded-tr-xs'
                            : 'bg-white border border-slate-200 text-slate-900 rounded-tl-xs'
                        }`}
                      >
                        {/* Attachment Thumbnail if present */}
                        {msg.attachmentUrl && (
                          <div className="mb-2 overflow-hidden rounded-lg border border-black/10">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewImage({
                                  url: msg.attachmentUrl!,
                                  name: msg.attachmentName || 'Job Photo',
                                })
                              }
                              className="block relative group cursor-pointer focus:outline-hidden"
                            >
                              <img
                                src={msg.attachmentUrl}
                                alt={msg.attachmentName || 'Job attachment'}
                                className="max-h-48 w-full object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                                Click to enlarge
                              </div>
                            </button>
                            {msg.attachmentName && (
                              <p className={`text-[10px] truncate px-1 pt-1 ${isCurrentUser ? 'text-blue-100' : 'text-slate-500'}`}>
                                📎 {msg.attachmentName}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Message content */}
                        {msg.content && <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>}

                        {/* Bubble footer info */}
                        <div
                          className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${
                            isCurrentUser ? 'text-blue-100' : 'text-slate-600'
                          }`}
                        >
                          <span>{timeLabel}</span>
                          {isCurrentUser && (
                            <span>
                              {msg.status === 'sending' ? (
                                <RotateCw className="w-3 h-3 animate-spin inline" />
                              ) : msg.status === 'failed' ? (
                                <button
                                  type="button"
                                  onClick={() => handleRetryMessage(msg.id)}
                                  className="text-red-200 hover:text-white font-bold underline cursor-pointer"
                                  title="Retry sending"
                                >
                                  Retry
                                </button>
                              ) : msg.isRead ? (
                                <span title="Read by counterparty"><CheckCheck className="w-3.5 h-3.5 inline text-sky-200" /></span>
                              ) : (
                                <span title="Delivered"><Check className="w-3 h-3 inline text-blue-200" /></span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-200 flex items-center justify-between text-xs text-red-700">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-red-500 hover:text-red-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Composer Area */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
            {/* Attachment preview chip before sending */}
            {attachment && (
              <div className="mb-2 flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg max-w-sm">
                <img
                  src={attachment.dataUrl}
                  alt="Attachment preview"
                  className="w-10 h-10 object-cover rounded border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-semibold text-slate-800 truncate">{attachment.name}</p>
                  <p className="text-[10px] text-slate-500">
                    {(attachment.size / 1024).toFixed(1)} KB • Image Attachment
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded cursor-pointer"
                  title="Remove attachment"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                id="chat-file-upload"
              />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-500 hover:text-slate-800 shrink-0 mb-0.5"
                title="Attach photo/image (max 5MB)"
                aria-label="Attach photo or diagram"
              >
                <Paperclip className="w-5 h-5" />
              </Button>

              <div className="flex-1 min-w-0">
                <textarea
                  rows={2}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Type a message to ${counterpartyName}... (Enter to send, Shift+Enter for newline)`}
                  className="w-full resize-none text-xs sm:text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400 text-slate-900 bg-white"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={(!messageText.trim() && !attachment) || isSending}
                className="shrink-0 mb-0.5 px-4 shadow-2xs"
                rightIcon={<Send className="w-4 h-4" />}
                aria-label="Send message"
              >
                {isSending ? 'Sending...' : 'Send'}
              </Button>
            </form>
            <p className="text-[10px] text-slate-400 mt-1 pl-1">
              Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[9px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[9px]">Shift+Enter</kbd> for newline.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Image Preview Modal */}
      {previewImage && (
        <Modal
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          title={previewImage.name}
          size="lg"
        >
          <div className="flex flex-col items-center justify-center p-2">
            <img
              src={previewImage.url}
              alt={previewImage.name}
              className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-md"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

