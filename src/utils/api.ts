const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Wrapper for native fetch.
 * - Automatically attaches the Authorization: Bearer <token> header
 * - Intercepts 401 Unauthorized responses
 * - Attempts to call /auth/refresh with HttpOnly cookies
 * - Retries the original request if refresh succeeds
 * - Redirects to /login if refresh fails
 * 
 * Note: Assumes `url` starts with http:// or https://. If a path is provided, it prepends API_URL.
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    // 1. Prepare URL
    const finalUrl = url.startsWith("http") ? url : `${API_URL}${url}`;

    // 2. Prepare headers (attach current access token)
    const headers = new Headers(options.headers || {});
    if (!headers.has("Authorization")) {
        // Only run on client
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("accessToken");
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
        }
    }

    const modifiedOptions: RequestInit = {
        ...options,
        headers,
    };

    // 3. Make initial request
    let response = await fetch(finalUrl, modifiedOptions);

    // 4. Handle 401 Unauthorized
    if (response.status === 401 && typeof window !== "undefined") {
        try {
            // Attempt to refresh token
            const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
                method: "POST",
                credentials: "include", // Essential for sending the HttpOnly refresh token cookie
            });

            const refreshData = await refreshRes.json();

            if (refreshRes.ok && refreshData.success && refreshData.data?.accessToken) {
                // Success! Save new token
                const newAccessToken = refreshData.data.accessToken;
                localStorage.setItem("accessToken", newAccessToken);

                // Update headers and retry the original request
                const retryHeaders = new Headers(options.headers || {});
                retryHeaders.set("Authorization", `Bearer ${newAccessToken}`);

                response = await fetch(finalUrl, {
                    ...options,
                    headers: retryHeaders,
                });
            } else {
                // Refresh failed (e.g. refresh token expired or revoked)
                throw new Error("Refresh failed");
            }
        } catch (error) {
            console.error("Session expired. Redirecting to login...", error);
            // Clear stale token
            localStorage.removeItem("accessToken");
            // Redirect smoothly without breaking React router loop immediately if possible
            window.location.href = "/login";
            // Return the rejected response back to the caller
            return response;
        }
    }

    return response;
}
