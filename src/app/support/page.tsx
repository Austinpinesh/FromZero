import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const faqs = [
    { q: "How do I reset my password?", a: "Go to the login page and click 'Forgot password'. Enter your email and we'll send you a reset link." },
    { q: "Can I download courses for offline viewing?", a: "Yes! Pro subscribers can download any course for offline access through our mobile app." },
    { q: "How does the AI Tutor work?", a: "Our AI Tutor uses advanced language models to understand your questions and provide personalized explanations based on your learning history." },
    { q: "What's your refund policy?", a: "We offer a 14-day money-back guarantee for all paid plans. No questions asked." },
];

export default function SupportPage() {
    return (
        <>
            <Header />
            <main className="pt-32 pb-20 px-6 lg:px-10">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <span className="text-[#20c997] font-bold tracking-wider uppercase text-sm">Support</span>
                        <h1 className="text-4xl lg:text-5xl font-black text-[#34343d] mt-4 mb-6">
                            How can we help?
                        </h1>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Find answers to common questions or get in touch with our team.
                        </p>
                    </div>

                    {/* Contact Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                        {[
                            { icon: "chat", title: "Live Chat", description: "Chat with our support team in real-time", action: "Start Chat" },
                            { icon: "mail", title: "Email Us", description: "Get a response within 24 hours", action: "Send Email" },
                            { icon: "forum", title: "Community", description: "Ask questions in our community forum", action: "Visit Forum" },
                        ].map((option, index) => (
                            <div key={index} className="bg-white rounded-3xl border border-gray-100 p-8 text-center hover:shadow-xl transition-all">
                                <div className="size-14 mx-auto rounded-2xl bg-[#20c997]/10 flex items-center justify-center text-[#20c997] mb-6">
                                    <span className="material-symbols-outlined text-3xl">{option.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold text-[#34343d] mb-2">{option.title}</h3>
                                <p className="text-gray-600 text-sm mb-6">{option.description}</p>
                                <button className="px-6 py-3 bg-[#20c997] text-white font-semibold rounded-full hover:bg-[#18a077] transition-colors">
                                    {option.action}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* FAQs */}
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl font-bold text-[#34343d] text-center mb-8">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div key={index} className="bg-white rounded-2xl border border-gray-100 p-6">
                                    <h3 className="font-bold text-[#34343d] mb-2">{faq.q}</h3>
                                    <p className="text-gray-600 text-sm">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-8">
                            <Link href="/documentation" className="text-[#20c997] font-semibold hover:underline">
                                View all FAQs →
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
