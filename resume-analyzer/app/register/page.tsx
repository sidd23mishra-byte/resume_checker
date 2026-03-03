"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async () => {
        try {
            const res = await fetch("http://localhost:8002/api/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
                credentials: "include", // VERY IMPORTANT for cookies
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Registration failed");
                return;
            }

            alert("Registration successful 🎉");
            window.location.href = "/login";
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center px-4">

            <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-3xl p-10 w-full max-w-md shadow-2xl transition-all duration-500 hover:shadow-white/10">

                <h2 className="text-4xl font-bold text-white text-center mb-3">
                    Create Account
                </h2>

                <p className="text-gray-400 text-center mb-8">
                    Join the AI Resume Analyzer
                </p>

                {/* Name */}
                <div className="mb-5">
                    <label className="text-gray-300 text-sm">Full Name</label>
                    <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full mt-2 p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white transition"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {/* Email */}
                <div className="mb-5">
                    <label className="text-gray-300 text-sm">Email</label>
                    <input
                        type="email"
                        placeholder="you@example.com"
                        className="w-full mt-2 p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white transition"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* Password */}
                <div className="mb-7">
                    <label className="text-gray-300 text-sm">Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full mt-2 p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white transition"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button
                    onClick={handleRegister}
                    className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:scale-105 transition-transform duration-300"
                >
                    Create Account
                </button>

                {/* Login Redirect */}
                <p className="text-gray-400 text-sm text-center mt-8">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="text-white hover:underline"
                    >
                        Login
                    </Link>
                </p>

            </div>
        </div>
    );
}