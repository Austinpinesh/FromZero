const benefits = [
    {
        icon: "bolt",
        title: "Smart Recommendations",
        description: "Our algorithms analyze your performance to suggest the next best lesson.",
    },
    {
        icon: "support_agent",
        title: "Real-Time Help",
        description: "Never get stuck. Our AI tutor understands context and explains simply.",
    },
    {
        icon: "workspace_premium",
        title: "Industry Standard",
        description: "Curriculum based on what top tech companies are actually hiring for.",
    },
];

export default function WhyChooseUs() {
    return (
        <section className="py-16 lg:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    {/* Left Column - Image/Progress Card */}
                    <div className="w-full lg:w-1/2 order-2 lg:order-1">
                        <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-white">
                            <div
                                className="w-full aspect-video bg-cover bg-center"
                                style={{
                                    backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBLbkiksH8i5eQVasUxOhgcc5W7gf3K0OIjrKw42ZgVGpxSpm9e3oArEo9MEfZBOrzWVbY9fWLMTjYdJY2tovpF4r5vROJwMRH0wIPCJZ0PcCzM7TmhF-I2alxHOjcFDYr7gV2EpViWmPLtVA-BRYV7RRdTVw0svt7u_oRiIC8IwvBbXtIUygT4gNvRoObNiQqOlvH0nWaT4_fmME6oyEo9hMyyp_Yj6smqL4wNXEJEQwudmyGcxyW7AE8Uc9fVsJiUt7QfZpdtg3w")`
                                }}
                            ></div>
                            <div className="p-8">
                                {/* Progress bar */}
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-[#20c997] to-emerald-500 w-3/4 rounded-full"></div>
                                    </div>
                                    <span className="text-sm font-bold text-[#18a077]">75% Complete</span>
                                </div>
                                {/* Module info */}
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-xs">book</span>
                                        <span>Module: Advanced UI Design</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-xs">timer</span>
                                        <span>2h remaining</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Content */}
                    <div className="w-full lg:w-1/2 order-1 lg:order-2">
                        <h2 className="text-3xl lg:text-4xl font-bold text-[#34343d] mb-6">
                            Why Choose FromZero?
                        </h2>
                        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                            Traditional courses are static. We are dynamic. FromZero evolves with you, ensuring you never waste time on what you already know.
                        </p>

                        {/* Benefits */}
                        <div className="flex flex-col gap-6">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="mt-1 bg-[#20c997]/10 p-2.5 rounded-xl h-fit text-[#18a077]">
                                        <span className="material-symbols-outlined">{benefit.icon}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-[#34343d]">{benefit.title}</h4>
                                        <p className="text-gray-600 text-sm">{benefit.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
