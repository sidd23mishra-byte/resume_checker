// api.ts
import { Chat } from "./types";

export const fetchUser = async () => {
  const res = await fetch("http://localhost:8002/api/users/me", { credentials: "include" });
  if (!res.ok) throw new Error("Not logged in");
  return res.json();
};

export const fetchChats = async (): Promise<Chat[]> => {
  const res = await fetch("http://localhost:8002/api/chat/history", { credentials: "include" });
  const data = await res.json();
  return data.chats || [];
};

export const createChat = async (): Promise<Chat> => {
  const res = await fetch("http://localhost:8002/api/chat/new", { method: "POST", credentials: "include" });
  const data = await res.json();
  return data.chat;
};

export const sendMessageApi = async (chatId: string, content: string) => {
  const res = await fetch("http://localhost:8002/api/chat/send", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, content }),
  });
  return res.json();
};

export const logoutUser = async () => {
  await fetch("http://localhost:8002/api/users/logout", { method: "POST", credentials: "include" });
};