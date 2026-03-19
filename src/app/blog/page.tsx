import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const posts = [
    {
        title: "10 Tips for Effective Self-Learning in 2024",
        excerpt: "Discover proven strategies to maximize your learning potential and stay motivated.",
        category: "Learning Tips",
        date: "Jan 15, 2024",
        readTime: "5 min read",
    },
    {
        title: "The Rise of AI in Education",
        excerpt: "How artificial intelligence is transforming the way we learn and teach.",
        category: "Technology",
        date: "Jan 12, 2024",
        readTime: "8 min read",
    },
    {
        title: "Building Your First Web Application",
        excerpt: "A step-by-step guide for beginners to create their first web app.",
        category: "Tutorials",
        date: "Jan 10, 2024",
        readTime: "12 min read",
    },
    {
        title: "Career Paths in Tech: 2024 Guide",
        excerpt: "Explore the hottest tech careers and how to prepare for them.",
        category: "Career",
        date: "Jan 8, 2024",
        readTime: "7 min read",
    },
];

export default function BlogPage() {
    return (
        <>
            <Header />
            <main className="pt-32 pb-20 px-6 lg:px-10">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <span className="text-[#20c997] font-bold tracking-wider uppercase text-sm">Blog</span>
                        <h1 className="text-4xl lg:text-5xl font-black text-[#34343d] mt-4 mb-6">
                            Insights & Resources
                        </h1>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Tips, tutorials, and stories to help you on your learning journey.
                        </p>
                    </div>

                    {/* Blog Posts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {posts.map((post, index) => (
                            <article
                                key={index}
                                className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all group"
                            >
                                <div className="h-48 bg-gradient-to-br from-[#20c997]/20 to-emerald-500/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-6xl text-[#20c997]/30">article</span>
                                </div>
                                <div className="p-8">
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                                        <span className="px-2 py-1 bg-[#20c997]/10 text-[#20c997] rounded-full font-medium">
                                            {post.category}
                                        </span>
                                        <span>{post.date}</span>
                                        <span>•</span>
                                        <span>{post.readTime}</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-[#34343d] mb-3 group-hover:text-[#20c997] transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                                    <Link href={`/blog/${index + 1}`} className="text-[#20c997] font-semibold text-sm hover:underline">
                                        Read More →
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
