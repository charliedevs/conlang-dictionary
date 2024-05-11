interface ApiError extends Error {
  code?: string;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && "code" in error;
}

export function handleApiErrorResponse(res: Response): Promise<ApiError> {
  return res.json().then((data: { error: string; code?: string }) => {
    const error: ApiError = new Error(data.error || "Unknown error");
    error.code = data.code;
    throw error;
  });
}
