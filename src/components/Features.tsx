const features = [
    {
        icon: "map",
        title: "AI Personalized Paths",
        description: "Curriculum that adapts dynamically to your pace, goals, and learning style.",
    },
    {
        icon: "smart_toy",
        title: "ChatGPT Tutor",
        description: "Get 24/7 answers to your specific coding or theory questions instantly.",
    },
    {
        icon: "video_library",
        title: "YouTube Integration",
        description: "Curated high-quality video lessons, summarized and made interactive for you.",
    },
    {
        icon: "groups",
        title: "Global Community",
        description: "Learn, share, and grow together with ambitious peers from around the world.",
    },
];

export default function Features() {
    return (
        <section className="py-16 lg:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
                <div className="flex flex-col gap-12">
                    {/* Section Header */}
                    <div className="flex flex-col gap-4 text-center items-center">
                        <span className="text-[#20c997] font-bold tracking-wider uppercase text-sm">Features</span>
                        <h2 className="text-[#34343d] text-3xl lg:text-4xl font-bold leading-tight max-w-2xl">
                            Everything you need to master new skills
                        </h2>
                        <p className="text-gray-600 text-base max-w-2xl">
                            From personalized roadmaps to instant AI assistance, we provide the tools to accelerate your growth.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
                            >
                                {/* Icon */}
                                <div className="size-14 rounded-2xl bg-[#20c997]/10 flex items-center justify-center text-[#20c997] group-hover:bg-[#20c997] group-hover:text-white transition-all duration-300 shadow-sm">
                                    <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
                                </div>

                                {/* Content */}
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-[#34343d] text-lg font-bold">{feature.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
