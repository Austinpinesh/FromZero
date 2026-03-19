import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AITutorPage() {
    return (
        <>
            <Header />
            <main className="pt-32 pb-20 px-6 lg:px-10">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
                        <div className="lg:w-1/2">
                            <span className="text-[#20c997] font-bold tracking-wider uppercase text-sm">AI Tutor</span>
                            <h1 className="text-4xl lg:text-5xl font-black text-[#34343d] mt-4 mb-6 leading-tight">
                                Your personal AI learning companion
                            </h1>
                            <p className="text-gray-600 text-lg mb-8">
                                Get instant answers to your questions, personalized explanations, and guided problem-solving available 24/7.
                            </p>
                            <Link
                                href="/signup"
                                className="inline-flex items-center justify-center rounded-full h-14 px-10 bg-[#20c997] hover:bg-[#18a077] text-white text-base font-bold transition-all shadow-xl shadow-[#20c997]/20"
                            >
                                Try AI Tutor Free
                            </Link>
                        </div>
                        <div className="lg:w-1/2">
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6">
                                <div className="bg-gray-50 rounded-2xl p-6 mb-4">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="size-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-gray-600 text-sm">person</span>
                                        </div>
                                        <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm">
                                            <p className="text-sm text-gray-700">How do I center a div in CSS?</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 justify-end">
                                        <div className="bg-[#20c997] rounded-2xl rounded-tr-none p-4 max-w-xs">
                                            <p className="text-sm text-white">Great question! There are several ways to center a div. The modern approach uses Flexbox...</p>
                                        </div>
                                        <div className="size-8 rounded-full bg-[#20c997] flex items-center justify-center">
                                            <span className="material-symbols-outlined text-white text-sm">smart_toy</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        placeholder="Ask anything..."
                                        className="flex-1 h-12 px-4 rounded-full border border-gray-200 focus:border-[#20c997] outline-none"
                                    />
                                    <button className="size-12 rounded-full bg-[#20c997] text-white flex items-center justify-center">
                                        <span className="material-symbols-outlined">send</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: "psychology", title: "Context-Aware", description: "Understands your learning history and adapts explanations accordingly" },
                            { icon: "speed", title: "Instant Responses", description: "Get answers in seconds, not hours of searching online" },
                            { icon: "translate", title: "Multi-Language", description: "Learn in your preferred language with native-quality explanations" },
                        ].map((feature, index) => (
                            <div key={index} className="bg-white rounded-3xl border border-gray-100 p-8 text-center">
                                <div className="size-14 mx-auto rounded-2xl bg-[#20c997]/10 flex items-center justify-center text-[#20c997] mb-6">
                                    <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold text-[#34343d] mb-2">{feature.title}</h3>
                                <p className="text-gray-600 text-sm">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
