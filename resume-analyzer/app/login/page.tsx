"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    useEffect(() => {
        // @ts-ignore
        window.google?.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
        });

        // @ts-ignore
        window.google?.accounts.id.renderButton(
            document.getElementById("googleBtn"),
            { theme: "outline", size: "large", width: 350 }
        );
    }, []);

    const handleGoogleResponse = async (response: any) => {
        try {
            const res = await fetch("http://localhost:8002/api/users/google", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    credential: response.credential,
                }),
                credentials: "include",
            });

            if (!res.ok) {
                alert("Google login failed");
                return;
            }

            router.push("/dashboard");

        } catch (error) {
            console.error(error);
        }
    };



    const handleLogin = async () => {
        try {
            const res = await fetch("http://localhost:8002/api/users/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
                credentials: "include", // important for cookies
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Login failed");
                return;
            }

            alert("Login successful 🎉");

            // Redirect to dashboard (we will create next)
            window.location.href = "/dashboard";

        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center px-4">

            <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 w-full max-w-md shadow-2xl">

                <h2 className="text-3xl font-bold text-white text-center mb-2">
                    Welcome Back
                </h2>

                <p className="text-gray-400 text-center mb-6">
                    Login to continue to Resume Analyzer
                </p>

                {/* Email Input */}
                <div className="mb-4">
                    <label className="text-gray-300 text-sm">Email</label>
                    <input
                        type="email"
                        placeholder="you@example.com"
                        className="w-full mt-1 p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* Password Input */}
                <div className="mb-6">
                    <label className="text-gray-300 text-sm">Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full mt-1 p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {/* Login Button */}
                <button
                    onClick={handleLogin}
                    className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:scale-105 transition-transform duration-300"
                >
                    Login
                </button>

                {/* Divider */}
                <div className="flex items-center my-6">
                    <div className="flex-1 h-px bg-gray-700"></div>
                    <span className="px-3 text-gray-400 text-sm">OR</span>
                    <div className="flex-1 h-px bg-gray-700"></div>
                </div>

                {/* Google Button */}
                <button
                    id="googleBtn" 
                    className="w-full bg-gray-800 text-white py-3 rounded-xl border border-gray-700 hover:bg-gray-700 transition"
                >
                    Continue with Google
                </button>

                {/* Register Redirect */}
                <p className="text-gray-400 text-sm text-center mt-6">
                    Don’t have an account?{" "}
                    <Link
                        href="/register"
                        className="text-white hover:underline"
                    >
                        Register
                    </Link>
                </p>

            </div>
        </div>
    );
}