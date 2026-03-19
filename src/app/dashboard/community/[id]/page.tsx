"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/utils/api";


const API_URL = "http://localhost:5000/api";

interface Comment {
    commentId: number;
    content: string;
    authorName: string;
    createdAt: string;
}

interface Answer {
    answerId: number;
    content: string;
    isAISuggested: boolean;
    authorName: string;
    voteCount: number;
    hasVoted: boolean;
    comments: Comment[];
    createdAt: string;
}

interface PostDetail {
    postId: number;
    title: string;
    description: string;
    tags: string[];
    isAnswered: boolean;
    authorName: string;
    answers: Answer[];
}

export default function CommunityPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [post, setPost] = useState<PostDetail | null>(null);
    const [loading, setLoading] = useState(true);

    // Answer form
    const [answerContent, setAnswerContent] = useState("");
    const [submittingAnswer, setSubmittingAnswer] = useState(false);

    // Comment form
    const [commentingOnId, setCommentingOnId] = useState<number | null>(null);
    const [commentContent, setCommentContent] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

    // Message
    const [message, setMessage] = useState("");

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    const fetchPost = async () => {
        try {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;

            const res = await fetchWithAuth(`${API_URL}/community/posts/${id}`, { headers });
            const data = await res.json();
            if (data.success) setPost(data.data);
        } catch {
            console.error("Failed to fetch post");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPost();
    }, [id]);

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    // Toggle upvote
    const handleUpvote = async (answerId: number) => {
        if (!token) return;
        try {
            const res = await fetchWithAuth(`${API_URL}/community/answers/${answerId}/upvote`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success && post) {
                setPost({
                    ...post,
                    answers: post.answers.map((a) =>
                        a.answerId === answerId
                            ? { ...a, voteCount: data.data.voteCount, hasVoted: data.data.action === "upvoted" }
                            : a
                    ),
                });
            }
        } catch {
            console.error("Upvote failed");
        }
    };

    // Submit answer
    const handleSubmitAnswer = async () => {
        if (!token || answerContent.length < 20) return;
        setSubmittingAnswer(true);
        try {
            const res = await fetchWithAuth(`${API_URL}/community/answers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ postId: parseInt(id), content: answerContent }),
            });
            const data = await res.json();
            if (data.success) {
                setAnswerContent("");
                setMessage("Answer posted!");
                setTimeout(() => setMessage(""), 3000);
                fetchPost(); // Refresh
            }
        } catch {
            console.error("Failed to post answer");
        } finally {
            setSubmittingAnswer(false);
        }
    };

    // Submit comment
    const handleSubmitComment = async (answerId: number) => {
        if (!token || commentContent.length < 5) return;
        setSubmittingComment(true);
        try {
            const res = await fetchWithAuth(`${API_URL}/community/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ answerId, content: commentContent }),
            });
            const data = await res.json();
            if (data.success) {
                setCommentContent("");
                setCommentingOnId(null);
                fetchPost(); // Refresh
            }
        } catch {
            console.error("Failed to post comment");
        } finally {
            setSubmittingComment(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <span className="animate-spin material-symbols-outlined text-[#20c997] text-4xl">progress_activity</span>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="text-center py-20">
                <span className="material-symbols-outlined text-5xl text-gray-200 mb-3">error</span>
                <p className="text-gray-400 font-medium">Post not found.</p>
                <Link href="/dashboard/community" className="text-[#20c997] font-bold text-sm mt-4 inline-block hover:underline">
                    ← Back to Community
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Back */}
            <Link href="/dashboard/community" className="inline-flex items-center gap-1 text-gray-400 hover:text-[#20c997] text-sm font-bold transition-colors">
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Back to Community
            </Link>

            {/* Post */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[1.5rem] p-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                        {post.authorName[0]}
                    </div>
                    <div>
                        <p className="text-sm font-bold">{post.authorName}</p>
                    </div>
                    {post.isAnswered && (
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ml-auto">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Answered
                        </span>
                    )}
                </div>
                <h1 className="text-2xl font-black text-[#1a1a1e] mb-3">{post.title}</h1>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{post.description}</p>
                <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, i) => (
                        <span key={i} className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-[10px] font-bold capitalize">{tag}</span>
                    ))}
                </div>
            </div>

            {/* Answers Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-[#1a1a1e]">
                    {post.answers.length} {post.answers.length === 1 ? "Answer" : "Answers"}
                </h2>
            </div>

            {/* Success Message */}
            {message && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                    {message}
                </div>
            )}

            {/* Answers List */}
            <div className="space-y-6">
                {post.answers.map((answer) => (
                    <div
                        key={answer.answerId}
                        className={`rounded-[1.5rem] p-6 ${answer.isAISuggested
                            ? "bg-gradient-to-r from-[#20c997]/5 to-[#06b6d4]/5 border-2 border-[#20c997]/20"
                            : "bg-white/70 backdrop-blur-xl border border-white/80"
                            }`}
                    >
                        {/* Answer Header */}
                        <div className="flex items-center gap-3 mb-4">
                            {answer.isAISuggested ? (
                                <>
                                    <div className="size-9 rounded-xl bg-gradient-to-br from-[#20c997] to-[#06b6d4] flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white text-lg">smart_toy</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-[#20c997]">FromZero AI</span>
                                        <span className="bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                                            AI Suggested
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="size-9 rounded-xl bg-gradient-to-br from-violet-400 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                                        {answer.authorName[0]}
                                    </div>
                                    <div>
                                        <span className="text-sm font-bold">{answer.authorName}</span>
                                        <span className="text-[10px] text-gray-400 ml-2">• {timeAgo(answer.createdAt)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Answer Content */}
                        <p className="text-gray-700 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{answer.content}</p>

                        {/* Actions */}
                        <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                            <button
                                onClick={() => handleUpvote(answer.answerId)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${answer.hasVoted
                                    ? "bg-[#20c997]/10 text-[#20c997]"
                                    : "text-gray-400 hover:text-[#20c997] hover:bg-gray-50"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-lg">thumb_up</span>
                                {answer.voteCount}
                            </button>
                            <button
                                onClick={() => {
                                    setCommentingOnId(commentingOnId === answer.answerId ? null : answer.answerId);
                                    setCommentContent("");
                                }}
                                className="flex items-center gap-1.5 text-gray-400 hover:text-[#20c997] text-xs font-bold transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">chat_bubble</span>
                                {answer.comments.length}
                            </button>
                        </div>

                        {/* Comments */}
                        {answer.comments.length > 0 && (
                            <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-3">
                                {answer.comments.map((c) => (
                                    <div key={c.commentId} className="bg-gray-50/50 rounded-xl p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold">{c.authorName}</span>
                                            <span className="text-[10px] text-gray-400">{timeAgo(c.createdAt)}</span>
                                        </div>
                                        <p className="text-xs text-gray-600">{c.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Comment Input */}
                        {commentingOnId === answer.answerId && (
                            <div className="mt-4 flex items-center gap-2">
                                <input
                                    type="text"
                                    value={commentContent}
                                    onChange={(e) => setCommentContent(e.target.value)}
                                    placeholder="Write a comment... (min 5 chars)"
                                    className="flex-grow bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-[#20c997]/20"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSubmitComment(answer.answerId);
                                    }}
                                />
                                <button
                                    onClick={() => handleSubmitComment(answer.answerId)}
                                    disabled={submittingComment || commentContent.length < 5}
                                    className="px-4 py-2.5 bg-[#1a1a1e] text-white rounded-xl text-sm font-bold hover:bg-[#20c997] transition-colors disabled:opacity-30"
                                >
                                    <span className="material-symbols-outlined text-sm">send</span>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Post Your Answer */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-[1.5rem] p-8">
                <h3 className="text-lg font-black text-[#1a1a1e] mb-4">Your Answer</h3>
                <textarea
                    value={answerContent}
                    onChange={(e) => setAnswerContent(e.target.value)}
                    placeholder="Share your knowledge... (min 20 chars)"
                    rows={5}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#20c997]/20 resize-none mb-4"
                />
                <button
                    onClick={handleSubmitAnswer}
                    disabled={submittingAnswer || answerContent.length < 20}
                    className="px-6 py-3 bg-[#20c997] text-white rounded-2xl font-bold hover:bg-[#18a077] shadow-lg shadow-[#20c997]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {submittingAnswer ? "Posting..." : "Post Answer"}
                </button>
            </div>
        </div>
    );
}
