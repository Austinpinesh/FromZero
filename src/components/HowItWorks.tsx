import Image from "next/image";

const steps = [
    {
        number: "01",
        icon: "flag",
        title: "Set Your Goal",
        description: "Tell us what you want to learn. From coding to creative writing, we build the foundations.",
    },
    {
        number: "02",
        icon: "route",
        title: "Get A Roadmap",
        description: "Our AI generates a step-by-step curriculum tailored exactly to your current skill level.",
    },
    {
        number: "03",
        icon: "psychology",
        title: "Learn with AI",
        description: "Dive into interactive lessons. Stuck? The AI Tutor explains concepts like a personal mentor.",
    },
    {
        number: "04",
        icon: "bar_chart",
        title: "Track Progress",
        description: "Visualize your growth with dynamic dashboards, skill trees, and real-time proficiency scores.",
    },
];

export default function HowItWorks() {
    return (
        <section className="py-24 bg-gray-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-20 flex flex-col items-center">
                    <span className="px-4 py-1.5 rounded-full bg-[#20c997]/10 text-[#18a077] text-xs font-bold uppercase tracking-wider mb-4">
                        The Process
                    </span>
                    <h2 className="text-[#34343d] text-4xl lg:text-5xl font-black leading-tight mb-6">
                        How It Works
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl">
                        A frictionless journey from zero to mastery, powered by advanced AI algorithms.
                    </p>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    {/* Connection line */}
                    <div className="hidden lg:block absolute top-[120px] left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#20c997]/20 to-transparent -z-10"></div>

                    {steps.map((step, index) => (
                        <div key={index} className="step-card group relative bg-white border border-gray-100 p-8 rounded-3xl">
                            {/* Step number background */}
                            <div className="absolute -top-4 right-8 text-6xl font-black text-[#20c997]/5 group-hover:text-[#20c997]/10 transition-colors">
                                {step.number}
                            </div>

                            {/* Icon */}
                            <div className="size-16 rounded-2xl bg-gradient-to-br from-[#20c997] to-emerald-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-[#20c997]/20 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-3xl">{step.icon}</span>
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold text-[#34343d] mb-3">{step.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>

                            {/* Hover line */}
                            <div className="mt-4 h-1 w-0 bg-[#20c997] group-hover:w-full transition-all duration-500 rounded-full"></div>
                        </div>
                    ))}
                </div>

                {/* Join banner */}
                <div className="mt-20 flex justify-center">
                    <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-gradient-to-r from-[#34343d] to-slate-800 text-white shadow-2xl shadow-[#34343d]/20 max-w-3xl w-full">
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3 overflow-hidden">
                                <Image
                                    alt="User"
                                    className="inline-block h-10 w-10 rounded-full ring-2 ring-[#34343d]"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3WIRS9CE4XfNkqYItXntwG27zvSg0FPLRlFiKMAzJ33QeNoNpaf5BM3BeF44yHUrcZ5TtJXkKdqbLPBkyttpuDD4SSdU8G5Z_lDgLY6hY_mWXJmrdt3ahnXVnakO8uoTRv_Dv5i_OpEJ_nRY2cqHaQtixh1taN8o2Qaag56-e8YQhV7nr_wiYPI3cnkfp8aIo1ZYPI2JaQHM5OGFhvx4sEJJ60J57lpWHzFtzOor1Ei81epJseWSGNkTsyDLdzBHG_2pOYYJyKiA"
                                    width={40}
                                    height={40}
                                />
                                <Image
                                    alt="User"
                                    className="inline-block h-10 w-10 rounded-full ring-2 ring-[#34343d]"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9K2TgPezXqH_qT7XqjxtqSbtlpx_gBCyPJ_o9T06hOCxu5m-s9Es958iBWtwmriivCj_PqlQ_pYrsU7ozgLOsy_OQrpVOAA6FtzmkF0y2bhkilS7rZ-8Vt4OgFkVMP1VOM2r4V0XyI07IXwdVC0QsgDAb1jiLMxkw3GirjyYlYGG3h81DDgav9iPwf7oJ_mSbV56RnSK-28kg6gn9F0Ddk3ftf6oy_s3_d6tYGb4tDQe9yJxXa3Qw7RPKa4sfSgps_wafdU0AloA"
                                    width={40}
                                    height={40}
                                />
                                <Image
                                    alt="User"
                                    className="inline-block h-10 w-10 rounded-full ring-2 ring-[#34343d]"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbo9YaJGlouzlbPmBMDFRmrmnjd7f2XedZNIgpBRul2CEumkWKwGUilkyuJ_83FlOtYdBbswduIqcmdGapU_0T6gKs14LFaQNxvHWdjOjnEpjYYoegKG0Cf51OrMsqd4yChojrFkS1ntZcZTszJNJ0Tu4TmO4Afm1zz0iP-gF0TgYoKpbDafw98JGKlmcrRjiaaJhzw5beRqYxMO0Uluv39of5F4cymglv31RaPVBQWysagiVyonvJFZBXhQlOGmCcFTogtSZJOiY"
                                    width={40}
                                    height={40}
                                />
                                <div className="flex items-center justify-center h-10 w-10 rounded-full ring-2 ring-[#34343d] bg-[#20c997] text-white text-[10px] font-bold">
                                    +2k
                                </div>
                            </div>
                            <p className="text-sm font-semibold">Join 2,000+ students starting their journey today</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
