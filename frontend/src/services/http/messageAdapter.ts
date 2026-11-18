import { apiFetch } from "@/lib/api";
import type { ChatMessage, MessageSender, SendMessagePayload } from "@/types/message";
import type { IMessageService } from "../messageService";
import { mapMessage, type ApiMessage } from "./mappers";

class ApiMessageAdapter implements IMessageService {
  async getMessages(jobId: string, _currentUserId?: string): Promise<ChatMessage[]> {
    const response = await apiFetch<{ data: { messages: ApiMessage[] } }>(
      `/api/v1/jobs/${encodeURIComponent(jobId)}/messages?limit=100`,
    );

    return (response.data?.messages ?? []).map(mapMessage);
  }

  async sendMessage(payload: SendMessagePayload, _sender: MessageSender): Promise<ChatMessage> {
    const response = await apiFetch<{ data: { message: ApiMessage } }>(
      `/api/v1/jobs/${encodeURIComponent(payload.jobId)}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          content: payload.content || undefined,
          attachment: payload.attachment
            ? { url: payload.attachment.dataUrl, name: payload.attachment.name }
            : undefined,
        }),
      },
    );

    return mapMessage(response.data.message);
  }

  async getLatestMessage(jobId: string): Promise<ChatMessage | null> {
    const response = await apiFetch<{ data: { messages: ApiMessage[] } }>(
      `/api/v1/jobs/${encodeURIComponent(jobId)}/messages?limit=1`,
    );

    const messages = response.data?.messages ?? [];
    return messages.length > 0 ? mapMessage(messages[messages.length - 1]) : null;
  }

  async getUnreadCount(jobId: string, currentUserId: string): Promise<number> {
    try {
      const messages = await this.getMessages(jobId, currentUserId);
      return messages.filter(
        (message) => !message.isRead && message.senderId !== currentUserId,
      ).length;
    } catch {
      return 0;
    }
  }

  async markAsRead(jobId: string, _currentUserId: string): Promise<void> {
    await apiFetch(`/api/v1/jobs/${encodeURIComponent(jobId)}/messages/read-all`, {
      method: "POST",
    });
  }

  async simulateIncomingReply(_jobId: string, _customContent?: string): Promise<ChatMessage> {
    throw new Error("Simulated replies are disabled in live mode.");
  }

  async retryMessage(_messageId: string): Promise<ChatMessage> {
    throw new Error("Message retry is not available in live mode.");
  }

  async deleteMessage(_messageId: string): Promise<boolean> {
    return false;
  }
}

export const apiMessageAdapter: IMessageService = new ApiMessageAdapter();
