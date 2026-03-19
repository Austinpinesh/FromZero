"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/api";


const API_URL = "http://localhost:5000/api";

const PACE_OPTIONS = ["slow", "medium", "fast"];
const CONTENT_TYPE_OPTIONS = ["video", "text", "quiz"];
const INTEREST_SUGGESTIONS = ["math", "science", "programming", "ai", "design", "business"];

interface UserProfile {
    id: number;
    name: string;
    email: string;
    learningPace: string | null;
    interests: string[];
    preferredContentType: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    // Editable preference state
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState<string>("");
    const [learningPace, setLearningPace] = useState<string>("");
    const [interests, setInterests] = useState<string[]>([]);
    const [preferredContentType, setPreferredContentType] = useState<string>("");

    // Fetch user profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                const res = await fetchWithAuth(`${API_URL}/user/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (data.success) {
                    setUser(data.data);
                    setEditedName(data.data.name);
                    setLearningPace(data.data.learningPace || "");
                    setInterests(data.data.interests || []);
                    setPreferredContentType(data.data.preferredContentType || "");
                }
            } catch {
                console.error("Failed to fetch profile");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // Save preferences
    const handleSavePreferences = async () => {
        setSaving(true);
        setMessage("");
        try {
            const token = localStorage.getItem("accessToken");
            const body: Record<string, unknown> = {};
            if (editedName && editedName.trim() !== user?.name) body.name = editedName.trim();
            if (learningPace) body.learningPace = learningPace;
            if (interests.length > 0) body.interests = interests;
            if (preferredContentType) body.preferredContentType = preferredContentType;

            const res = await fetchWithAuth(`${API_URL}/user/preferences`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.success) {
                setUser(data.data);
                setIsEditingName(false);
                setMessage("Profile updated successfully!");
                // Also update local storage so other components see the new name
                const localUser = localStorage.getItem("user");
                if (localUser) {
                    const parsed = JSON.parse(localUser);
                    parsed.name = data.data.name;
                    localStorage.setItem("user", JSON.stringify(parsed));
                }
                // Dispatch custom event to notify other components (like navbar) immediately
                window.dispatchEvent(new Event("userUpdated"));
            } else {
                setMessage(data.message || "Failed to save.");
            }
        } catch {
            setMessage("Unable to connect to server.");
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(""), 3000);
        }
    };

    // Toggle an interest
    const toggleInterest = (interest: string) => {
        setInterests((prev) =>
            prev.includes(interest)
                ? prev.filter((i) => i !== interest)
                : [...prev, interest]
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <span className="animate-spin material-symbols-outlined text-[#20c997] text-4xl">
                    progress_activity
                </span>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-gray-500">Unable to load profile.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl">
            {/* Header with Avatar */}
            <header className="relative pt-8 pb-12">
                <div className="absolute inset-0 bg-gradient-to-r from-[#20c997]/5 via-[#8b5cf6]/5 to-[#06b6d4]/5 opacity-40"></div>
                <div className="relative flex flex-col md:flex-row items-center gap-8 z-10">
                    <div className="relative group">
                        <div className="size-40 rounded-full p-1 bg-gradient-to-tr from-[#20c997] to-[#8b5cf6] shadow-2xl">
                            <div className="w-full h-full rounded-full border-4 border-white bg-gradient-to-br from-[#20c997] to-indigo-500 flex items-center justify-center text-white text-5xl font-black">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div className="absolute -bottom-2 right-4 bg-white px-3 py-1 rounded-full shadow-lg border border-gray-100 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[#20c997] text-[16px] font-bold">verified</span>
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#1a1a1e]">Learner</span>
                        </div>
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-5xl font-black text-[#1a1a1e] tracking-tight">{user.name}</h1>
                        <p className="text-gray-500 font-medium mt-2 flex items-center justify-center md:justify-start gap-2">
                            <span className="material-symbols-outlined text-sm text-[#20c997]">mail</span>
                            {user.email}
                        </p>
                        <div className="flex gap-4 mt-6 justify-center md:justify-start">
                            <div className="bg-white/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/40 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Member Since</p>
                                <p className="text-sm font-bold text-[#1a1a1e]">
                                    {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Personal Information */}
                <div className="md:col-span-7 bg-white/50 backdrop-blur-xl border border-white/80 rounded-[1.5rem] p-8 hover:shadow-xl hover:bg-white/70 transition-all duration-500">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-[#1a1a1e] flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#20c997]">person</span>
                            Personal Information
                        </h3>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between group">
                            <div className="flex-grow pr-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</p>
                                {isEditingName ? (
                                    <input
                                        type="text"
                                        value={editedName}
                                        onChange={(e) => setEditedName(e.target.value)}
                                        className="w-full mt-1 bg-white/80 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-[#20c997] focus:ring-1 focus:ring-[#20c997]"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleSavePreferences();
                                            if (e.key === "Escape") {
                                                setIsEditingName(false);
                                                setEditedName(user.name);
                                            }
                                        }}
                                    />
                                ) : (
                                    <p className="text-lg font-medium text-[#1a1a1e]">{user.name}</p>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    if (isEditingName) {
                                        setEditedName(user.name);
                                    }
                                    setIsEditingName(!isEditingName);
                                }}
                                className="size-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#20c997] hover:bg-[#20c997]/10 transition-colors shrink-0"
                                title={isEditingName ? "Cancel" : "Edit Name"}
                            >
                                <span className="material-symbols-outlined text-sm">{isEditingName ? "close" : "edit"}</span>
                            </button>
                        </div>
                        <div className="flex items-center justify-between group border-t border-gray-50 pt-4">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                                <p className="text-lg font-medium text-[#1a1a1e]">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between group border-t border-gray-50 pt-4">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account Created</p>
                                <p className="text-lg font-medium text-[#1a1a1e]">
                                    {new Date(user.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Learning Preferences */}
                <div className="md:col-span-5 bg-white/50 backdrop-blur-xl border border-white/80 rounded-[1.5rem] p-8 hover:shadow-xl hover:bg-white/70 transition-all duration-500">
                    <h3 className="text-xl font-bold text-[#1a1a1e] flex items-center gap-2 mb-8">
                        <span className="material-symbols-outlined text-[#6366f1]">tune</span>
                        Learning Preferences
                    </h3>
                    <div className="space-y-8">
                        {/* Learning Pace */}
                        <div>
                            <span className="text-sm font-bold text-gray-600 block mb-3">Learning Pace</span>
                            <div className="flex p-1 bg-gray-100 rounded-xl">
                                {PACE_OPTIONS.map((pace) => (
                                    <button
                                        key={pace}
                                        onClick={() => setLearningPace(pace)}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all ${learningPace === pace
                                            ? "bg-white shadow-sm text-[#20c997]"
                                            : "text-gray-400 hover:text-gray-600"
                                            }`}
                                    >
                                        {pace}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Preferred Content Type */}
                        <div>
                            <span className="text-sm font-bold text-gray-600 block mb-3">Preferred Content</span>
                            <div className="flex p-1 bg-gray-100 rounded-xl">
                                {CONTENT_TYPE_OPTIONS.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setPreferredContentType(type)}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all ${preferredContentType === type
                                            ? "bg-white shadow-sm text-[#6366f1]"
                                            : "text-gray-400 hover:text-gray-600"
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Interests */}
                        <div>
                            <span className="text-sm font-bold text-gray-600 block mb-4">Interests</span>
                            <div className="flex flex-wrap gap-2">
                                {INTEREST_SUGGESTIONS.map((interest) => (
                                    <button
                                        key={interest}
                                        onClick={() => toggleInterest(interest)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-semibold border capitalize transition-all ${interests.includes(interest)
                                            ? "bg-[#20c997]/10 border-[#20c997]/20 text-[#20c997]"
                                            : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                            }`}
                                    >
                                        {interest}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Preferences Button */}
                <div className="md:col-span-12 flex items-center justify-between">
                    <div>
                        {message && (
                            <span className={`text-sm font-bold ${message.includes("saved") ? "text-[#20c997]" : "text-red-500"}`}>
                                {message}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleSavePreferences}
                        disabled={saving}
                        className="bg-[#20c997] hover:bg-[#18a077] text-white font-bold px-8 py-3 rounded-2xl transition-all shadow-lg shadow-[#20c997]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-lg">save</span>
                                Save Preferences
                            </>
                        )}
                    </button>
                </div>


            </div>
        </div>
    );
}
