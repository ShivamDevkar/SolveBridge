import type { ChatMessage, SendMessagePayload, MessageSender } from '@/types/message';

export interface IMessageService {
  /**
   * Retrieves conversation history for a job ordered chronologically.
   */
  getMessages(jobId: string, currentUserId?: string): Promise<ChatMessage[]>;

  /**
   * Sends a new message in the job channel.
   */
  sendMessage(payload: SendMessagePayload, sender: MessageSender): Promise<ChatMessage>;

  /**
   * Returns the most recent message in the job workspace channel.
   */
  getLatestMessage(jobId: string): Promise<ChatMessage | null>;

  /**
   * Returns unread message count for the current user in a job channel.
   */
  getUnreadCount(jobId: string, currentUserId: string): Promise<number>;

  /**
   * Marks counterparty messages as read for the current user.
   */
  markAsRead(jobId: string, currentUserId: string): Promise<void>;

  /**
   * Simulates an incoming response from the counterparty for client demonstration.
   */
  simulateIncomingReply(jobId: string, customContent?: string): Promise<ChatMessage>;

  /**
   * Retries delivering a failed message.
   */
  retryMessage(messageId: string): Promise<ChatMessage>;

  /**
   * Deletes a message from local state.
   */
  deleteMessage(messageId: string): Promise<boolean>;
}

