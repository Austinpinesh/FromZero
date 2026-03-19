import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const courses = [
    {
        title: "Web Development Fundamentals",
        description: "Learn HTML, CSS, and JavaScript from scratch",
        level: "Beginner",
        duration: "8 weeks",
        students: "12,450",
        icon: "code",
    },
    {
        title: "React & Next.js Mastery",
        description: "Build modern web applications with React",
        level: "Intermediate",
        duration: "10 weeks",
        students: "8,230",
        icon: "web",
    },
    {
        title: "Python for Data Science",
        description: "Master Python for data analysis and ML",
        level: "Intermediate",
        duration: "12 weeks",
        students: "15,890",
        icon: "analytics",
    },
    {
        title: "UI/UX Design Principles",
        description: "Design beautiful and functional interfaces",
        level: "Beginner",
        duration: "6 weeks",
        students: "9,120",
        icon: "palette",
    },
    {
        title: "Cloud Computing with AWS",
        description: "Deploy and scale applications on AWS",
        level: "Advanced",
        duration: "8 weeks",
        students: "5,670",
        icon: "cloud",
    },
    {
        title: "Mobile App Development",
        description: "Build iOS and Android apps with React Native",
        level: "Intermediate",
        duration: "10 weeks",
        students: "7,340",
        icon: "smartphone",
    },
];

export default function CoursesPage() {
    return (
        <>
            <Header />
            <main className="pt-32 pb-20 px-6 lg:px-10">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <span className="text-[#20c997] font-bold tracking-wider uppercase text-sm">Our Courses</span>
                        <h1 className="text-4xl lg:text-5xl font-black text-[#34343d] mt-4 mb-6">
                            Learn the skills of tomorrow
                        </h1>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Choose from our curated selection of courses designed to take you from beginner to expert.
                        </p>
                    </div>

                    {/* Courses Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-3xl border border-gray-100 p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
                            >
                                <div className="size-14 rounded-2xl bg-[#20c997]/10 flex items-center justify-center text-[#20c997] group-hover:bg-[#20c997] group-hover:text-white transition-all duration-300 mb-6">
                                    <span className="material-symbols-outlined text-3xl">{course.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold text-[#34343d] mb-2">{course.title}</h3>
                                <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                                    <span className="px-2 py-1 bg-gray-100 rounded-full">{course.level}</span>
                                    <span>{course.duration}</span>
                                    <span>{course.students} students</span>
                                </div>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 text-[#20c997] font-semibold hover:gap-3 transition-all"
                                >
                                    Start Learning
                                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
