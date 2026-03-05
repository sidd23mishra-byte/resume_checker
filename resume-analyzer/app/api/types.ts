// types.ts
export interface User {
  name: string;
  email: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Chat {
  _id: string;
  messages: Message[];
}