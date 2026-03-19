"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/utils/api";

const API_URL = "http://localhost:5000/api";

interface WeeklyDay { date: string; completions: number; }
interface RecentLesson { lessonId: number; lessonTitle: string; courseTitle: string; completedAt: string; }
interface RecentQuiz { attemptId: number; quizTitle: string; score: number; totalQuestions: number; percentage: number; attemptedAt: string; }
interface DashboardData {
    coursesStarted: number; lessonsCompleted: number; totalLessonsAvailable: number;
    overallCompletionPercentage: number; quizzesAttempted: number; averageQuizScore: number;
    currentStreak: number; weeklyActivity: WeeklyDay[];
    recentActivity: { recentLessons: RecentLesson[]; recentQuizAttempts: RecentQuiz[]; };
}
interface TrendsData {
    weeklyProgressGrowth: { currentWeek: number; previousWeek: number; growthPercentage: number; trend: string; };
    mostActiveDayOfWeek: { day: string; averageCompletions: number; };
    quizScoreTrend: { recentAverage: number | null; previousAverage: number | null; improvementPercentage: number | null; trend: string; };
    monthlyCompletions: { month: string; completions: number; }[];
}
interface Insight { type: string; message: string; courseId?: number; courseTitle?: string; averageScore?: number; completedCourseId?: number; suggestedCourseId?: number; suggestedCourseTitle?: string; lastActivityAt?: string; }

export default function AnalyticsPage() {
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [trends, setTrends] = useState<TrendsData | null>(null);
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    useEffect(() => {
        if (!token) return;
        const load = async () => {
            try {
                const [dashRes, trendRes, insightRes] = await Promise.all([
                    fetchWithAuth(`${API_URL}/analytics/dashboard`),
                    fetchWithAuth(`${API_URL}/analytics/trends`),
                    fetchWithAuth(`${API_URL}/analytics/insights`),
                ]);
                const [dashData, trendData, insightData] = await Promise.all([dashRes.json(), trendRes.json(), insightRes.json()]);
                if (dashData.success) setDashboard(dashData.data);
                if (trendData.success) setTrends(trendData.data);
                if (insightData.success) setInsights(insightData.data.insights);
            } catch { console.error("Failed to load analytics"); }
            finally { setLoading(false); }
        };
        load();
    }, [token]);

    // Helpers
    const maxCompletions = dashboard ? Math.max(...dashboard.weeklyActivity.map(d => d.completions), 1) : 1;
    const dayLabel = (dateStr: string) => {
        const d = new Date(dateStr + "T00:00:00");
        return ["S", "M", "T", "W", "T", "F", "S"][d.getDay()];
    };
    const completionRing = dashboard ? Math.round(502 - (dashboard.overallCompletionPercentage / 100) * 502) : 502;
    const trendIcon = (t: string) => t === "improving" ? "trending_up" : t === "declining" ? "trending_down" : "trending_flat";
    const trendColor = (t: string) => t === "improving" ? "text-[#20c997]" : t === "declining" ? "text-red-400" : "text-gray-400";
    const insightIcon = (type: string) => {
        switch (type) {
            case "revision_needed": return "warning";
            case "next_level_ready": return "rocket_launch";
            case "resume_suggested": return "resume";
            case "on_track": return "check_circle";
            default: return "lightbulb";
        }
    };
    const insightColor = (type: string) => {
        switch (type) {
            case "revision_needed": return "bg-orange-50 border-orange-100/50 text-orange-500";
            case "next_level_ready": return "bg-violet-50 border-violet-100/50 text-violet-500";
            case "resume_suggested": return "bg-blue-50 border-blue-100/50 text-blue-500";
            case "on_track": return "bg-[#20c997]/5 border-[#20c997]/10 text-[#20c997]";
            default: return "bg-gray-50 border-gray-100 text-gray-500";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <span className="animate-spin material-symbols-outlined text-[#20c997] text-4xl">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="max-w-6xl">
            {/* Header */}
            <header className="mb-8">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] font-bold mb-1">
                    <span className="text-gray-400">Dashboard</span>
                    <span className="material-symbols-outlined text-[10px] text-gray-300">chevron_right</span>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#20c997] to-indigo-500 font-bold">Performance</span>
                </div>
                <h1 className="text-2xl font-black text-[#1a1a1e] tracking-tight">Your Learning Performance</h1>
            </header>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

                {/* Mastery Card - Large */}
                <div className="md:col-span-8 bg-white/40 backdrop-blur-2xl border border-white/60 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-10 min-h-[300px] hover:bg-white/60 hover:shadow-xl transition-all duration-500">
                    {/* Progress Ring */}
                    <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full">
                            <circle className="text-gray-100" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="10"></circle>
                            <circle
                                className="text-[#20c997]"
                                cx="96" cy="96" fill="transparent" r="80"
                                stroke="currentColor" strokeWidth="12"
                                strokeDasharray="502" strokeDashoffset={completionRing}
                                strokeLinecap="round"
                                style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", filter: "drop-shadow(0 0 8px rgba(32, 201, 151, 0.3))", transition: "stroke-dashoffset 1s ease" }}
                            ></circle>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-3xl font-black text-[#1a1a1e] leading-none">{dashboard?.overallCompletionPercentage ?? 0}%</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Completion</span>
                        </div>
                        {/* Floating badge */}
                        <div className="absolute -top-2 -right-4 bg-white/40 backdrop-blur-2xl border border-white/60 px-3 py-2 rounded-xl shadow-lg flex items-center gap-2">
                            <div className="size-8 rounded-lg bg-[#20c997]/10 flex items-center justify-center text-[#20c997]">
                                <span className="material-symbols-outlined text-sm">menu_book</span>
                            </div>
                            <div>
                                <p className="text-[8px] font-bold text-gray-400 uppercase leading-none mb-0.5">Progress</p>
                                <p className="text-[11px] font-bold text-[#1a1a1e]">{dashboard?.lessonsCompleted ?? 0} / {dashboard?.totalLessonsAvailable ?? 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow space-y-4">
                        <div>
                            <h2 className="text-xl font-black text-[#1a1a1e] mb-2">Overall Progress</h2>
                            <p className="text-gray-500 leading-relaxed text-[13px] max-w-sm">
                                You&apos;ve completed {dashboard?.lessonsCompleted ?? 0} lessons across {dashboard?.coursesStarted ?? 0} course{(dashboard?.coursesStarted ?? 0) !== 1 ? "s" : ""}. Keep pushing forward!
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 max-w-xs">
                            <div className="p-3 bg-white/50 rounded-2xl border border-white/60">
                                <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Current Streak</p>
                                <p className="text-lg font-black text-[#1a1a1e]">{dashboard?.currentStreak ?? 0} Day{(dashboard?.currentStreak ?? 0) !== 1 ? "s" : ""}</p>
                            </div>
                            <div className="p-3 bg-white/50 rounded-2xl border border-white/60">
                                <p className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Quizzes Taken</p>
                                <p className="text-lg font-black text-[#1a1a1e]">{dashboard?.quizzesAttempted ?? 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weekly Activity Card */}
                <div className="md:col-span-4 bg-white/40 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 flex flex-col justify-between h-[300px] hover:bg-white/60 hover:shadow-xl transition-all duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-sm">Weekly Activity</h3>
                        <span className="text-[10px] font-bold text-gray-400">
                            {dashboard?.weeklyActivity.reduce((s, d) => s + d.completions, 0) ?? 0} completions
                        </span>
                    </div>
                    <div className="flex items-end justify-between px-2 h-36 mb-4">
                        {dashboard?.weeklyActivity.map((item, index) => (
                            <div key={index} className="flex flex-col items-center gap-2 w-6">
                                <span className="text-[9px] font-bold text-[#1a1a1e] mb-1">{item.completions}</span>
                                <div className="w-2 bg-gray-100/50 rounded-full h-28 relative overflow-hidden">
                                    <div
                                        className="absolute bottom-0 w-full rounded-full transition-all duration-700"
                                        style={{
                                            height: `${maxCompletions > 0 ? (item.completions / maxCompletions) * 100 : 0}%`,
                                            background: "linear-gradient(to top, #20c997, #8b5cf6)",
                                        }}
                                    ></div>
                                </div>
                                <span className="text-[9px] font-bold text-gray-400">{dayLabel(item.date)}</span>
                            </div>
                        ))}
                    </div>
                    {trends?.mostActiveDayOfWeek && (
                        <p className="text-[10px] text-gray-400 text-center font-medium italic">
                            Most active on {trends.mostActiveDayOfWeek.day}s ({trends.mostActiveDayOfWeek.averageCompletions} avg)
                        </p>
                    )}
                </div>

                {/* AI Insights Card */}
                <div className="md:col-span-5 relative overflow-hidden bg-white/50 backdrop-blur-2xl border border-white/60 rounded-3xl p-8 flex flex-col gap-4 min-h-[220px]" style={{ boxShadow: "0 0 30px rgba(32, 201, 151, 0.08)" }}>
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-[#20c997]/10 flex items-center justify-center text-[#20c997] relative shrink-0">
                            <span className="material-symbols-outlined text-xl">psychology</span>
                            <div className="absolute -top-1 -right-1 size-2 bg-[#20c997] rounded-full animate-pulse border-2 border-white"></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm leading-none">Learning Insights</h3>
                            <p className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-widest font-bold">Personalized Analysis</p>
                        </div>
                    </div>
                    <div className="space-y-3 flex-grow overflow-y-auto">
                        {insights.map((insight, i) => (
                            <div key={i} className={`p-3 rounded-2xl border flex items-start gap-3 ${insightColor(insight.type)}`}>
                                <span className="material-symbols-outlined text-lg mt-0.5">{insightIcon(insight.type)}</span>
                                <p className="text-xs font-medium text-[#1a1a1e] leading-relaxed">{insight.message}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trends Card */}
                <div className="md:col-span-4 bg-white/40 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 flex flex-col justify-between min-h-[220px] hover:bg-white/60 hover:shadow-xl transition-all duration-500">
                    <div className="w-full flex justify-between items-center mb-4">
                        <h3 className="font-bold text-sm">Growth Trends</h3>
                        {trends && (
                            <span className={`flex items-center gap-1 text-[10px] font-bold ${trendColor(trends.weeklyProgressGrowth.trend)}`}>
                                <span className="material-symbols-outlined text-sm">{trendIcon(trends.weeklyProgressGrowth.trend)}</span>
                                {trends.weeklyProgressGrowth.growthPercentage >= 0 ? "+" : ""}{trends.weeklyProgressGrowth.growthPercentage}%
                            </span>
                        )}
                    </div>
                    <div className="space-y-4">
                        {/* Weekly comparison */}
                        <div className="flex items-center gap-4">
                            <div className="flex-1 p-3 bg-white/50 rounded-2xl border border-white/60 text-center">
                                <p className="text-[8px] font-bold text-gray-400 uppercase">This Week</p>
                                <p className="text-xl font-black text-[#1a1a1e]">{trends?.weeklyProgressGrowth.currentWeek ?? 0}</p>
                            </div>
                            <span className="material-symbols-outlined text-gray-300 text-sm">compare_arrows</span>
                            <div className="flex-1 p-3 bg-white/50 rounded-2xl border border-white/60 text-center">
                                <p className="text-[8px] font-bold text-gray-400 uppercase">Last Week</p>
                                <p className="text-xl font-black text-gray-400">{trends?.weeklyProgressGrowth.previousWeek ?? 0}</p>
                            </div>
                        </div>
                        {/* Quiz score trend */}
                        <div className="p-3 bg-white/50 rounded-2xl border border-white/60">
                            <div className="flex items-center justify-between">
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Quiz Trend</p>
                                {trends?.quizScoreTrend && (
                                    <span className={`flex items-center gap-1 text-[9px] font-bold ${trendColor(trends.quizScoreTrend.trend)}`}>
                                        {trends.quizScoreTrend.trend === "insufficient_data" ? "No data yet" : (
                                            <>
                                                <span className="material-symbols-outlined text-[14px]">{trendIcon(trends.quizScoreTrend.trend)}</span>
                                                {trends.quizScoreTrend.improvementPercentage !== null && (
                                                    <>{trends.quizScoreTrend.improvementPercentage >= 0 ? "+" : ""}{trends.quizScoreTrend.improvementPercentage}%</>
                                                )}
                                            </>
                                        )}
                                    </span>
                                )}
                            </div>
                            {trends && trends.quizScoreTrend.recentAverage !== null && (
                                <p className="text-lg font-black text-[#1a1a1e] mt-1">{trends.quizScoreTrend.recentAverage}%<span className="text-xs text-gray-400 font-medium ml-1">avg</span></p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Average Quiz Score Card */}
                <div className="md:col-span-3 bg-white/40 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 flex flex-col justify-between min-h-[220px] hover:bg-white/60 hover:shadow-xl transition-all duration-500">
                    <div className="flex flex-col gap-0.5">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Average Score</p>
                        <h3 className="text-2xl font-black text-[#1a1a1e]">{dashboard?.averageQuizScore ?? 0}%</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                            <span className="text-gray-400 uppercase">Confidence</span>
                            <span className={`${(dashboard?.averageQuizScore ?? 0) >= 70 ? "text-[#20c997]" : (dashboard?.averageQuizScore ?? 0) >= 50 ? "text-yellow-500" : "text-red-400"}`}>
                                {(dashboard?.averageQuizScore ?? 0) >= 70 ? "High" : (dashboard?.averageQuizScore ?? 0) >= 50 ? "Medium" : "Low"}
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#20c997] rounded-full transition-all duration-700" style={{ width: `${dashboard?.averageQuizScore ?? 0}%` }}></div>
                        </div>
                        {/* Recent quiz attempts */}
                        {dashboard?.recentActivity.recentQuizAttempts && dashboard.recentActivity.recentQuizAttempts.length > 0 && (
                            <div className="flex gap-2 pt-1">
                                <div className="flex -space-x-1">
                                    {dashboard.recentActivity.recentQuizAttempts.slice(0, 3).map((q, i) => (
                                        <div key={i} className={`size-5 rounded-full border border-white flex items-center justify-center text-[7px] font-bold ${q.percentage >= 70 ? "bg-teal-100 text-teal-600" : q.percentage >= 50 ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-600"}`}>
                                            {Math.round(q.percentage)}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[9px] text-gray-400 font-bold self-center">Last {dashboard.recentActivity.recentQuizAttempts.length} quizzes</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="md:col-span-12 bg-white/40 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 hover:bg-white/60 hover:shadow-xl transition-all duration-500">
                    <h3 className="font-bold text-sm mb-5">Recent Activity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Recent Lessons */}
                        <div className="space-y-3">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Lessons Completed</p>
                            {dashboard?.recentActivity.recentLessons.map((lesson, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 bg-white/50 rounded-2xl border border-white/60">
                                    <div className="size-9 rounded-xl bg-[#20c997]/10 flex items-center justify-center text-[#20c997]">
                                        <span className="material-symbols-outlined text-lg">check_circle</span>
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm font-bold text-[#1a1a1e] truncate">{lesson.lessonTitle}</p>
                                        <p className="text-[10px] text-gray-400 font-medium">{lesson.courseTitle}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap">
                                        {new Date(lesson.completedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                            {(!dashboard?.recentActivity.recentLessons || dashboard.recentActivity.recentLessons.length === 0) && (
                                <p className="text-sm text-gray-400 italic py-4">No lessons completed yet</p>
                            )}
                        </div>
                        {/* Recent Quiz Attempts */}
                        <div className="space-y-3">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Quiz Attempts</p>
                            {dashboard?.recentActivity.recentQuizAttempts.map((quiz, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 bg-white/50 rounded-2xl border border-white/60">
                                    <div className={`size-9 rounded-xl flex items-center justify-center ${quiz.percentage >= 70 ? "bg-[#20c997]/10 text-[#20c997]" : "bg-orange-50 text-orange-400"}`}>
                                        <span className="material-symbols-outlined text-lg">quiz</span>
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm font-bold text-[#1a1a1e] truncate">{quiz.quizTitle}</p>
                                        <p className="text-[10px] text-gray-400 font-medium">{quiz.score}/{quiz.totalQuestions} correct</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-sm font-black ${quiz.percentage >= 70 ? "text-[#20c997]" : "text-orange-400"}`}>{quiz.percentage}%</span>
                                        <p className="text-[9px] text-gray-400 font-bold">{new Date(quiz.attemptedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                            {(!dashboard?.recentActivity.recentQuizAttempts || dashboard.recentActivity.recentQuizAttempts.length === 0) && (
                                <p className="text-sm text-gray-400 italic py-4">No quizzes attempted yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
