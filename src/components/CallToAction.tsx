import Link from "next/link";

export default function CallToAction() {
    return (
        <section className="py-24 px-6 lg:px-10">
            <div className="max-w-6xl mx-auto w-full bg-gradient-to-br from-[#34343d] to-slate-900 rounded-[3rem] overflow-hidden relative shadow-2xl">
                {/* Background blurs */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 size-96 bg-[#20c997]/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 size-80 bg-emerald-500/10 rounded-full blur-3xl"></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center p-12 lg:p-20 gap-8">
                    <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-3xl">
                        Ready to upgrade your brain?
                    </h2>
                    <p className="text-gray-300 text-lg lg:text-xl max-w-2xl font-medium">
                        Join 50,000+ learners who are mastering new skills faster with FromZero. Start your personalized journey today.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
                        <Link
                            href="/signup"
                            className="bg-[#20c997] text-white hover:bg-[#18a077] font-bold py-5 px-12 rounded-full text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                        >
                            Join FromZero Today
                        </Link>
                    </div>

                    {/* Trust indicators */}
                    <p className="text-gray-400 text-sm font-medium">
                        Free to get started • Cancel anytime • 24/7 Support
                    </p>
                </div>
            </div>
        </section>
    );
}
