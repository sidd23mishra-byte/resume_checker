"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { log } from "console";

interface User {
  name: string;
  email: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:8002/api/users/me", {
          credentials: "include",
        });

        if (!res.ok) {
          router.push("/login");
          return;
        }

        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* Navbar */}
      <header className="w-full border-b border-gray-800 px-10 py-5 flex justify-between items-center">
        <h1 className="text-xl font-semibold tracking-tight">
          ResumeAI
        </h1>

        <button
          onClick={async () => {
            await fetch("http://localhost:8002/api/users/logout", {
              method: "POST",
              credentials: "include",
            });
            router.push("/login");
          }}
          className="text-sm border border-white px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-xl w-full text-center space-y-8">

          <h2 className="text-4xl font-semibold tracking-tight">
            Welcome back, {user?.name}
          </h2>

          <p className="text-gray-400">
            Manage and analyze your resumes with AI.
          </p>

          <div className="border border-gray-800 rounded-xl p-6 text-left space-y-3">
            <p>
              <span className="text-gray-400">Name:</span> {user?.name}
            </p>
            <p>
              <span className="text-gray-400">Email:</span> {user?.email}
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard/upload")}
            className="border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-black transition"
          >
            Upload Resume
          </button>

        </div>
      </main>
    </div>
  );
}