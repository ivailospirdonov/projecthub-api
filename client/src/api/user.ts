import { parseApiError } from "../utils/parseApiError";
import { api } from "./axios";

export async function getProfile() {
  try {
    const res = await api.get("/user");

    return res.data;
  } catch (error) {
    throw new Error(parseApiError(error));
  }
}
