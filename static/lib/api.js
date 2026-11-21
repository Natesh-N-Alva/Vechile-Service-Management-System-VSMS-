export async function fetchWithAuth(url, options = {}) {
    // 1. Safety check for Next.js (ensures we are in the browser before using sessionStorage)
    let token = null;
    if (typeof window !== 'undefined') {
        token = sessionStorage.getItem('authToken');
    }

    // 2. Set up the headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    // 3. Make the actual network request
    const response = await fetch(url, { ...options, headers });

    // 4. Global Error Catcher: If Flask says the token is invalid or expired (401 or 422)
    // lib/api.js
if (response.status === 401 || response.status === 422) {
    console.error("Authentication failed or token expired. Logging out.");
    // Only clear and redirect if the token actually existed but was rejected
    if (typeof window !== 'undefined' && sessionStorage.getItem('authToken')) {
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('loggedInUser');
        window.location.href = '/login'; 
    }
}

    return response;
}