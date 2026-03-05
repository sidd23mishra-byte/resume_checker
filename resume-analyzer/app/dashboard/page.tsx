"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Chat, Message } from "../api/types";
import { fetchUser, fetchChats, createChat, sendMessageApi, logoutUser } from "../api/api";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedChat = chats.find(c => c._id === selectedChatId);

  // Fetch user info
  useEffect(() => {
    const getUser = async () => {
      try {
        const data = await fetchUser();
        setUser(data);
      } catch {
        router.push("/login");
      }
    };
    getUser();
  }, [router]);

  // Fetch chats
  useEffect(() => {
    const getChats = async () => {
      try {
        const data = await fetchChats();
        setChats(data);
        if (data.length > 0) setSelectedChatId(data[0]._id);
      } catch (err) {
        console.error(err);
      }
    };
    getChats();
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    if (selectedChat?.messages?.length) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChat?.messages]);

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || !selectedChatId) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMessage: Message = { role: "user", content: input, timestamp };

    // Update chat locally
    setChats(prev =>
      prev.map(c =>
        c._id === selectedChatId ? { ...c, messages: [...(c.messages || []), userMessage] } : c
      )
    );
    setInput("");

    try {
      const data = await sendMessageApi(selectedChatId, userMessage.content);
      if (data.reply) {
        const aiMessage: Message = { role: "assistant", content: data.reply, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
        setChats(prev =>
          prev.map(c =>
            c._id === selectedChatId ? { ...c, messages: [...(c.messages || []), aiMessage] } : c
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create new chat
  const createNewChatHandler = async () => {
    try {
      const newChat = await createChat();
      setChats(prev => [newChat, ...prev]);
      setSelectedChatId(newChat._id);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center text-white bg-black">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-black text-white">

      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-black border-r border-gray-700 p-4 space-y-3">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center font-bold">{user.name.charAt(0)}</div>
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>
        </div>

        <button onClick={createNewChatHandler} className="w-full px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium">+ New Chat</button>
        <button onClick={() => router.push("/dashboard/upload")} className="w-full px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium">Resume Analysis</button>
        <button onClick={() => router.push("/dashboard/profile")} className="w-full px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium">My Account</button>
        <button onClick={async () => { await logoutUser(); router.push("/login"); }} className="w-full px-4 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white font-medium">Logout</button>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto mt-3 space-y-2">
          {chats.map(chat => (
            <div
              key={chat._id}
              onClick={() => setSelectedChatId(chat._id)}
              className={`cursor-pointer p-2 rounded-lg ${chat._id === selectedChatId ? "bg-gray-700 font-semibold" : "bg-gray-800 hover:bg-gray-700"}`}
            >
              Chat {chat._id.slice(-4)}
            </div>
          ))}
        </div>
      </aside>

      {/* Chat Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {selectedChat ? (
          <div className="flex flex-col w-full max-w-2xl h-[600px] bg-black border border-gray-700 rounded-xl">
            <div className="p-4 border-b border-gray-700 text-center font-semibold text-lg">Soul AI</div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-3">
              {!selectedChat.messages || selectedChat.messages.length === 0 ? (
                <div className="text-gray-400 text-center mt-10">Start chatting...</div>
              ) : (
                selectedChat.messages.map((msg, idx) => (
                  <div key={idx} className={`max-w-[70%] p-3 rounded-2xl break-words ${msg.role === "user" ? "ml-auto bg-gray-800 text-white text-right" : "mr-auto bg-gray-700 text-gray-200 text-left"}`}>
                    {msg.content}
                    <div className="text-xs text-gray-400 mt-1">{msg.timestamp}</div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="flex p-3 border-t border-gray-700 gap-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 p-3 bg-black border border-gray-700 text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
              <button onClick={sendMessage} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl transition">Send</button>
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-center">Select a chat to start</div>
        )}
      </main>
    </div>
  );
}