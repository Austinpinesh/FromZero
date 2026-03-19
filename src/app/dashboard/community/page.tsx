"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/utils/api";


const API_URL = "http://localhost:5000/api";

interface Post {
    postId: number;
    title: string;
    tags: string[];
    isAnswered: boolean;
    authorName: string;
    answerCount: number;
    createdAt: string;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export default function DashboardCommunityPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeTag, setActiveTag] = useState("");
    const [filter, setFilter] = useState<"latest" | "answered" | "unanswered">("latest");
    const [page, setPage] = useState(1);

    // Ask Question modal state
    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newTags, setNewTags] = useState("");
    const [posting, setPosting] = useState(false);
    const [postError, setPostError] = useState("");

    const allTags = ["math", "science", "programming", "ai", "design", "business"];

    // Fetch posts
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.set("page", String(page));
                params.set("limit", "10");
                if (search) params.set("search", search);
                if (activeTag) params.set("tag", activeTag);
                if (filter === "answered") params.set("isAnswered", "true");
                if (filter === "unanswered") params.set("isAnswered", "false");

                const res = await fetchWithAuth(`${API_URL}/community/posts?${params.toString()}`);
                const data = await res.json();
                if (data.success) {
                    setPosts(data.data.posts);
                    setPagination(data.data.pagination);
                }
            } catch {
                console.error("Failed to fetch posts");
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [page, search, activeTag, filter]);

    // Time ago helper
    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    // Submit new question
    const handleAskQuestion = async () => {
        setPosting(true);
        setPostError("");
        try {
            const token = localStorage.getItem("accessToken");
            const body: Record<string, unknown> = {
                title: newTitle,
                description: newDescription,
            };
            const tagsArr = newTags.split(",").map((t) => t.trim()).filter(Boolean);
            if (tagsArr.length > 0) body.tags = tagsArr;

            const res = await fetchWithAuth(`${API_URL}/community/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.success) {
                setShowModal(false);
                setNewTitle("");
                setNewDescription("");
                setNewTags("");
                setPage(1);
                // Re-trigger fetch
                setFilter((f) => f);
                window.location.reload();
            } else {
                setPostError(data.errors?.map((e: { message: string }) => e.message).join(", ") || data.message);
            }
        } catch {
            setPostError("Failed to connect to server.");
        } finally {
            setPosting(false);
        }
    };

    // Search debounce
    const [searchInput, setSearchInput] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <header className="sticky top-0 bg-[#F8FAFC]/80 backdrop-blur-md z-40 pb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-[#1a1a1e] tracking-tight">Community Q&A</h1>
                        <p className="text-gray-400 text-sm font-medium mt-1">
                            {pagination ? `${pagination.total} questions` : "Loading..."}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-[#20c997] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#18a077] transition-all shadow-lg shadow-[#20c997]/20 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-xl">add_comment</span>
                        Ask a Question
                    </button>
                </div>
            </header>

            {/* Search */}
            <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">search</span>
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search questions..."
                    className="w-full bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-[#1a1a1e] outline-none focus:ring-2 focus:ring-[#20c997]/20 transition-all"
                />
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">Topics:</span>
                    <div
                        onClick={() => { setActiveTag(""); setPage(1); }}
                        className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${!activeTag ? "border-[#20c997]/30 text-[#20c997] bg-[#20c997]/5" : "border-gray-100 bg-white text-gray-500 hover:border-[#20c997]/50 hover:text-[#20c997]"}`}
                    >
                        All
                    </div>
                    {allTags.map((tag) => (
                        <div
                            key={tag}
                            onClick={() => { setActiveTag(activeTag === tag ? "" : tag); setPage(1); }}
                            className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap capitalize ${activeTag === tag ? "border-[#20c997]/30 text-[#20c997] bg-[#20c997]/5" : "border-gray-100 bg-white text-gray-500 hover:border-[#20c997]/50 hover:text-[#20c997]"}`}
                        >
                            {tag}
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2 bg-gray-200/40 p-1 rounded-full w-fit">
                    {(["latest", "answered", "unanswered"] as const).map((f) => (
                        <div
                            key={f}
                            onClick={() => { setFilter(f); setPage(1); }}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize cursor-pointer transition-colors ${filter === f ? "text-[#1a1a1e] bg-white shadow-sm border border-gray-100" : "text-gray-400 hover:text-[#1a1a1e]"}`}
                        >
                            {f}
                        </div>
                    ))}
                </div>
            </div>

            {/* Posts List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <span className="animate-spin material-symbols-outlined text-[#20c997] text-4xl">progress_activity</span>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="material-symbols-outlined text-5xl text-gray-200 mb-3">forum</span>
                        <p className="text-gray-400 font-medium">No questions found. Be the first to ask!</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <Link key={post.postId} href={`/dashboard/community/${post.postId}`}>
                            <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[1.5rem] p-6 hover:shadow-xl hover:shadow-[#20c997]/5 transition-all duration-500 cursor-pointer mb-4">
                                <div className="flex items-start gap-4">
                                    <div className="size-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                        {post.authorName[0]}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold">{post.authorName}</span>
                                            <span className="text-[10px] text-gray-400">• {timeAgo(post.createdAt)}</span>
                                            {post.isAnswered && (
                                                <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                                    Answered
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-[#1a1a1e] mb-2 hover:text-[#20c997] transition-colors truncate">{post.title}</h3>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {post.tags.map((tag, i) => (
                                                <span key={i} className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-[10px] font-bold capitalize">{tag}</span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1 text-gray-400">
                                                <span className="material-symbols-outlined text-lg">forum</span>
                                                <span className="text-xs font-bold">{post.answerCount} answers</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pb-8">
                    <button
                        disabled={!pagination.hasPrevPage}
                        onClick={() => setPage(page - 1)}
                        className="px-4 py-2 rounded-xl text-sm font-bold bg-white border border-gray-100 text-gray-500 hover:border-[#20c997] hover:text-[#20c997] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        ← Previous
                    </button>
                    <span className="text-sm font-bold text-gray-400">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        disabled={!pagination.hasNextPage}
                        onClick={() => setPage(page + 1)}
                        className="px-4 py-2 rounded-xl text-sm font-bold bg-white border border-gray-100 text-gray-500 hover:border-[#20c997] hover:text-[#20c997] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        Next →
                    </button>
                </div>
            )}

            {/* Ask Question Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg mx-4 bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#20c997] to-[#06b6d4] px-8 py-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-white">Ask a Question</h2>
                                <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>
                        {/* Form */}
                        <div className="p-8 space-y-5">
                            <div>
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Title</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="What's your question? (min 10 chars)"
                                    className="w-full mt-2 bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#20c997]/20"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
                                <textarea
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="Add more details... (min 20 chars)"
                                    rows={4}
                                    className="w-full mt-2 bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#20c997]/20 resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Tags (comma separated, max 5)</label>
                                <input
                                    type="text"
                                    value={newTags}
                                    onChange={(e) => setNewTags(e.target.value)}
                                    placeholder="e.g. math, algebra"
                                    className="w-full mt-2 bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#20c997]/20"
                                />
                            </div>
                            {postError && (
                                <p className="text-red-500 text-sm font-medium">{postError}</p>
                            )}
                            <button
                                onClick={handleAskQuestion}
                                disabled={posting}
                                className="w-full py-3.5 rounded-2xl bg-[#20c997] text-white text-sm font-bold hover:bg-[#18a077] shadow-lg shadow-[#20c997]/20 transition-all disabled:opacity-50"
                            >
                                {posting ? "Posting..." : "Post Question"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
