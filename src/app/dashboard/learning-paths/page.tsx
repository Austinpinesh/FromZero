"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/utils/api";


const API_URL = "http://localhost:5000/api";

interface LearningPath {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    topic: string;
    icon: string | null;
    courseCount: number;
    totalLessons: number;
    matchScore: number;
}

const difficultyColors: Record<string, { bg: string; text: string }> = {
    BEGINNER: { bg: "bg-emerald-50", text: "text-emerald-600" },
    INTERMEDIATE: { bg: "bg-amber-50", text: "text-amber-600" },
    ADVANCED: { bg: "bg-indigo-50", text: "text-indigo-600" },
};

const iconGradients = [
    "from-cyan-400 to-indigo-500",
    "from-[#20c997] to-[#06b6d4]",
    "from-violet-400 to-pink-500",
    "from-amber-400 to-orange-500",
    "from-rose-400 to-red-500",
    "from-blue-400 to-indigo-600",
];

export default function LearningPathsPage() {
    const [paths, setPaths] = useState<LearningPath[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPaths = async () => {
            try {
                const headers: Record<string, string> = {};
                const token = localStorage.getItem("accessToken");
                if (token) headers.Authorization = `Bearer ${token}`;

                const res = await fetchWithAuth(`${API_URL}/learning-paths`, { headers });
                const data = await res.json();
                if (data.success) setPaths(data.data.paths);
            } catch {
                console.error("Failed to fetch learning paths");
            } finally {
                setLoading(false);
            }
        };
        fetchPaths();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <span className="animate-spin material-symbols-outlined text-[#20c997] text-4xl">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="max-w-6xl">
            {/* Header */}
            <header className="mb-8">
                <h1 className="text-4xl font-black text-[#1a1a1e] tracking-tight">Your Learning Paths</h1>
                <p className="text-gray-400 font-medium mt-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-[#20c997]">auto_awesome</span>
                    Curated paths based on your interests &amp; pace
                </p>
            </header>

            {/* AI Recommendation Banner */}
            <div className="p-[1px] rounded-[2.5rem] mb-8" style={{ background: "linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #20c997 100%)" }}>
                <div className="bg-white/90 backdrop-blur-xl rounded-[calc(2.5rem-1px)] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div
                            className="size-14 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-cyan-500/20 relative"
                            style={{ background: "linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #20c997 100%)" }}
                        >
                            <span className="material-symbols-outlined text-3xl animate-pulse">psychology</span>
                            <div className="absolute -top-1 -right-1 size-3 bg-white rounded-full border-2 border-[#20c997]"></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-[#1a1a1e]">Personalized for you</h3>
                            <p className="text-gray-500 text-sm">Paths are ranked by relevance to your interests and learning pace</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Paths Grid */}
            {paths.length === 0 ? (
                <div className="text-center py-20">
                    <span className="material-symbols-outlined text-5xl text-gray-200 mb-3">school</span>
                    <p className="text-gray-400 font-medium">No learning paths available yet.</p>
                    <p className="text-gray-300 text-sm mt-1">Check back soon — new paths are being added!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]">
                    {paths.map((path, index) => {
                        const colors = difficultyColors[path.difficulty] || difficultyColors.INTERMEDIATE;
                        const gradient = iconGradients[index % iconGradients.length];
                        const isFirst = index === 0;

                        return (
                            <Link
                                key={path.id}
                                href={`/lesson?pathId=${path.id}`}
                                className={`${isFirst ? "md:col-span-8 md:row-span-2" : "md:col-span-4"} bg-white/30 backdrop-blur-xl border border-white/40 rounded-[2.5rem] ${isFirst ? "p-10" : "p-8"} flex flex-col justify-between overflow-hidden relative hover:scale-[1.02] hover:bg-white/50 hover:shadow-2xl hover:shadow-[#20c997]/10 transition-all duration-500 ${isFirst ? "border-2 border-[#20c997]/5" : ""}`}
                            >
                                {/* Match Score Badge */}
                                {path.matchScore > 0 && (
                                    <div className="absolute top-6 right-6">
                                        <span className="bg-white/80 backdrop-blur shadow-sm border border-gray-100 px-3 py-1.5 rounded-full text-xs font-bold text-cyan-600 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">bolt</span>
                                            {Math.min(Math.round((path.matchScore / 5) * 100), 99)}% Match
                                        </span>
                                    </div>
                                )}

                                {/* Top Section */}
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`size-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
                                            <span className="material-symbols-outlined text-3xl">{path.icon || "school"}</span>
                                        </div>
                                        <span className={`${colors.bg} ${colors.text} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter`}>
                                            {path.difficulty}
                                        </span>
                                    </div>
                                    <h2 className={`${isFirst ? "text-4xl" : "text-2xl"} font-black text-[#1a1a1e] leading-tight mb-2`}>{path.title}</h2>
                                    {isFirst && (
                                        <p className="text-gray-500 max-w-md text-lg leading-relaxed">{path.description}</p>
                                    )}
                                </div>

                                {/* Bottom Section */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Courses</span>
                                            <span className="text-sm font-bold">{path.courseCount}</span>
                                        </div>
                                        <div className="w-px h-8 bg-gray-100"></div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Lessons</span>
                                            <span className="text-sm font-bold">{path.totalLessons}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 capitalize">
                                        <span className="material-symbols-outlined text-lg text-[#20c997]">explore</span>
                                        {path.topic}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}

                    {/* Custom Path Card */}
                    <div className="md:col-span-4 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center hover:scale-[1.02] hover:shadow-2xl transition-all duration-500">
                        <div className="size-16 rounded-full bg-white shadow-xl flex items-center justify-center text-[#20c997] mb-4" style={{ boxShadow: "0 0 20px rgba(32, 201, 151, 0.3), 0 0 40px rgba(6, 182, 212, 0.2)" }}>
                            <span className="material-symbols-outlined text-3xl">auto_fix_high</span>
                        </div>
                        <h3 className="font-black text-[#1a1a1e]">Custom Path</h3>
                        <p className="text-xs text-gray-400 mt-1">Let AI build a unique path just for you</p>
                        <button className="mt-4 text-xs font-bold text-[#20c997] hover:underline">Coming Soon</button>
                    </div>
                </div>
            )}
        </div>
    );
}
