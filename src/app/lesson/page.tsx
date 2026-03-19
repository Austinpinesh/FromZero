"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { fetchWithAuth } from "@/utils/api";


const API_URL = "http://localhost:5000/api";

interface LessonInfo {
    id: number;
    title: string;
    duration: string | null;
    order: number;
    youtubeUrl: string;
    isCompleted: boolean;
}

interface CourseInfo {
    id: number;
    title: string;
    order: number;
    lessonCount: number;
    completedLessons: number;
    lessons: LessonInfo[];
}

interface PathData {
    id: number;
    title: string;
    description: string;
    difficulty: string;
    totalLessons: number;
    completedLessons: number;
    progressPercent: number;
    courses: CourseInfo[];
}

interface LessonDetail {
    id: number;
    title: string;
    description: string;
    youtubeUrl: string;
    duration: string | null;
    summary: string | null;
    order: number;
    course: { id: number; title: string; topic: string; difficulty: string };
}

interface QuizOption {
    id: string;
    text: string;
}

interface QuizQuestion {
    id: number;
    questionText: string;
    options: QuizOption[];
}

interface QuizData {
    quizId: number;
    title: string;
    isAIGenerated: boolean;
    questions: QuizQuestion[];
}

interface QuizFeedback {
    questionId: number;
    questionText: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
}

interface QuizResult {
    attemptId: number;
    attemptNumber: number;
    score: number;
    totalQuestions: number;
    percentage: number;
    feedback: QuizFeedback[];
}

function getYoutubeEmbedUrl(url: string): string {
    try {
        const urlObj = new URL(url);
        let videoId = "";
        if (urlObj.hostname.includes("youtube.com")) {
            videoId = urlObj.searchParams.get("v") || "";
            if (!videoId && urlObj.pathname.includes("/embed/")) {
                videoId = urlObj.pathname.split("/embed/")[1];
            }
        } else if (urlObj.hostname === "youtu.be") {
            videoId = urlObj.pathname.slice(1);
        }
        if (videoId) return `https://www.youtube.com/embed/${videoId}?controls=0&modestbranding=1&rel=0`;
        return url;
    } catch {
        return url;
    }
}

// ─── Quiz Section Component ────────────────────────────────────────────────

function QuizSection({
    lessonId,
    token,
    onQuizCompleted,
}: {
    lessonId: number;
    token: string | null;
    onQuizCompleted: () => void;
}) {
    const [quiz, setQuiz] = useState<QuizData | null>(null);
    const [quizLoading, setQuizLoading] = useState(true);
    const [noQuiz, setNoQuiz] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<QuizResult | null>(null);
    const [showQuiz, setShowQuiz] = useState(false);

    // Fetch quiz for this lesson
    useEffect(() => {
        setQuiz(null);
        setResult(null);
        setSelectedAnswers({});
        setNoQuiz(false);
        setShowQuiz(false);
        setQuizLoading(true);

        const fetchQuiz = async () => {
            try {
                const res = await fetchWithAuth(`${API_URL}/quizzes/lesson/${lessonId}`);
                const data = await res.json();
                if (data.success) {
                    setQuiz(data.data);
                } else {
                    setNoQuiz(true);
                }
            } catch {
                setNoQuiz(true);
            } finally {
                setQuizLoading(false);
            }
        };
        fetchQuiz();
    }, [lessonId]);

    // Select an answer
    const selectAnswer = (questionId: number, optionId: string) => {
        if (result) return; // Don't allow changes after submission
        setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    };

    // Submit quiz
    const handleSubmit = async () => {
        if (!quiz || !token) return;
        setSubmitting(true);
        try {
            const answers = Object.entries(selectedAnswers).map(([qId, answer]) => ({
                questionId: parseInt(qId),
                selectedAnswer: answer,
            }));

            const res = await fetchWithAuth(`${API_URL}/quizzes/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ quizId: quiz.quizId, answers }),
            });
            const data = await res.json();
            if (data.success) {
                setResult(data.data);
                if (data.data.percentage >= 60) {
                    onQuizCompleted();
                }
            }
        } catch {
            console.error("Failed to submit quiz");
        } finally {
            setSubmitting(false);
        }
    };

    // Retry quiz
    const handleRetry = () => {
        setResult(null);
        setSelectedAnswers({});
    };

    if (quizLoading) {
        return (
            <div className="w-full bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-8 flex items-center justify-center py-12">
                <span className="animate-spin material-symbols-outlined text-[#20c997] text-2xl">progress_activity</span>
            </div>
        );
    }

    if (noQuiz) return null; // No quiz for this lesson — no gating needed

    const allAnswered = quiz ? Object.keys(selectedAnswers).length === quiz.questions.length : false;
    const passed = result ? result.percentage >= 60 : false;

    return (
        <div className="w-full">
            {/* Quiz Header — always visible */}
            <div
                onClick={() => !result && setShowQuiz(!showQuiz)}
                className={`w-full bg-gradient-to-r ${result
                    ? passed ? "from-[#20c997]/10 to-emerald-50/50 border-[#20c997]/20" : "from-orange-50/80 to-amber-50/50 border-orange-200/30"
                    : "from-violet-50/80 to-indigo-50/50 border-violet-200/20 cursor-pointer hover:from-violet-50 hover:to-indigo-50/80"
                    } backdrop-blur-xl border rounded-3xl p-6 transition-all`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`size-12 rounded-2xl flex items-center justify-center ${result
                            ? passed ? "bg-[#20c997] text-white" : "bg-orange-400 text-white"
                            : "bg-violet-500 text-white"
                            } shadow-lg`}
                        >
                            <span className="material-symbols-outlined text-2xl">
                                {result ? (passed ? "check_circle" : "refresh") : "quiz"}
                            </span>
                        </div>
                        <div>
                            <h3 className="font-bold text-base text-[#1a1a1e]">
                                {result
                                    ? passed ? "Quiz Passed! 🎉" : "Quiz Not Passed — Try Again"
                                    : quiz?.title || "Lesson Quiz"
                                }
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {result
                                    ? `Score: ${result.score}/${result.totalQuestions} (${result.percentage}%) — ${passed ? "Next lesson unlocked!" : "Need 60% to proceed"}`
                                    : `${quiz?.questions.length} questions · Complete to unlock next lesson`
                                }
                            </p>
                        </div>
                    </div>
                    {result ? (
                        !passed && (
                            <button onClick={handleRetry} className="px-5 py-2.5 bg-orange-400 text-white rounded-2xl text-xs font-bold hover:bg-orange-500 transition-all shadow-lg shadow-orange-500/20">
                                Retry Quiz
                            </button>
                        )
                    ) : (
                        <span className="material-symbols-outlined text-gray-400 text-xl transition-transform" style={{ transform: showQuiz ? "rotate(180deg)" : "none" }}>
                            expand_more
                        </span>
                    )}
                </div>

                {/* Result feedback */}
                {result && (
                    <div className="mt-6 space-y-3">
                        {result.feedback.map((fb, i) => (
                            <div key={i} className={`p-4 rounded-2xl border ${fb.isCorrect ? "bg-[#20c997]/5 border-[#20c997]/10" : "bg-red-50/50 border-red-100/30"}`}>
                                <div className="flex items-start gap-3">
                                    <span className={`material-symbols-outlined text-lg mt-0.5 ${fb.isCorrect ? "text-[#20c997]" : "text-red-400"}`}>
                                        {fb.isCorrect ? "check_circle" : "cancel"}
                                    </span>
                                    <div className="flex-grow">
                                        <p className="text-sm font-bold text-[#1a1a1e]">{fb.questionText}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className={`text-xs font-bold ${fb.isCorrect ? "text-[#20c997]" : "text-red-500"}`}>
                                                Your answer: {fb.selectedAnswer.toUpperCase()}
                                            </span>
                                            {!fb.isCorrect && (
                                                <span className="text-xs font-bold text-[#20c997]">
                                                    Correct: {fb.correctAnswer.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quiz Questions — expandable */}
            {showQuiz && !result && quiz && (
                <div className="mt-4 space-y-4 animate-in slide-in-from-top-2">
                    {quiz.questions.map((q, qIndex) => (
                        <div key={q.id} className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-6 shadow-sm">
                            <div className="flex items-start gap-4 mb-5">
                                <span className="size-8 rounded-xl bg-violet-500/10 text-violet-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                    {qIndex + 1}
                                </span>
                                <p className="text-sm font-bold text-[#1a1a1e] leading-relaxed">{q.questionText}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-12">
                                {q.options.map((opt) => {
                                    const isSelected = selectedAnswers[q.id] === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => selectAnswer(q.id, opt.id)}
                                            className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${isSelected
                                                ? "bg-violet-500/10 border-violet-300/50 shadow-sm"
                                                : "bg-white/50 border-gray-100/60 hover:bg-violet-50/50 hover:border-violet-200/30"
                                                }`}
                                        >
                                            <span className={`size-7 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 ${isSelected
                                                ? "bg-violet-500 text-white"
                                                : "bg-gray-100 text-gray-500"
                                                }`}>
                                                {opt.id.toUpperCase()}
                                            </span>
                                            <span className="text-sm font-medium text-[#1a1a1e]">{opt.text}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Submit button */}
                    <div className="flex justify-center pt-2">
                        <button
                            onClick={handleSubmit}
                            disabled={!allAnswered || submitting}
                            className="px-10 py-4 bg-violet-500 text-white rounded-2xl text-sm font-bold uppercase tracking-wider hover:bg-violet-600 transition-all shadow-xl shadow-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                        >
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>
                                    Submitting...
                                </span>
                            ) : (
                                `Submit Quiz (${Object.keys(selectedAnswers).length}/${quiz.questions.length})`
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Lesson Page ──────────────────────────────────────────────────────

function LessonContent() {
    const searchParams = useSearchParams();
    const pathId = searchParams.get("pathId");
    const lessonIdParam = searchParams.get("lessonId");

    const [pathData, setPathData] = useState<PathData | null>(null);
    const [lesson, setLesson] = useState<LessonDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentLessonId, setCurrentLessonId] = useState<number | null>(lessonIdParam ? parseInt(lessonIdParam) : null);

    // Notes
    const [noteContent, setNoteContent] = useState("");
    const [savingNote, setSavingNote] = useState(false);
    const [noteSaved, setNoteSaved] = useState(false);

    // Quiz gating
    const [quizPassed, setQuizPassed] = useState(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    // Flatten all lessons from path for navigation
    const allLessons: LessonInfo[] = pathData?.courses.flatMap((c) => c.lessons) || [];
    const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);

    // Fetch path data
    useEffect(() => {
        if (!pathId) return;
        const fetchPath = async () => {
            try {
                const headers: Record<string, string> = {};
                if (token) headers.Authorization = `Bearer ${token}`;
                const res = await fetchWithAuth(`${API_URL}/learning-paths/${pathId}`, { headers });
                const data = await res.json();
                if (data.success) {
                    setPathData(data.data);
                    if (!currentLessonId && data.data.courses.length > 0 && data.data.courses[0].lessons.length > 0) {
                        setCurrentLessonId(data.data.courses[0].lessons[0].id);
                    }
                }
            } catch {
                console.error("Failed to fetch path");
            }
        };
        fetchPath();
    }, [pathId]);

    // Fetch current lesson detail
    const fetchLesson = useCallback(async () => {
        if (!currentLessonId) return;
        setLoading(true);
        try {
            const res = await fetchWithAuth(`${API_URL}/lessons/${currentLessonId}`);
            const data = await res.json();
            if (data.success) setLesson(data.data);
        } catch {
            console.error("Failed to fetch lesson");
        } finally {
            setLoading(false);
        }
    }, [currentLessonId]);

    useEffect(() => {
        fetchLesson();
    }, [fetchLesson]);

    // Fetch note for current lesson
    useEffect(() => {
        if (!currentLessonId || !token) return;
        const fetchNote = async () => {
            try {
                const res = await fetchWithAuth(`${API_URL}/lessons/${currentLessonId}/notes`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (data.success) setNoteContent(data.data.content || "");
            } catch {
                console.error("Failed to fetch note");
            }
        };
        fetchNote();
    }, [currentLessonId, token]);

    // Save note
    const handleSaveNote = async () => {
        if (!token || !currentLessonId) return;
        setSavingNote(true);
        try {
            const res = await fetchWithAuth(`${API_URL}/lessons/${currentLessonId}/notes`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ content: noteContent }),
            });
            const data = await res.json();
            if (data.success) {
                setNoteSaved(true);
                setTimeout(() => setNoteSaved(false), 2000);
            }
        } catch {
            console.error("Failed to save note");
        } finally {
            setSavingNote(false);
        }
    };

    // Mark lesson as complete
    const handleMarkComplete = async () => {
        if (!token || !currentLessonId) return;
        try {
            await fetchWithAuth(`${API_URL}/progress/complete`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ lessonId: currentLessonId }),
            });
            // Refresh path data for updated progress
            if (pathId) {
                const headers: Record<string, string> = {};
                if (token) headers.Authorization = `Bearer ${token}`;
                const res = await fetchWithAuth(`${API_URL}/learning-paths/${pathId}`, { headers });
                const data = await res.json();
                if (data.success) setPathData(data.data);
            }
        } catch {
            console.error("Failed to mark complete");
        }
    };

    // Check if a lesson is unlocked:
    //  - First lesson is always unlocked
    //  - A lesson is unlocked if the previous lesson is completed
    const isLessonUnlocked = (lessonIndex: number) => {
        if (lessonIndex === 0) return true;
        const prevLesson = allLessons[lessonIndex - 1];
        return prevLesson?.isCompleted === true;
    };

    // Nav helpers
    const goToLesson = (id: number) => {
        const idx = allLessons.findIndex((l) => l.id === id);
        if (!isLessonUnlocked(idx)) return; // Don't navigate to locked lessons
        setCurrentLessonId(id);
        setNoteContent("");
        setNoteSaved(false);
        setQuizPassed(false);
    };

    const goPrev = () => {
        if (currentIndex > 0) goToLesson(allLessons[currentIndex - 1].id);
    };

    const goNext = () => {
        if (currentIndex < allLessons.length - 1) {
            // Mark current as complete, then navigate
            handleMarkComplete().then(() => {
                goToLesson(allLessons[currentIndex + 1].id);
            });
        }
    };

    // Can the user proceed to next lesson?
    const currentLessonCompleted = allLessons[currentIndex]?.isCompleted;
    const canProceed = currentLessonCompleted || quizPassed;
    const isLastLesson = currentIndex >= allLessons.length - 1;

    const progressPercent = pathData?.progressPercent || 0;
    const lessonNum = currentIndex + 1;
    const totalNum = allLessons.length;

    if (loading && !lesson) {
        return (
            <div className="flex items-center justify-center h-screen">
                <span className="animate-spin material-symbols-outlined text-[#20c997] text-4xl">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfdfe] text-[#1a1a1e] font-[Lexend] overflow-hidden selection:bg-[#20c997]/20">
            {/* Background Blurs */}
            <div className="fixed top-[-10%] left-[-5%] w-[50%] h-[60%] bg-[#20c997]/5 blur-[140px] rounded-full -z-10"></div>
            <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[50%] bg-violet-100/5 blur-[120px] rounded-full -z-10"></div>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center px-6 lg:px-12 border-b border-gray-100/30 bg-white/40 backdrop-blur-xl">
                <div className="max-w-[1700px] w-full mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6 lg:gap-12">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="text-[#20c997] flex items-center justify-center size-10 rounded-2xl bg-white shadow-sm border border-gray-100/60 transition-transform active:scale-95">
                                <span className="material-symbols-outlined text-2xl font-bold">north_east</span>
                            </Link>
                            <span className="text-[#1a1a1e] text-xs font-black tracking-[0.2em] uppercase hidden md:block">FromZero</span>
                        </div>
                        <div className="h-8 w-px bg-gray-200/40 hidden md:block"></div>
                        <div className="flex flex-col gap-1">
                            <nav className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <Link href="/dashboard/learning-paths" className="hover:text-[#20c997] transition-colors cursor-pointer">
                                    {pathData?.title || "Learning Path"}
                                </Link>
                                <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                                <span className="text-[#1a1a1e]">{lesson?.course?.title || "Course"}</span>
                            </nav>
                            <div className="flex items-center gap-4">
                                <h1 className="text-base lg:text-xl font-bold text-[#1a1a1e] tracking-tight truncate max-w-[200px] lg:max-w-none">
                                    {lesson?.title || "Loading lesson..."}
                                </h1>
                                {lesson?.course?.difficulty && (
                                    <span className="hidden lg:inline-block bg-[#20c997]/10 text-[#18a077] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border border-[#20c997]/10">
                                        {lesson.course.difficulty}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/learning-paths" className="size-11 rounded-full bg-white/60 border border-gray-100/60 flex items-center justify-center text-gray-500 hover:text-[#20c997] transition-all hover:shadow-sm">
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex h-screen pt-20 pb-24">
                {/* Video Column */}
                <main className="flex-grow flex flex-col items-center justify-start px-6 lg:px-12 pt-8 relative overflow-y-auto custom-scrollbar">
                    <div className="w-full max-w-[1280px] flex flex-col items-center gap-10 mb-12">
                        {/* Video Player */}
                        <div className="w-full relative">
                            <div className="aspect-video w-full rounded-3xl bg-black overflow-hidden relative z-10 border border-white/20 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1),0_0_40px_-10px_rgba(32,201,151,0.03)]">
                                {lesson?.youtubeUrl ? (
                                    <iframe
                                        className="w-full h-full"
                                        src={getYoutubeEmbedUrl(lesson.youtubeUrl)}
                                        title={lesson.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined text-5xl text-gray-400">videocam_off</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Lesson Description */}
                        {lesson?.description && (
                            <div className="w-full bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-8">
                                <h3 className="font-bold text-sm text-[#1a1a1e] mb-3">About this lesson</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{lesson.description}</p>
                            </div>
                        )}

                        {/* Quiz Section — appears below the lesson */}
                        {currentLessonId && (
                            <QuizSection
                                lessonId={currentLessonId}
                                token={token}
                                onQuizCompleted={() => {
                                    setQuizPassed(true);
                                    handleMarkComplete();
                                }}
                            />
                        )}
                    </div>
                </main>

                {/* Sidebar */}
                <aside className="hidden xl:flex w-[420px] bg-white/60 backdrop-blur-3xl border-l border-gray-100/40 h-full flex-col py-12 px-10 overflow-y-auto custom-scrollbar">
                    {/* Lesson Summary (admin content) */}
                    {lesson?.summary && (
                        <div className="flex flex-col flex-shrink-0 mb-10">
                            <div className="bg-gradient-to-br from-[#20c997]/5 via-white/80 to-white/60 p-7 rounded-3xl border border-white shadow-sm relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="p-2.5 rounded-2xl bg-white shadow-sm border border-[#20c997]/10">
                                            <span className="material-symbols-outlined text-[#20c997] text-xl leading-none">auto_awesome_motion</span>
                                        </div>
                                        <h4 className="font-bold text-sm text-[#1a1a1e] tracking-tight">Lesson Summary</h4>
                                    </div>
                                    <p className="text-[13px] leading-relaxed text-gray-500 font-medium whitespace-pre-wrap">
                                        {lesson.summary}
                                    </p>
                                </div>
                                <div className="absolute -bottom-8 -right-8 size-36 bg-[#20c997]/5 blur-3xl"></div>
                            </div>
                        </div>
                    )}

                    {/* Lesson Overview */}
                    <div className="flex flex-col flex-shrink-0 mb-14">
                        <div className="flex items-center justify-between mb-8 px-1">
                            <h3 className="font-bold text-[11px] uppercase tracking-[0.25em] text-gray-400">Lesson Overview</h3>
                        </div>
                        <div className="space-y-4">
                            {pathData?.courses.map((course) =>
                                course.lessons.map((l, lIndex) => {
                                    const globalIdx = allLessons.findIndex((al) => al.id === l.id);
                                    const unlocked = isLessonUnlocked(globalIdx);
                                    return (
                                        <div
                                            key={l.id}
                                            onClick={() => unlocked && goToLesson(l.id)}
                                            className={`p-6 rounded-3xl flex items-center gap-5 transition-all ${!unlocked
                                                ? "bg-gray-50/40 border border-gray-100/30 opacity-50 cursor-not-allowed"
                                                : l.id === currentLessonId
                                                    ? "bg-white border-2 border-[#20c997]/20 shadow-sm shadow-[#20c997]/5 cursor-pointer"
                                                    : l.isCompleted
                                                        ? "bg-white/80 border border-[#20c997]/10 cursor-pointer"
                                                        : "bg-white/40 border border-gray-100/60 hover:bg-white/80 cursor-pointer"
                                                }`}
                                        >
                                            <span className={`size-8 text-[10px] font-bold rounded-xl flex items-center justify-center shadow-sm ${l.isCompleted
                                                ? "bg-[#20c997] text-white"
                                                : l.id === currentLessonId
                                                    ? "bg-[#1a1a1e] text-white"
                                                    : !unlocked
                                                        ? "bg-gray-100 text-gray-300 border border-gray-100"
                                                        : "bg-gray-50 text-gray-400 border border-gray-100"
                                                }`}>
                                                {!unlocked ? (
                                                    <span className="material-symbols-outlined text-[14px]">lock</span>
                                                ) : (
                                                    String(l.order).padStart(2, "0")
                                                )}
                                            </span>
                                            <div className="flex-grow">
                                                <span className={`text-sm font-bold transition-colors ${l.id === currentLessonId ? "text-[#1a1a1e]" : l.isCompleted ? "text-[#1a1a1e]" : !unlocked ? "text-gray-400" : "text-gray-500"}`}>
                                                    {l.title}
                                                </span>
                                                {l.duration && <p className="text-[10px] text-gray-400 mt-0.5">{l.duration}</p>}
                                            </div>
                                            {l.isCompleted && (
                                                <span className="material-symbols-outlined text-[#20c997] text-xl ml-auto">check_circle</span>
                                            )}
                                            {!unlocked && !l.isCompleted && (
                                                <span className="material-symbols-outlined text-gray-300 text-xl ml-auto">lock</span>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Note Taking */}
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="font-bold text-[11px] uppercase tracking-[0.25em] text-gray-400">AI Note-Taking</h3>
                            {noteSaved && (
                                <span className="text-[10px] font-bold text-[#20c997] flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">check</span> Saved
                                </span>
                            )}
                        </div>
                        <div className="bg-white/60 backdrop-blur-xl border border-white/80 shadow-sm rounded-3xl flex flex-col min-h-[260px]">
                            <textarea
                                className="flex-grow p-7 text-[13px] text-gray-600 font-medium leading-relaxed bg-transparent border-none resize-none focus:ring-0 outline-none placeholder:text-gray-400 placeholder:italic"
                                placeholder="Start typing or capture a thought from the lesson..."
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                            ></textarea>
                            <div className="p-4 border-t border-white/40 flex gap-3">
                                <button
                                    onClick={() => setNoteContent("")}
                                    className="flex-1 py-3 bg-gray-50/50 text-[10px] font-bold text-gray-400 rounded-2xl hover:bg-gray-100 transition-colors uppercase tracking-widest border border-gray-100/50"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={handleSaveNote}
                                    disabled={savingNote}
                                    className="flex-1 py-3 bg-[#20c997] text-[10px] font-bold text-white rounded-2xl hover:bg-[#18a077] transition-colors uppercase tracking-widest shadow-lg shadow-[#20c997]/10 disabled:opacity-50"
                                >
                                    {savingNote ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 z-[60] h-24 bg-white/60 backdrop-blur-2xl border-t border-white/80 flex items-center">
                <div className="w-full max-w-[1700px] mx-auto px-6 lg:px-12 flex items-center justify-between">
                    <div className="w-[140px] lg:w-[200px]">
                        <button
                            onClick={goPrev}
                            disabled={currentIndex <= 0}
                            className="group flex items-center gap-3 py-3 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#20c997] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            Previous
                        </button>
                    </div>

                    <div className="flex-grow flex flex-col gap-3.5 items-center max-w-xs lg:max-w-xl">
                        <div className="flex justify-between items-center w-full">
                            <span className="text-[11px] font-bold text-[#1a1a1e] uppercase tracking-[0.2em]">
                                Lesson {lessonNum} <span className="text-gray-300 mx-2">/</span> {totalNum}
                            </span>
                            <span className="text-[11px] font-bold text-[#20c997] uppercase tracking-[0.2em]">
                                {progressPercent}% COMPLETE
                            </span>
                        </div>
                        <div className="h-2 w-full bg-gray-100/60 rounded-full overflow-hidden border border-white/60">
                            <div
                                className="h-full bg-[#20c997] rounded-full shadow-[0_0_12px_rgba(32,201,151,0.3)] transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="w-[140px] lg:w-[200px] flex justify-end">
                        {isLastLesson ? (
                            <Link
                                href="/dashboard/learning-paths"
                                className="flex items-center gap-4 bg-[#20c997] text-white px-6 lg:px-10 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-[#18a077] transition-all active:scale-[0.97] shadow-lg shadow-[#20c997]/20"
                            >
                                <span className="hidden lg:inline">Finish Path</span>
                                <span className="lg:hidden">Finish</span>
                                <span className="material-symbols-outlined text-[18px]">celebration</span>
                            </Link>
                        ) : (
                            <button
                                onClick={goNext}
                                disabled={!canProceed}
                                title={!canProceed ? "Complete the quiz to unlock the next lesson" : ""}
                                className={`flex items-center gap-4 px-6 lg:px-10 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-[0.15em] transition-all active:scale-[0.97] shadow-lg ${canProceed
                                    ? "bg-[#1a1a1e] text-white hover:bg-[#20c997] shadow-[#1a1a1e]/5"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                    }`}
                            >
                                {canProceed ? (
                                    <>
                                        <span className="hidden lg:inline">Next Lesson</span>
                                        <span className="lg:hidden">Next</span>
                                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">lock</span>
                                        <span className="hidden lg:inline">Complete Quiz</span>
                                        <span className="lg:hidden">Locked</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default function LessonPage() {
    return (
        <AuthGuard>
            <Suspense fallback={
                <div className="flex items-center justify-center h-screen">
                    <span className="animate-spin material-symbols-outlined text-[#20c997] text-4xl">progress_activity</span>
                </div>
            }>
                <LessonContent />
            </Suspense>
        </AuthGuard>
    );
}
