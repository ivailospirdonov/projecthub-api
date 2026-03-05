import { parseApiError } from "../utils/parseApiError";
import { api } from "./axios";

export async function signup(email: string, password: string, name?: string) {
  try {
    const res = await api.post("/auth/signup", {
      email,
      password,
      name,
    });

    return res.data;
  } catch (error) {
    throw new Error(parseApiError(error));
  }
}

export async function login(email: string, password: string) {
  try {
    const res = await api.post("/auth/login", {
      email,
      password,
    });

    return res.data;
  } catch (error) {
    throw new Error(parseApiError(error));
  }
}

export async function refreshToken(refreshToken: string) {
  try {
    const res = await api.post("/auth/refresh", {
      refreshToken,
    });

    return res.data;
  } catch (error) {
    throw new Error(parseApiError(error));
  }
}
