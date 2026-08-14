window.PawSyncAuth = {
    getToken() {
        return localStorage.getItem("pawsyncToken");
    },

    setToken(token) {
        localStorage.setItem("pawsyncToken", token);
    },

    logout() {
        localStorage.removeItem("pawsyncToken");
        window.location.href = "../../auth/login/login.html";
    }
};
