"use client";

import Link from "next/link";
import { useState } from "react";

const API_URL = "http://localhost:5000/api";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!data.success) {
                if (data.errors && data.errors.length > 0) {
                    setError(data.errors.map((e: { message: string }) => e.message).join(". "));
                } else {
                    setError(data.message || "Registration failed.");
                }
                setLoading(false);
                return;
            }

            setSuccess(true);
            setLoading(false);
        } catch {
            setError("Unable to connect to server. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafb] flex items-center justify-center px-6 py-12">
            <div className="max-w-md w-full">
                {/* Back button */}
                <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#20c997] transition-colors mb-6">
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                    <span className="text-sm font-medium">Back to Home</span>
                </Link>

                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <span className="material-symbols-outlined text-[#20c997] text-4xl font-bold">north_east</span>
                    <span className="text-2xl font-bold text-[#34343d] tracking-tight">FromZero</span>
                </Link>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                    {success ? (
                        <div className="text-center py-6">
                            <div className="inline-flex items-center justify-center size-16 bg-[#20c997]/10 rounded-full mb-4">
                                <span className="material-symbols-outlined text-[#20c997] text-4xl">check_circle</span>
                            </div>
                            <h2 className="text-2xl font-bold text-[#34343d] mb-2">Account Created!</h2>
                            <p className="text-gray-500 mb-6">Your account has been created successfully.</p>
                            <Link
                                href="/login"
                                className="inline-block bg-[#20c997] hover:bg-[#18a077] text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg shadow-[#20c997]/20"
                            >
                                Go to Login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-[#34343d] text-center mb-2">
                                Start your learning journey
                            </h1>
                            <p className="text-gray-500 text-center mb-8">
                                Create your free account to get started
                            </p>

                            {/* Error Alert */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">error</span>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#34343d] mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#20c997] focus:ring-2 focus:ring-[#20c997]/20 outline-none transition-all"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#34343d] mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#20c997] focus:ring-2 focus:ring-[#20c997]/20 outline-none transition-all"
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#34343d] mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Create a password (min 8 chars)"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-[#20c997] focus:ring-2 focus:ring-[#20c997]/20 outline-none transition-all"
                                    />
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 mt-4 bg-[#20c997] hover:bg-[#18a077] text-white font-bold rounded-full transition-all shadow-lg shadow-[#20c997]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>
                                            Creating account...
                                        </>
                                    ) : (
                                        "Create Account"
                                    )}
                                </button>
                            </form>

                            {/* Login link */}
                            <p className="text-center text-gray-500 text-sm mt-6">
                                Already have an account?{" "}
                                <Link href="/login" className="text-[#20c997] font-semibold hover:underline">
                                    Log in
                                </Link>
                            </p>
                        </>
                    )}
                </div>

                {/* Trust indicators */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-6">
                    <span className="material-symbols-outlined text-[#20c997] text-lg">check_circle</span>
                    <span>Free forever • No credit card required</span>
                </div>
            </div>
        </div>
    );
}
