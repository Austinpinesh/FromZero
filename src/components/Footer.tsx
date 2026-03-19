import Link from "next/link";

const footerLinks = {
    platform: [
        { href: "/courses", label: "Courses" },
        { href: "/ai-tutor", label: "AI Tutor" },
        { href: "/certificates", label: "Certificates" },
    ],
    resources: [
        { href: "/blog", label: "Blog" },
        { href: "/community", label: "Community" },
        { href: "/documentation", label: "Documentation" },
        { href: "/support", label: "Support" },
    ],
    company: [
        { href: "/about", label: "About Us" },
        { href: "/careers", label: "Careers" },
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="col-span-2 lg:col-span-2 flex flex-col gap-6">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#20c997] text-4xl font-bold">north_east</span>
                            <span className="text-2xl font-bold text-[#34343d] tracking-tight">FromZero</span>
                        </Link>
                        <p className="text-gray-500 text-base leading-relaxed max-w-xs">
                            Empowering self-learners with AI-driven personalized education paths. Grow without limits and master the skills of the future.
                        </p>
                        {/* Social Links */}
                        <div className="flex gap-4">
                            <a href="#" className="size-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:text-[#20c997] hover:bg-[#20c997]/10 transition-all">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                                </svg>
                            </a>
                            <a href="#" className="size-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:text-[#20c997] hover:bg-[#20c997]/10 transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <rect height="20" rx="5" ry="5" width="20" x="2" y="2"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                                </svg>
                            </a>
                            <a href="#" className="size-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:text-[#20c997] hover:bg-[#20c997]/10 transition-all">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                    <rect height="12" width="4" x="2" y="9"></rect>
                                    <circle cx="4" cy="4" r="2"></circle>
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div className="flex flex-col gap-6">
                        <h4 className="font-bold text-[#34343d] uppercase text-xs tracking-widest">Platform</h4>
                        <div className="flex flex-col gap-4 text-sm font-medium">
                            {footerLinks.platform.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-gray-500 hover:text-[#20c997] transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Resources Links */}
                    <div className="flex flex-col gap-6">
                        <h4 className="font-bold text-[#34343d] uppercase text-xs tracking-widest">Resources</h4>
                        <div className="flex flex-col gap-4 text-sm font-medium">
                            {footerLinks.resources.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-gray-500 hover:text-[#20c997] transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Company Links */}
                    <div className="flex flex-col gap-6">
                        <h4 className="font-bold text-[#34343d] uppercase text-xs tracking-widest">Company</h4>
                        <div className="flex flex-col gap-4 text-sm font-medium">
                            {footerLinks.company.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-gray-500 hover:text-[#20c997] transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-100 gap-4">
                    <p className="text-sm text-gray-400 font-medium">
                        © 2026 FromZero Inc. All rights reserved.
                    </p>
                    <p className="text-sm text-gray-400 font-medium flex items-center gap-1">
                        Made with <span className="text-[#20c997]">♥</span> for learners everywhere.
                    </p>
                </div>
            </div>
        </footer>
    );
}
