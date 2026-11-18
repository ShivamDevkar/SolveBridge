import type { z } from "zod";
import { ApiError } from "./apiError";

/**
 * Validates an unknown payload (usually req.body) with a Zod schema.
 * Throws a 400 ApiError carrying the field-level issues when invalid.
 */
export function parseWith<Schema extends z.ZodType>(
  schema: Schema,
  payload: unknown,
): z.output<Schema> {
  const result = schema.safeParse(payload);

  if (!result.success) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "Request validation failed",
      result.error.issues,
    );
  }

  return result.data;
}
