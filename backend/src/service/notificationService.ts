import { prisma } from "../config/prisma";
import type { NotificationType } from "../../generated/prisma/enums";

export interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  linkUrl?: string;
}

/**
 * Creates a single notification. Never throws: a failed notification must not
 * break the main workflow that triggered it. Returns the record or null.
 */
export async function createNotification(
  input: CreateNotificationInput,
): Promise<{ id: string } | null> {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: input.userId,
        title: input.title,
        message: input.message,
        type: input.type,
        ...(input.linkUrl ? { linkUrl: input.linkUrl } : {}),
      },
      select: { id: true },
    });

    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

/**
 * Creates notifications for several users at once. Best-effort: failures are
 * logged, not thrown.
 */
export async function createNotifications(
  inputs: CreateNotificationInput[],
): Promise<void> {
  if (inputs.length === 0) {
    return;
  }

  try {
    await prisma.notification.createMany({
      data: inputs.map((input) => ({
        userId: input.userId,
        title: input.title,
        message: input.message,
        type: input.type,
        ...(input.linkUrl ? { linkUrl: input.linkUrl } : {}),
      })),
    });
  } catch (error) {
    console.error("Failed to create notifications:", error);
  }
}
