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
    youtubeUrl: string;
    duration: string | null;
    order: number;
    course: {
        id: number;
        title: string;
        topic: string;
        difficulty: string;
    };
}

/**
 * Extracts the YouTube video ID from various URL formats:
 *  - https://www.youtube.com/watch?v=VIDEO_ID
 *  - https://youtu.be/VIDEO_ID
 *  - https://www.youtube.com/embed/VIDEO_ID
 */
function extractYouTubeId(url: string): string | null {
    try {
        const parsed = new URL(url);
        if (parsed.hostname.includes("youtu.be")) {
            return parsed.pathname.slice(1);
        }
        if (parsed.pathname.includes("/embed/")) {
            return parsed.pathname.split("/embed/")[1];
        }
        return parsed.searchParams.get("v");
    } catch {
        return null;
    }
}

export default function LessonViewerPage() {
    const params = useParams();
    const lessonId = params.lessonId;
    const courseId = params.id;

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isCompleted, setIsCompleted] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [completeFeedback, setCompleteFeedback] = useState("");

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const res = await fetchWithAuth(`${API_URL}/lessons/${lessonId}`);
                const data = await res.json();
                if (data.success) {
                    setLesson(data.data);
                } else {
                    setError(data.message || "Lesson not found");
                }
            } catch {
                setError("Failed to load lesson");
            } finally {
                setLoading(false);
            }
        };

        // Check if lesson is already completed
        const checkProgress = async () => {
            const token = localStorage.getItem("accessToken");
            if (!token || !courseId) return;
            try {
                const res = await fetchWithAuth(`${API_URL}/progress/course/${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (data.success) {
                    const lessonProgress = data.data.lessons.find(
                        (l: { lessonId: number; isCompleted: boolean }) => l.lessonId === Number(lessonId)
                    );
                    if (lessonProgress?.isCompleted) {
                        setIsCompleted(true);
                    }
                }
            } catch { }
        };

        if (lessonId) {
            fetchLesson();
            checkProgress();
        }
    }, [lessonId, courseId]);

    const handleMarkComplete = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        setCompleting(true);
        try {
            const res = await fetchWithAuth(`${API_URL}/progress/complete`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ lessonId: Number(lessonId) }),
            });
            const data = await res.json();
            if (data.success) {
                setIsCompleted(true);
                setCompleteFeedback("Lesson completed! 🎉");
                setTimeout(() => setCompleteFeedback(""), 3000);
            }
        } catch {
            setCompleteFeedback("Failed to mark complete");
        } finally {
            setCompleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <span className="animate-spin material-symbols-outlined text-[#20c997] text-4xl">progress_activity</span>
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-200 mb-4">error_outline</span>
                <p className="text-gray-500 font-medium">{error || "Lesson not found"}</p>
                <Link href={`/dashboard/courses/${courseId}`} className="mt-4 text-[#20c997] font-bold text-sm hover:underline">← Back to Course</Link>
            </div>
        );
    }

    const videoId = extractYouTubeId(lesson.youtubeUrl);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-400 font-medium flex-wrap">
                <Link href="/dashboard/courses" className="hover:text-[#20c997] transition-colors">Courses</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <Link href={`/dashboard/courses/${lesson.course.id}`} className="hover:text-[#20c997] transition-colors">{lesson.course.title}</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-[#1e293b] font-bold">{lesson.title}</span>
            </nav>

            {/* Video Player */}
            <div className="bg-black rounded-[24px] overflow-hidden shadow-2xl aspect-video">
                {videoId ? (
                    <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                        title={lesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/60">
                        <span className="material-symbols-outlined text-6xl mb-3">play_circle</span>
                        <p className="font-medium">Video unavailable</p>
                        <a href={lesson.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-[#20c997] text-sm mt-2 hover:underline">
                            Open in YouTube →
                        </a>
                    </div>
                )}
            </div>

            {/* Lesson Info + Mark Complete */}
            <div className="bg-white/60 backdrop-blur-[20px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-[24px] p-8">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-[#1e293b] tracking-tight">{lesson.title}</h1>
                        <div className="flex items-center gap-3 mt-3">
                            {lesson.duration && (
                                <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                    {lesson.duration}
                                </span>
                            )}
                            <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">format_list_numbered</span>
                                Lesson {lesson.order}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <a
                            href={lesson.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                            YouTube
                        </a>
                        {isCompleted ? (
                            <div className="px-5 py-2.5 rounded-xl bg-[#20c997]/10 text-[#20c997] text-xs font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                Completed
                            </div>
                        ) : (
                            <button
                                onClick={handleMarkComplete}
                                disabled={completing}
                                className="px-5 py-2.5 rounded-xl bg-[#20c997] text-white text-xs font-bold hover:bg-[#18a077] shadow-lg shadow-[#20c997]/20 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {completing ? (
                                    <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>
                                ) : (
                                    <span className="material-symbols-outlined text-sm">task_alt</span>
                                )}
                                {completing ? "Saving..." : "Mark Complete"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Feedback toast */}
                {completeFeedback && (
                    <div className="mt-4 px-4 py-2.5 bg-[#20c997]/10 text-[#20c997] text-sm font-bold rounded-xl text-center">
                        {completeFeedback}
                    </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-gray-600 leading-relaxed">{lesson.description}</p>
                </div>
            </div>

            {/* Back to Course */}
            <div className="flex justify-center pb-8">
                <Link
                    href={`/dashboard/courses/${lesson.course.id}`}
                    className="flex items-center gap-2 text-sm font-bold text-[#20c997] hover:underline"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Back to {lesson.course.title}
                </Link>
            </div>
        </div>
    );
}
