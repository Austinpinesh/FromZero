import Link from "next/link";

export default function Hero() {
    return (
        <section className="flex flex-col justify-center pt-40 pb-16 lg:pt-52 lg:pb-24 px-6 lg:px-10">
            <div className="max-w-7xl mx-auto w-full">
                <div className="flex flex-col-reverse lg:flex-row gap-12 lg:gap-20 items-center">
                    {/* Left Column - Text */}
                    <div className="flex flex-col gap-6 lg:w-1/2">
                        <div className="flex flex-col gap-4 text-left">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#20c997]/10 text-[#18a077] text-xs font-bold w-fit">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#20c997] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#20c997]"></span>
                                </span>
                                NEW: AI TUTOR V2.0 IS LIVE
                            </div>

                            {/* Main Headline */}
                            <h1 className="text-[#34343d] text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight">
                                Learn Smarter.<br />
                                Start <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20c997] to-emerald-600">From Zero</span>.<br />
                                Grow Fast.
                            </h1>

                            {/* Subtitle */}
                            <h2 className="text-gray-600 text-lg font-normal leading-relaxed max-w-xl">
                                Your personal AI tutor that turns confusion into clarity. We build personalized paths for every learner, adapting to your pace in real-time.
                            </h2>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4 mt-2">
                            <Link
                                href="/signup"
                                className="flex items-center justify-center rounded-full h-14 px-10 bg-[#20c997] hover:bg-[#18a077] text-white text-base font-bold transition-all shadow-xl shadow-[#20c997]/20 hover:-translate-y-1"
                            >
                                Start Learning
                            </Link>
                            <Link
                                href="/courses"
                                className="flex items-center justify-center rounded-full h-14 px-10 bg-white border border-gray-200 hover:bg-gray-50 text-[#34343d] text-base font-bold transition-all shadow-sm"
                            >
                                Explore Courses
                            </Link>
                        </div>

                        {/* Trust indicator */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                            <span className="material-symbols-outlined text-[#20c997] text-lg">check_circle</span>
                            <span>Free for students • No credit card required</span>
                        </div>
                    </div>

                    {/* Right Column - Image */}
                    <div className="w-full lg:w-1/2">
                        <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                            {/* Background blurs */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#20c997]/20 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>

                            {/* Image container */}
                            <div className="relative z-10 w-full h-full rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(32,201,151,0.15)] bg-gray-200 ring-8 ring-white">
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#20c997]/10 to-emerald-500/10 mix-blend-overlay z-10"></div>
                                <div
                                    className="w-full h-full bg-cover bg-center"
                                    style={{
                                        backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDv3veTuRFuaBodxuFc6xsl2GUD0egRXwK_rS03PYeqSjt7c-mAsBvv9c_LiFFoIM2DMoGlgMS-HasPtwm9sUL30X3D7hGrLq8kXqzmYWi1t_8G42iXfiy-aUenN2eYNfZeHfMJoKZpVNOrp1dpfMCjXpVPdq6e0_Xx2Wkj5yry10NBNYe6r-xAP0gi2t_Ms4wnIz324jGdJiojFt1FWt5GM9k5Zk5YuDUFLOrK1fEWAtYuYnDVS77KtedJz42YQdjM0y7N70PUh0Y")`
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
