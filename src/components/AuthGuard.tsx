"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * AuthGuard — wraps protected pages.
 * Checks for an access token in localStorage.
 * If missing, redirects to /login immediately.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            router.replace("/login");
        } else {
            setAuthorized(true);
        }
    }, [router]);

    // Show nothing while checking auth (prevents flash of protected content)
    if (!authorized) {
        return (
            <div className="min-h-screen bg-[#f8fafb] flex items-center justify-center">
                <span className="animate-spin material-symbols-outlined text-[#20c997] text-4xl">
                    progress_activity
                </span>
            </div>
        );
    }

    return <>{children}</>;
}
