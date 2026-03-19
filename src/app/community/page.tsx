import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const discussions = [
    { title: "Best resources for learning React in 2024?", replies: 42, author: "Sarah M.", time: "2h ago", tag: "React" },
    { title: "How to stay motivated while self-learning?", replies: 128, author: "James K.", time: "5h ago", tag: "General" },
    { title: "Python vs JavaScript for beginners?", replies: 89, author: "Alex T.", time: "1d ago", tag: "Career" },
    { title: "Tips for building a portfolio project", replies: 56, author: "Maria L.", time: "2d ago", tag: "Projects" },
];

export default function CommunityPage() {
    return (
        <>
            <Header />
            <main className="pt-32 pb-20 px-6 lg:px-10">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <span className="text-[#20c997] font-bold tracking-wider uppercase text-sm">Community</span>
                        <h1 className="text-4xl lg:text-5xl font-black text-[#34343d] mt-4 mb-6">
                            Learn together, grow together
                        </h1>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Join thousands of learners sharing knowledge, asking questions, and supporting each other.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                        {[
                            { value: "50K+", label: "Members" },
                            { value: "10K+", label: "Discussions" },
                            { value: "95%", label: "Questions Answered" },
                            { value: "120+", label: "Countries" },
                        ].map((stat, index) => (
                            <div key={index} className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                                <div className="text-3xl font-black text-[#20c997] mb-1">{stat.value}</div>
                                <div className="text-gray-500 text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Recent Discussions */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-[#34343d]">Recent Discussions</h2>
                            <Link href="/community/new" className="text-[#20c997] font-semibold text-sm hover:underline">
                                Start a Discussion
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {discussions.map((discussion, index) => (
                                <div key={index} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer">
                                    <div className="size-12 rounded-full bg-[#20c997]/10 flex items-center justify-center text-[#20c997]">
                                        <span className="material-symbols-outlined">forum</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-[#34343d] mb-1">{discussion.title}</h3>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span>{discussion.author}</span>
                                            <span>•</span>
                                            <span>{discussion.time}</span>
                                            <span className="px-2 py-0.5 bg-[#20c997]/10 text-[#20c997] rounded-full">{discussion.tag}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-[#34343d]">{discussion.replies}</div>
                                        <div className="text-xs text-gray-500">replies</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Join CTA */}
                    <div className="mt-16 text-center">
                        <div className="bg-[#1a1a1e] rounded-3xl p-12 relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-3xl font-bold text-white mb-4">Ready to join the conversation?</h2>
                                <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                                    Become a part of our growing community of learners and mentors.
                                </p>
                                <Link
                                    href="/signup"
                                    className="inline-block bg-[#20c997] text-white font-bold py-4 px-10 rounded-full hover:bg-[#18a077] transition-all transform hover:scale-105 shadow-lg shadow-[#20c997]/20"
                                >
                                    Join Now
                                </Link>
                            </div>
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#20c997]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#20c997]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
