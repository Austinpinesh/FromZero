"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchWithAuth } from "@/utils/api";


const API_URL = "http://localhost:5000/api";

interface Lesson {
    id: number;
    title: string;
    description: string;
    duration: string | null;
    order: number;
    youtubeUrl: string;
}

interface Course {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    topic: string;
    contentType: string;
    createdAt: string;
    lessons: Lesson[];
}

interface LessonProgress {
    lessonId: number;
    isCompleted: boolean;
    completedAt: string | null;
}

const difficultyColor: Record<string, string> = {
    BEGINNER: "#20c997",
    INTERMEDIATE: "#6366f1",
    ADVANCED: "#f43f5e",
};

const topicIcon: Record<string, string> = {
    math: "calculate",
    science: "science",
    programming: "code",
    ai: "smart_toy",
    design: "palette",
    business: "trending_up",
};

export default function CourseDetailPage() {
    const params = useParams();
    const courseId = params.id;
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Progress state
    const [completedLessons, setCompletedLessons] = useState(0);
    const [totalLessons, setTotalLessons] = useState(0);
    const [completionPct, setCompletionPct] = useState(0);
    const [lessonProgressMap, setLessonProgressMap] = useState<Map<number, LessonProgress>>(new Map());

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await fetchWithAuth(`${API_URL}/courses/${courseId}`);
                const data = await res.json();
                if (data.success) {
                    setCourse(data.data);
                } else {
                    setError(data.message || "Course not found");
                }
            } catch {
                setError("Failed to load course");
            } finally {
                setLoading(false);
            }
        };

        const fetchProgress = async () => {
            const token = localStorage.getItem("accessToken");
            if (!token) return;
            try {
                const res = await fetchWithAuth(`${API_URL}/progress/course/${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (data.success) {
                    setCompletedLessons(data.data.completedLessons);
                    setTotalLessons(data.data.totalLessons);
                    setCompletionPct(data.data.completionPercentage);
                    const map = new Map<number, LessonProgress>();
                    for (const lp of data.data.lessons) {
                        map.set(lp.lessonId, lp);
                    }
                    setLessonProgressMap(map);
                }
            } catch { }
        };

        if (courseId) {
            fetchCourse();
            fetchProgress();
        }
    }, [courseId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <span className="animate-spin material-symbols-outlined text-[#20c997] text-4xl">progress_activity</span>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-200 mb-4">error_outline</span>
                <p className="text-gray-500 font-medium">{error || "Course not found"}</p>
                <Link href="/dashboard/courses" className="mt-4 text-[#20c997] font-bold text-sm hover:underline">← Back to Courses</Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                <Link href="/dashboard/courses" className="hover:text-[#20c997] transition-colors">Courses</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-[#1e293b] font-bold">{course.title}</span>
            </nav>

            {/* Course Header */}
            <div className="bg-white/60 backdrop-blur-[20px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-[24px] p-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Icon */}
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#20c997]/10 to-[#6366f1]/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-5xl text-[#20c997]/50">
                            {topicIcon[course.topic] || "auto_stories"}
                        </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <h1 className="text-3xl font-black text-[#1e293b] tracking-tight">{course.title}</h1>
                        </div>
                        <p className="text-gray-600 leading-relaxed">{course.description}</p>
                        <div className="flex flex-wrap items-center gap-3">
                            <span
                                className="px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider text-white"
                                style={{ backgroundColor: difficultyColor[course.difficulty] || "#64748b" }}
                            >
                                {course.difficulty}
                            </span>
                            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 capitalize">
                                {course.topic}
                            </span>
                            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 capitalize">
                                {course.contentType}
                            </span>
                            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                                {course.lessons.length} lesson{course.lessons.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        {totalLessons > 0 && (
                            <div className="pt-2 space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-gray-500">Progress</span>
                                    <span className="text-[#20c997]">{completedLessons}/{totalLessons} completed · {completionPct}%</span>
                                </div>
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-[#20c997] to-emerald-400 transition-all duration-700"
                                        style={{ width: `${completionPct}%`, boxShadow: "0 0 8px #20c99766" }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Lessons List */}
            <div>
                <h2 className="text-xl font-extrabold text-[#1e293b] mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#20c997]">play_lesson</span>
                    Lessons
                </h2>

                {course.lessons.length === 0 ? (
                    <div className="bg-white/60 backdrop-blur-[20px] border border-white/60 rounded-[24px] p-12 text-center">
                        <span className="material-symbols-outlined text-5xl text-gray-200 mb-4">video_library</span>
                        <p className="text-gray-500 font-medium">No lessons yet</p>
                        <p className="text-gray-400 text-sm mt-1">Lessons will appear here once added</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {course.lessons.map((lesson, idx) => {
                            const progress = lessonProgressMap.get(lesson.id);
                            const done = progress?.isCompleted || false;

                            return (
                                <Link
                                    key={lesson.id}
                                    href={`/dashboard/courses/${course.id}/lessons/${lesson.id}`}
                                    className={`flex items-center gap-5 backdrop-blur-[20px] border rounded-2xl p-5 hover:shadow-xl transition-all duration-300 group ${done
                                        ? "bg-[#20c997]/5 border-[#20c997]/20 hover:bg-[#20c997]/10"
                                        : "bg-white/60 border-white/60 hover:bg-white/80"
                                        }`}
                                >
                                    {/* Completion Icon or Lesson Number */}
                                    <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${done
                                        ? "bg-[#20c997] shadow-lg shadow-[#20c997]/20"
                                        : "bg-[#20c997]/10 group-hover:bg-[#20c997]"
                                        }`}>
                                        {done ? (
                                            <span className="material-symbols-outlined text-white text-xl">check</span>
                                        ) : (
                                            <span className={`font-black group-hover:text-white transition-colors text-[#20c997]`}>
                                                {String(idx + 1).padStart(2, "0")}
                                            </span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-bold group-hover:text-[#20c997] transition-colors truncate ${done ? "text-[#20c997]" : "text-[#1e293b]"}`}>{lesson.title}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5 truncate">{lesson.description}</p>
                                    </div>

                                    {/* Duration + Status + Arrow */}
                                    <div className="flex items-center gap-4 shrink-0">
                                        {lesson.duration && (
                                            <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">schedule</span>
                                                {lesson.duration}
                                            </span>
                                        )}
                                        {done && (
                                            <span className="text-[10px] font-extrabold text-[#20c997] uppercase tracking-wider">Done</span>
                                        )}
                                        <span className="material-symbols-outlined text-gray-300 group-hover:text-[#20c997] group-hover:translate-x-1 transition-all">
                                            arrow_forward
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
