"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/utils/api";


const API_URL = "http://localhost:5000/api";

interface Course {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    topic: string;
    contentType: string;
    createdAt: string;
    _count?: { lessons: number };
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

const DIFFICULTIES = ["", "BEGINNER", "INTERMEDIATE", "ADVANCED"];
const TOPICS = ["", "math", "science", "programming", "ai", "design", "business"];

const topicIcon: Record<string, string> = {
    math: "calculate",
    science: "science",
    programming: "code",
    ai: "smart_toy",
    design: "palette",
    business: "trending_up",
};

const difficultyColor: Record<string, string> = {
    BEGINNER: "#20c997",
    INTERMEDIATE: "#6366f1",
    ADVANCED: "#f43f5e",
};

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [topic, setTopic] = useState("");
    const [page, setPage] = useState(1);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (difficulty) params.set("difficulty", difficulty);
            if (topic) params.set("topic", topic);
            params.set("page", String(page));
            params.set("limit", "9");

            const res = await fetchWithAuth(`${API_URL}/courses?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setCourses(data.data.courses);
                setPagination(data.data.pagination);
            }
        } catch {
            console.error("Failed to fetch courses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [difficulty, topic, page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchCourses();
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-[#1e293b]">Courses</h1>
                <p className="text-sm text-slate-500 font-medium mt-1">Browse and discover learning content</p>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1 flex items-center bg-white/60 border border-white/80 rounded-2xl px-5 py-3 shadow-sm">
                    <span className="material-symbols-outlined text-slate-400 text-xl mr-3">search</span>
                    <input
                        className="bg-transparent border-none text-sm w-full placeholder:text-slate-400 font-medium outline-none"
                        placeholder="Search courses..."
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="submit" className="ml-2 text-[#20c997] font-bold text-sm hover:underline">Search</button>
                </form>

                <select
                    value={difficulty}
                    onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
                    className="bg-white/60 border border-white/80 rounded-2xl px-5 py-3 shadow-sm text-sm font-medium text-[#1e293b] outline-none cursor-pointer"
                >
                    <option value="">All Levels</option>
                    {DIFFICULTIES.filter(Boolean).map((d) => (
                        <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>
                    ))}
                </select>

                <select
                    value={topic}
                    onChange={(e) => { setTopic(e.target.value); setPage(1); }}
                    className="bg-white/60 border border-white/80 rounded-2xl px-5 py-3 shadow-sm text-sm font-medium text-[#1e293b] outline-none cursor-pointer capitalize"
                >
                    <option value="">All Topics</option>
                    {TOPICS.filter(Boolean).map((t) => (
                        <option key={t} value={t} className="capitalize">{t}</option>
                    ))}
                </select>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center h-64">
                    <span className="animate-spin material-symbols-outlined text-[#20c997] text-4xl">progress_activity</span>
                </div>
            )}

            {/* No Results */}
            {!loading && courses.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-200 mb-4">search_off</span>
                    <p className="text-gray-500 font-medium">No courses found</p>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                </div>
            )}

            {/* Courses Grid */}
            {!loading && courses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course) => (
                        <Link
                            key={course.id}
                            href={`/dashboard/courses/${course.id}`}
                            className="bg-white/60 backdrop-blur-[20px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-[24px] p-6 group hover:shadow-2xl hover:shadow-[#20c997]/5 transition-all duration-500 block"
                        >
                            {/* Icon Header */}
                            <div className="relative h-36 rounded-3xl overflow-hidden mb-6 bg-gradient-to-br from-[#20c997]/10 to-[#6366f1]/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-6xl text-[#20c997]/30 group-hover:scale-110 transition-transform duration-500">
                                    {topicIcon[course.topic] || "auto_stories"}
                                </span>
                                <div
                                    className="absolute top-4 left-4 px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-white shadow-lg"
                                    style={{ backgroundColor: difficultyColor[course.difficulty] || "#64748b" }}
                                >
                                    {course.difficulty}
                                </div>
                                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-[#1a1a1e] shadow-lg capitalize">
                                    {course.contentType}
                                </div>
                            </div>

                            <h3 className="font-extrabold text-lg text-[#1e293b] mb-2 leading-tight group-hover:text-[#20c997] transition-colors">{course.title}</h3>
                            <p className="text-[13px] text-slate-500 mb-4 font-medium line-clamp-2">{course.description}</p>

                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-400 capitalize flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">topic</span>
                                    {course.topic}
                                </span>
                                {course._count && (
                                    <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">play_lesson</span>
                                        {course._count.lessons} lesson{course._count.lessons !== 1 ? "s" : ""}
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-4 pb-8">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={!pagination.hasPrevPage}
                        className="px-5 py-2.5 rounded-xl bg-white/60 border border-white/80 text-sm font-bold text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-all"
                    >
                        ← Previous
                    </button>
                    <span className="text-sm font-bold text-gray-500">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!pagination.hasNextPage}
                        className="px-5 py-2.5 rounded-xl bg-white/60 border border-white/80 text-sm font-bold text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-all"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}
