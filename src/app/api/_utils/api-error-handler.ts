import { type DatabaseError } from "pg";

export interface ApiErrorResponse {
  error: string;
  code?: string;
  status: number;
}

export function isDatabaseError(error: unknown): error is DatabaseError {
  return (
    error instanceof Error &&
    "code" in error &&
    typeof (error as DatabaseError).code === "string"
  );
}

export function createApiErrorResponse(
  error: unknown,
  status = 500,
): ApiErrorResponse {
  if (isDatabaseError(error)) {
    if (error.code === "23505") {
      // Unique constraint violation
      return {
        error: "Conlang name already exists.",
        code: "DUPLICATE_CONLANG_NAME",
        status: 409, // Conflict
      };
    }
  }

  console.error("Error:", error);
  return {
    error: "Internal Server Error",
    code: "INTERNAL_SERVER_ERROR",
    status,
  };
}
