import Header from "@/components/Header";
import Footer from "@/components/Footer";

const team = [
    { name: "Austin Pinesh", icon: "person" },
    { name: "Thejus Krishna Chandramohan", icon: "person" },
    { name: "Dominic Jeejo", icon: "person" },
    { name: "Sayanth Sajeevan", icon: "person" },
];

export default function AboutPage() {
    return (
        <>
            <Header />
            <main className="pt-32 pb-20 px-6 lg:px-10">
                <div className="max-w-7xl mx-auto">
                    {/* Hero */}
                    <div className="text-center mb-20">
                        <span className="text-[#20c997] font-bold tracking-wider uppercase text-sm">About Us</span>
                        <h1 className="text-4xl lg:text-5xl font-black text-[#34343d] mt-4 mb-6">
                            Making education accessible to everyone
                        </h1>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            We believe that quality education should be available to anyone, anywhere. Our mission is to democratize learning through AI-powered personalization.
                        </p>
                    </div>

                    {/* Story */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
                        <div>
                            <h2 className="text-3xl font-bold text-[#34343d] mb-6">Our Story</h2>
                            <div className="space-y-4 text-gray-600">
                                <p>
                                    FromZero was founded in 2023 with a simple idea: what if learning could be as personalized as a private tutor, but accessible to everyone?
                                </p>
                                <p>
                                    Our founders experienced firsthand the frustration of one-size-fits-all education. They saw brilliant minds struggle not because they lacked ability, but because the learning path wasn&apos;t tailored to their unique needs.
                                </p>
                                <p>
                                    Today, we&apos;re building the future of education—one where AI adapts to you, not the other way around.
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { value: "50K+", label: "Active Learners" },
                                { value: "95%", label: "Completion Rate" },
                                { value: "120+", label: "Countries" },
                                { value: "4.9", label: "Average Rating" },
                            ].map((stat, index) => (
                                <div key={index} className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                                    <div className="text-3xl font-black text-[#20c997] mb-1">{stat.value}</div>
                                    <div className="text-gray-500 text-sm">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Team */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#34343d] mb-4">Meet the Team</h2>
                        <p className="text-gray-600">The people behind FromZero</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {team.map((member, index) => (
                            <div key={index} className="text-center">
                                <div className="size-24 mx-auto mb-4 rounded-full bg-[#20c997]/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[#20c997] text-4xl">{member.icon}</span>
                                </div>
                                <h3 className="font-bold text-[#34343d]">{member.name}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
