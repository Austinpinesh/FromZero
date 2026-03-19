"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/utils/api";


const API_URL = "http://localhost:5000/api";

interface Recommendation {
    id: number;
    title: string;
    description: string;
    topic: string;
    contentType: string;
    difficulty: string;
    matchReason: string;
}


export default function DashboardPage() {
    const router = useRouter();
    const [userName, setUserName] = useState("Learner");
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [stats, setStats] = useState({ totalCompletedLessons: 0, totalCoursesStarted: 0, lastSevenDaysCount: 0, currentStreak: 0 });
    const [weeklyData, setWeeklyData] = useState<{ day: string; minutes: number }[]>([]);
    const [weeklyTotal, setWeeklyTotal] = useState(0);
    const [skills, setSkills] = useState<{ name: string; level: number; color: string; completedLessons: number; totalLessons: number }[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [mentorQuery, setMentorQuery] = useState("");
    const [showNotifs, setShowNotifs] = useState(false);
    const [completionPct, setCompletionPct] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifs(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await fetchWithAuth(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
        } catch { }
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        router.push("/");
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchQuery.trim()) {
            router.push(`/dashboard/courses?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        // Fetch user name
        fetch(`${API_URL}/user/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setUserName(data.data.name);
                    // Show welcome popup until user sets preferences
                    const u = data.data;
                    const hasPrefs = u.learningPace || (u.interests && u.interests.length > 0) || u.preferredContentType;
                    if (!hasPrefs) {
                        setShowWelcome(true);
                    }
                }
            })
            .catch(() => { });

        // Fetch recommended courses
        fetch(`${API_URL}/courses/recommended`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setRecommendations(data.data.courses);
            })
            .catch(() => { });

        // Fetch user progress stats
        fetch(`${API_URL}/progress/stats`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setStats(data.data);
            })
            .catch(() => { });

        // Fetch overall completion % from analytics
        fetch(`${API_URL}/analytics/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setCompletionPct(data.data.overallCompletionPercentage);
            })
            .catch(() => { });

        // Fetch weekly study hours
        fetch(`${API_URL}/progress/weekly-hours`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setWeeklyData(data.data.days);
                    setWeeklyTotal(data.data.totalMinutes);
                }
            })
            .catch(() => { });

        // Fetch skills by topic
        fetch(`${API_URL}/progress/skills`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setSkills(data.data.skills);
            })
            .catch(() => { });
    }, []);

    const firstName = userName.split(" ")[0];

    // Topic-based icon map
    const topicIcon: Record<string, string> = {
        math: "calculate",
        science: "science",
        programming: "code",
        ai: "smart_toy",
        onboarding: "school",
        productivity: "target",
        general: "auto_stories",
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-10">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#1e293b]">Welcome back, {firstName} 👋</h1>
                    <p className="text-[13px] text-slate-500 font-medium">
                        {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white/60 border border-white/80 rounded-full px-5 py-2.5 w-80 shadow-sm">
                        <span className="material-symbols-outlined text-slate-400 text-xl mr-2">search</span>
                        <input
                            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400 font-medium outline-none"
                            placeholder="Search courses..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>
                    <div className="relative cursor-pointer group" ref={notifRef}>
                        <div onClick={() => setShowNotifs((prev) => !prev)}>
                            <span className="material-symbols-outlined text-slate-500 group-hover:text-[#1e293b] transition-colors">notifications</span>
                            <span className="absolute top-0 right-0 size-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </div>
                        {/* Notifications Dropdown */}
                        {showNotifs && (
                            <div className="absolute right-0 top-10 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-bold text-[#1e293b] text-sm">Notifications</h3>
                                    <span className="text-[10px] bg-[#20c997]/10 text-[#20c997] px-2 py-0.5 rounded-full font-bold">1 New</span>
                                </div>
                                <div className="p-2 space-y-1">
                                    <div className="flex gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                                        <div className="size-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-indigo-500 text-sm">auto_awesome</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[#1e293b]">Welcome to FromZero!</p>
                                            <p className="text-[10px] text-gray-500 mt-0.5">Your AI mentor is ready to assist you.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-2 px-4 text-center">
                                    <button className="text-[10px] font-bold text-[#20c997] hover:underline" onClick={() => setShowNotifs(false)}>Mark all as read</button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="relative flex items-center gap-4 pl-8 border-l border-slate-200/50" ref={dropdownRef}>
                        <div className="text-right">
                            <p className="text-sm font-bold text-[#1e293b]">{userName}</p>
                            <p className="text-[10px] font-bold text-[#20c997] tracking-widest uppercase opacity-80">Member</p>
                        </div>
                        <button
                            onClick={() => setDropdownOpen((prev) => !prev)}
                            className="size-11 rounded-2xl bg-gradient-to-br from-[#20c997] to-indigo-500 ring-4 ring-white shadow-md flex items-center justify-center text-white font-bold cursor-pointer hover:scale-105 transition-transform"
                        >
                            {firstName.charAt(0).toUpperCase()}
                        </button>

                        {/* Dropdown */}
                        {dropdownOpen && (
                            <div className="absolute right-0 top-14 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                <Link
                                    href="/dashboard/profile"
                                    onClick={() => setDropdownOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg text-[#20c997]">account_circle</span>
                                    Profile
                                </Link>
                                <div className="mx-3 border-t border-gray-100"></div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full"
                                >
                                    <span className="material-symbols-outlined text-lg">logout</span>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Hero Card */}
                <div
                    className="lg:col-span-2 rounded-[24px] p-10 text-white relative overflow-hidden shadow-2xl flex items-center"
                    style={{
                        background: "radial-gradient(at 0% 0%, #20c997 0%, transparent 50%), radial-gradient(at 100% 0%, #6366f1 0%, transparent 50%), radial-gradient(at 100% 100%, #18a077 0%, transparent 50%), radial-gradient(at 0% 100%, #4f46e5 0%, transparent 50%), #20c997",
                    }}
                >
                    <div className="absolute inset-0 bg-black/5"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full gap-10">
                        <div className="space-y-5">
                            <span className="bg-white/15 backdrop-blur-lg border border-white/20 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest">
                                Learning Path
                            </span>
                            <h2 className="text-4xl font-black leading-[1.1] tracking-tight">
                                Your learning journey<br />is skyrocketing.
                            </h2>
                            <div className="flex items-center gap-4 pt-2">
                                <Link
                                    href="/lesson"
                                    className="bg-white text-indigo-600 font-bold px-8 py-3.5 rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 active:scale-95 text-sm"
                                >
                                    Resume Lesson
                                </Link>
                                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/20">
                                    <span className="text-xl">🔥</span>
                                    <span className="font-bold text-sm">Keep Going!</span>
                                </div>
                            </div>
                        </div>
                        {/* Progress Ring */}
                        <div className="relative flex items-center justify-center" style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.4))" }}>
                            <svg className="size-44 drop-shadow-2xl">
                                <circle className="text-white/10" cx="88" cy="88" fill="transparent" r="76" stroke="currentColor" strokeWidth="14"></circle>
                                <circle
                                    className="text-white"
                                    cx="88" cy="88" fill="transparent" r="76"
                                    stroke="currentColor" strokeWidth="14"
                                    strokeDasharray="478"
                                    strokeDashoffset={478 - (completionPct / 100) * 478}
                                    strokeLinecap="round"
                                    style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 1s ease-out" }}
                                ></circle>
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-4xl font-black">{completionPct}%</span>
                                <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-80 mt-1">Overall</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Mentor Card */}
                <div className="bg-white/60 backdrop-blur-[20px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-[24px] p-8 flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="size-12 rounded-2xl bg-[#20c997] flex items-center justify-center text-white shadow-xl shadow-[#20c997]/20">
                            <span className="material-symbols-outlined text-2xl">smart_toy</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-[#1e293b]">AI Mentor</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Syncing Progress</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50/50 backdrop-blur-sm rounded-3xl p-5 mb-8 text-[13px] text-slate-600 leading-relaxed font-medium border border-white/50">
                        &quot;Welcome back, {firstName}! Set your learning preferences in your <Link href="/dashboard/profile" className="text-indigo-600 font-bold hover:underline">profile</Link> to get personalized recommendations.&quot;
                    </div>
                    <div className="mt-auto relative">
                        <input
                            className="w-full bg-white/80 border border-white rounded-2xl py-4 pl-5 pr-12 text-sm focus:ring-[#20c997]/20 focus:border-[#20c997] shadow-sm placeholder:text-slate-400 outline-none"
                            placeholder="Ask me anything..."
                            type="text"
                            value={mentorQuery}
                            onChange={(e) => setMentorQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && mentorQuery.trim()) {
                                    router.push(`/dashboard/ai-tutor?message=${encodeURIComponent(mentorQuery.trim())}`);
                                }
                            }}
                        />
                        <button
                            onClick={() => {
                                if (mentorQuery.trim()) {
                                    router.push(`/dashboard/ai-tutor?message=${encodeURIComponent(mentorQuery.trim())}`);
                                }
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#20c997] hover:scale-110 transition-transform"
                        >
                            <span className="material-symbols-outlined">auto_awesome</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Recommendations from API */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-extrabold text-[#1e293b]">Recommended for You</h3>
                    <Link href="/dashboard/profile" className="text-sm font-bold text-[#20c997] flex items-center gap-1 group">
                        Set Preferences
                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recommendations.map((rec) => (
                        <Link key={rec.id} href={`/dashboard/courses/${rec.id}`} className="bg-white/60 backdrop-blur-[20px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-[24px] p-6 group hover:shadow-2xl hover:shadow-[#20c997]/5 transition-all duration-500 block">
                            <div className="relative h-36 rounded-3xl overflow-hidden mb-6 bg-gradient-to-br from-[#20c997]/10 to-[#6366f1]/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-6xl text-[#20c997]/30">
                                    {topicIcon[rec.topic] || "auto_stories"}
                                </span>
                                <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md border border-white/30 px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-[#1a1a1e] shadow-lg">
                                    {rec.difficulty}
                                </div>
                                <div className="absolute top-4 right-4 bg-[#20c997]/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-white shadow-lg capitalize">
                                    {rec.contentType}
                                </div>
                            </div>
                            <h4 className="font-extrabold text-lg text-[#1e293b] mb-2 leading-tight group-hover:text-[#20c997] transition-colors">{rec.title}</h4>
                            <p className="text-[13px] text-slate-500 mb-4 font-medium">{rec.matchReason}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-400 capitalize flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">topic</span>
                                    {rec.topic}
                                </span>
                                <span className="bg-[#1e293b] text-white text-[11px] font-black uppercase tracking-wider px-6 py-3 rounded-2xl group-hover:bg-[#20c997] group-hover:shadow-lg group-hover:shadow-[#20c997]/20 transition-all">
                                    View Course
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Progress Stats */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Lessons Done", value: stats.totalCompletedLessons, icon: "task_alt", color: "#20c997" },
                    { label: "Courses Started", value: stats.totalCoursesStarted, icon: "auto_stories", color: "#6366f1" },
                    { label: "This Week", value: stats.lastSevenDaysCount, icon: "date_range", color: "#fb923c" },
                    { label: "Day Streak", value: stats.currentStreak, icon: "local_fire_department", color: "#f43f5e" },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white/60 backdrop-blur-[20px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-[24px] p-6 flex items-center gap-4"
                    >
                        <div
                            className="size-12 rounded-2xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${stat.color}15` }}
                        >
                            <span className="material-symbols-outlined text-2xl" style={{ color: stat.color }}>{stat.icon}</span>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-[#1e293b]">{stat.value}</p>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* Weekly Hours & Skills */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
                {/* Weekly Study Hours */}
                <div className="bg-white/60 backdrop-blur-[20px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-[24px] p-8">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-lg font-extrabold text-[#1e293b]">Weekly Study Hours</h3>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                                {Math.floor(weeklyTotal / 60)}h {weeklyTotal % 60}m this week
                            </p>
                        </div>
                    </div>
                    <div className="flex items-end justify-between gap-6 h-48">
                        {weeklyData.map((d) => {
                            const maxMins = Math.max(...weeklyData.map(x => x.minutes), 1);
                            const pct = Math.max((d.minutes / maxMins) * 100, 4); // min 4% so bar is visible
                            return (
                                <div key={d.day} className="flex flex-col items-center gap-4 flex-1">
                                    <div className="w-full bg-slate-200/50 rounded-full relative overflow-hidden h-32 flex items-end">
                                        <div
                                            className="w-full rounded-full bg-gradient-to-t from-[#20c997] to-emerald-400 transition-all duration-1000"
                                            style={{ height: d.minutes > 0 ? `${pct}%` : "0%" }}
                                        ></div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400">{d.day}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Skills Mastered */}
                <div className="bg-white/60 backdrop-blur-[20px] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-[24px] p-8">
                    <h3 className="text-lg font-extrabold text-[#1e293b] mb-8">Skills Mastered</h3>
                    {skills.length === 0 ? (
                        <div className="text-center py-8">
                            <span className="material-symbols-outlined text-4xl text-gray-200 mb-2">workspace_premium</span>
                            <p className="text-sm text-gray-400 font-medium">Complete lessons to build your skills</p>
                        </div>
                    ) : (
                        <div className="space-y-7">
                            {skills.map((skill, index) => (
                                <div key={index} className="space-y-2.5">
                                    <div className="flex justify-between text-[13px] font-bold text-[#1e293b]">
                                        <span>{skill.name}</span>
                                        <span style={{ color: skill.color }}>{skill.level}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${skill.level}%`,
                                                backgroundColor: skill.color,
                                                boxShadow: `0 0 8px ${skill.color}66`,
                                            }}
                                        ></div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold">{skill.completedLessons}/{skill.totalLessons} lessons</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* First-Login Welcome Popup */}
            {showWelcome && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg mx-4 bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                        {/* Gradient Header */}
                        <div
                            className="px-8 pt-10 pb-8 text-white text-center"
                            style={{
                                background: "radial-gradient(at 0% 0%, #20c997 0%, transparent 50%), radial-gradient(at 100% 0%, #6366f1 0%, transparent 50%), radial-gradient(at 50% 100%, #18a077 0%, transparent 60%), #20c997",
                            }}
                        >
                            <div className="text-5xl mb-4">🎉</div>
                            <h2 className="text-3xl font-black tracking-tight">Welcome to FromZero!</h2>
                            <p className="mt-2 text-white/80 text-sm font-medium">We&apos;re thrilled to have you, {firstName}.</p>
                        </div>

                        {/* Body */}
                        <div className="px-8 py-8 space-y-5">
                            <p className="text-gray-600 text-sm leading-relaxed text-center">
                                Here&apos;s how to get the most out of your learning journey:
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                                    <div className="size-10 rounded-xl bg-[#20c997]/10 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[#20c997]">tune</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#1a1a1e] text-sm">Set Your Preferences</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">Choose your pace, interests, and content type for personalized recommendations.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                                    <div className="size-10 rounded-xl bg-[#6366f1]/10 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[#6366f1]">auto_stories</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#1a1a1e] text-sm">Explore Lessons</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">Start with recommended courses tailored to your learning goals.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                                    <div className="size-10 rounded-xl bg-[#06b6d4]/10 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[#06b6d4]">smart_toy</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#1a1a1e] text-sm">Meet Your AI Mentor</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">Get instant help and knowledge gap analysis as you learn.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action */}
                            <div className="pt-2">
                                <Link
                                    href="/dashboard/profile"
                                    onClick={() => setShowWelcome(false)}
                                    className="block w-full py-3.5 rounded-2xl bg-[#20c997] text-white text-sm font-bold text-center hover:bg-[#18a077] shadow-lg shadow-[#20c997]/20 transition-all"
                                >
                                    Set Preferences →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
