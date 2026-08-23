function getApiBaseUrl() {
    if (typeof window !== "undefined" && window.location && window.location.protocol === "file:") {
        return "http://localhost:5000/api";
    }
    return "/api";
}

window.getApiBaseUrl = getApiBaseUrl;

window.PawSyncAPI = {
    baseURL: getApiBaseUrl(),

    async request(endpoint, options = {}) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        return response.json();
    }
};

