"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { fetchWithAuth } from "@/utils/api";


const navItems = [
    { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
    { href: "/dashboard/courses", icon: "auto_stories", label: "Courses" },
    { href: "/dashboard/learning-paths", icon: "route", label: "Learning Paths" },
    { href: "/dashboard/community", icon: "groups", label: "Community" },
    { href: "/dashboard/ai-tutor", icon: "smart_toy", label: "AI Tutor" },
    { href: "/dashboard/analytics", icon: "analytics", label: "Analytics" },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetchWithAuth("http://localhost:5000/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch {
            // Even if the API call fails, still clear local state
        }
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        router.push("/");
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-[#f8fafb] flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-100">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#20c997] text-3xl font-bold">north_east</span>
                            <span className="text-xl font-bold text-[#34343d] tracking-tight">FromZero</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4">
                        <ul className="space-y-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive
                                                ? "bg-[#20c997] text-white"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-[#20c997]"
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-xl">{item.icon}</span>
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>



                    {/* Profile & Logout */}
                    <div className="p-4 border-t border-gray-100 space-y-1">
                        <Link
                            href="/dashboard/profile"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
                        >
                            <span className="material-symbols-outlined text-xl">account_circle</span>
                            <span className="font-medium">Profile</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all w-full"
                        >
                            <span className="material-symbols-outlined text-xl">logout</span>
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 ml-64 p-8">
                    {children}
                </main>
            </div>
        </AuthGuard>
    );
}
