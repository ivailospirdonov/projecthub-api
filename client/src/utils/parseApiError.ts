import axios from "axios";
import type { ApiError } from "../types/api-error";

export function parseApiError(err: unknown): string {
  if (axios.isAxiosError<ApiError>(err)) {
    return err.response?.data?.error?.message || "Request failed";
  }

  return "Unexpected error";
}
