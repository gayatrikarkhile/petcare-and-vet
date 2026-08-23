/* =========================================
   SHARED COMPONENTS
   Navbar + Sidebar
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadSharedComponents();

    }
);


/* =========================================
   LOAD SHARED COMPONENTS
========================================= */

async function loadSharedComponents() {

    const sharedPath =
        document.body.dataset.sharedPath;


    if (!sharedPath) {

        console.error(
            "Shared path is missing."
        );

        return;

    }


    /* =========================================
       LOAD SIDEBAR
    ========================================= */

    const sidebarContainer =
        document.getElementById(
            "sidebar-container"
        );


    if (sidebarContainer) {

        try {

            const response =
                await fetch(
                    `${sharedPath}/sidebar.html`
                );


            if (!response.ok) {

                throw new Error(
                    `Sidebar loading failed: ${response.status}`
                );

            }


            sidebarContainer.innerHTML =
                await response.text();


            /*
             IMPORTANT:
             Setup sidebar navigation AFTER
             sidebar.html has been loaded.
            */

            setupSidebarNavigation();
            updateActiveSidebarItem();


        } catch (error) {

            console.error(
                "Error loading sidebar:",
                error
            );

        }

    }


    /* =========================================
       LOAD NAVBAR
    ========================================= */

    const navbarContainer =
        document.getElementById(
            "navbar-container"
        );


    if (navbarContainer) {

        try {

            const response =
                await fetch(
                    `${sharedPath}/navbar.html`
                );


            if (!response.ok) {

                throw new Error(
                    `Navbar loading failed: ${response.status}`
                );

            }


            navbarContainer.innerHTML =
                await response.text();


            /*
             Navbar is loaded dynamically,
             so initialize its dropdown
             AFTER it has been inserted.
            */

            setupNavbar();


        } catch (error) {

            console.error(
                "Error loading navbar:",
                error
            );

        }

    }

}


/* =========================================
   SIDEBAR NAVIGATION
========================================= */

function setupSidebarNavigation() {

    const sidebar =
        document.getElementById(
            "sidebar-container"
        );


    if (!sidebar) {

        console.warn(
            "Sidebar container not found."
        );

        return;

    }


    /*
     Prevent duplicate listeners
     if this function is called again.
    */

    if (
        sidebar.dataset.navigationReady ===
        "true"
    ) {

        return;

    }


    sidebar.dataset.navigationReady =
        "true";


    sidebar.addEventListener(
        "click",
        (event) => {


            /* =================================
               FIND CLICKED NAV ITEM
            ================================= */

            const navItem =
                event.target.closest(
                    ".nav-item"
                );


            if (!navItem) {

                return;

            }


            /* =================================
               GET PAGE NAME
            ================================= */

            const page =
                navItem.dataset.page;


            if (!page) {

                console.warn(
                    "No data-page found on:",
                    navItem
                );

                return;

            }


            /* =================================
               PAGE PATHS
            ================================= */

            const pages = {

                /* =========================
                   MAIN
                ========================= */

                dashboard:
                    "/frontend/owner/dashboard/ownerdashboard.html",

                pets:
                    "/frontend/pets/pets.html",


                /* =========================
                   PET CARE
                ========================= */

                health:
                    "/frontend/health/health.html",

                vaccination:
                    "/frontend/vaccination/vaccination.html",

                nutrition:
                    "/frontend/nutrition/nutrition.html",

                grooming:
                    "/frontend/grooming/grooming.html",

                activity:
                    "/frontend/activity/activity.html",

                nearby:
                    "/frontend/nearby/nearby.html",

                dental:
                    "/frontend/grooming/grooming.html",


                /* =========================
                   RECORDS
                ========================= */

                medicalVault:
                    "/frontend/medicalVault/medicalVault.html",

                appointments:
                    "/frontend/appointments/appointments.html",

                prescriptions:
                    "/frontend/prescriptions/prescriptions.html",

                calendar:
                    "/frontend/calendar/calendar.html",


                /* =========================
                   INSIGHTS
                ========================= */

                analytics:
                    "/frontend/analytics/analytics.html",

                aiAssistant:
                    "/frontend/ai-assistant/ai-assistant.html",


                /* =========================
                   OTHER
                ========================= */

                alerts:
                    "/frontend/alerts/alerts.html",

                settings:
                    "/frontend/settings/settings.html",

                profile:
                    "/frontend/profile/profile.html"

            };


            /* =================================
               CHECK PAGE
            ================================= */

            if (pages[page]) {

                window.location.href =
                    pages[page];

            } else {

                console.warn(
                    `No page path defined for: ${page}`
                );

            }

        }
    );

}

/* =========================================
   UPDATE ACTIVE SIDEBAR ITEM
========================================= */

function updateActiveSidebarItem() {
    const sidebar = document.getElementById("sidebar-container");
    if (!sidebar) return;

    const navItems = sidebar.querySelectorAll(".nav-item");
    if (!navItems || navItems.length === 0) return;

    const currentPath = window.location.pathname.toLowerCase();

    navItems.forEach(item => {
        item.classList.remove("active");

        const page = (item.dataset.page || "").toLowerCase();
        const href = (item.getAttribute("href") || "").toLowerCase();

        let isMatch = false;

        if (page) {
            if (page === "dashboard" && (currentPath.includes("dashboard") || currentPath.includes("ownerdashboard"))) {
                isMatch = true;
            } else if (page === "pets" && (currentPath.includes("pets") || currentPath.includes("my-pets"))) {
                isMatch = true;
            } else if (page === "vaccination" && currentPath.includes("vaccination")) {
                isMatch = true;
            } else if (page === "nutrition" && currentPath.includes("nutrition")) {
                isMatch = true;
            } else if (page === "grooming" && currentPath.includes("grooming")) {
                isMatch = true;
            } else if (page === "activity" && currentPath.includes("activity")) {
                isMatch = true;
            } else if ((page === "medical-vault" || page === "medicalvault") && (currentPath.includes("medicalvault") || currentPath.includes("medical-vault"))) {
                isMatch = true;
            } else if (page === "appointments" && currentPath.includes("appointments")) {
                isMatch = true;
            } else if (page === "prescriptions" && currentPath.includes("prescriptions")) {
                isMatch = true;
            } else if (page === "analytics" && currentPath.includes("analytics")) {
                isMatch = true;
            } else if ((page === "ai-assistant" || page === "aiassistant") && (currentPath.includes("ai-assistant") || currentPath.includes("aiassistant"))) {
                isMatch = true;
            } else if (page === "alerts" && currentPath.includes("alerts")) {
                isMatch = true;
            } else if (page === "settings" && currentPath.includes("settings")) {
                isMatch = true;
            }
        }

        if (!isMatch && href && href !== "#") {
            const hrefFileName = href.split("/").pop().replace(".html", "").toLowerCase();
            const currentFileName = currentPath.split("/").pop().replace(".html", "").toLowerCase();
            if (hrefFileName && currentFileName && hrefFileName === currentFileName) {
                isMatch = true;
            }
        }

        if (isMatch) {
            item.classList.add("active");
        }
    });
}

window.addEventListener("popstate", updateActiveSidebarItem);


/* =========================================
   NAVBAR
========================================= */

function setupNavbar() {

    setupProfileDropdown();

    setupNotificationButton();
    updateNavbarNotificationBadge();
    loadNavbarProfile();
    updateNavbarManagingPetName();
    setupNavbarSearch();

}

/* =========================================
   SEARCH BAR & QUICK NAV
========================================= */

function setupNavbarSearch() {
    const searchBox = document.querySelector(".search-box");
    const searchInput = searchBox ? searchBox.querySelector("input") : null;
    if (!searchBox || !searchInput) return;

    if (searchInput.dataset.searchReady === "true") return;
    searchInput.dataset.searchReady = "true";

    let dropdown = document.querySelector(".search-results-dropdown");
    if (!dropdown) {
        dropdown = document.createElement("div");
        dropdown.className = "search-results-dropdown";
        searchBox.appendChild(dropdown);
    }

    document.addEventListener("keydown", (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
            e.preventDefault();
            searchInput.focus();
        }
    });

    const searchTargets = [
        { title: "Dashboard", category: "Navigation", icon: "🏠", url: "/frontend/owner/dashboard/ownerdashboard.html" },
        { title: "My Pets", category: "Navigation", icon: "🐾", url: "/frontend/pets/pets.html" },
        { title: "Vaccination", category: "Pet Care", icon: "💉", url: "/frontend/vaccination/vaccination.html" },
        { title: "Nutrition", category: "Pet Care", icon: "🍲", url: "/frontend/nutrition/nutrition.html" },
        { title: "Grooming", category: "Pet Care", icon: "✂️", url: "/frontend/grooming/grooming.html" },
        { title: "Activity", category: "Pet Care", icon: "🏃", url: "/frontend/activity/activity.html" },
        { title: "Medical Vault", category: "Records", icon: "📁", url: "/frontend/medicalVault/medicalVault.html" },
        { title: "Appointments", category: "Records", icon: "👤", url: "/frontend/appointments/appointments.html" },
        { title: "Analytics", category: "Insights", icon: "📊", url: "/frontend/analytics/analytics.html" }
    ];

    const handleSearch = async () => {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) {
            dropdown.classList.remove("show");
            return;
        }

        dropdown.innerHTML = "";

        let petResults = [];
        const token = localStorage.getItem("pawsyncToken");
        if (token) {
            try {
                const res = await fetch("/api/pets", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok && data.success && Array.isArray(data.pets)) {
                    petResults = data.pets.filter(p => (p.petName || "").toLowerCase().includes(query) || (p.species || "").toLowerCase().includes(query));
                }
            } catch (err) {}
        }

        const filteredTargets = searchTargets.filter(t => t.title.toLowerCase().includes(query) || t.category.toLowerCase().includes(query));

        if (petResults.length === 0 && filteredTargets.length === 0) {
            dropdown.innerHTML = `<div style="padding:10px 12px; font-size:0.85rem; color:#64748b; text-align:center;">No matching records found.</div>`;
            dropdown.classList.add("show");
            return;
        }

        petResults.forEach(pet => {
            const item = document.createElement("div");
            item.className = "search-result-item";
            item.innerHTML = `
                <span class="search-result-icon">🐾</span>
                <span class="search-result-title">${pet.petName} (${pet.species})</span>
                <span class="search-result-category">Pet Profile</span>
            `;
            item.addEventListener("click", () => {
                localStorage.setItem("pawsyncSelectedPet", pet._id);
                window.location.href = "/frontend/petProfile/petProfile.html";
            });
            dropdown.appendChild(item);
        });

        filteredTargets.forEach(target => {
            const item = document.createElement("div");
            item.className = "search-result-item";
            item.innerHTML = `
                <span class="search-result-icon">${target.icon}</span>
                <span class="search-result-title">${target.title}</span>
                <span class="search-result-category">${target.category}</span>
            `;
            item.addEventListener("click", () => {
                window.location.href = target.url;
            });
            dropdown.appendChild(item);
        });

        dropdown.classList.add("show");
    };

    searchInput.addEventListener("input", handleSearch);
    searchInput.addEventListener("focus", handleSearch);

    document.addEventListener("click", (e) => {
        if (!searchBox.contains(e.target)) {
            dropdown.classList.remove("show");
        }
    });
}

/* =========================================
   PROFILE DROPDOWN
========================================= */

function setupProfileDropdown() {

    const profileButton =
        document.getElementById(
            "profileButton"
        );

    const profileMenu =
        document.getElementById(
            "profileMenu"
        );


    if (
        !profileButton ||
        !profileMenu
    ) {

        return;

    }


    /*
     Prevent duplicate listeners.
    */

    if (
        profileButton.dataset.ready ===
        "true"
    ) {

        return;

    }


    profileButton.dataset.ready =
        "true";


    /* =====================================
       OPEN / CLOSE DROPDOWN
    ===================================== */

    profileButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            profileMenu.classList.toggle("show");
            profileMenu.classList.toggle("active");

        }
    );


    /* =====================================
       CLOSE WHEN CLICKING OUTSIDE
    ===================================== */

    document.addEventListener(
        "click",
        (event) => {

            if (
                !profileMenu.contains(
                    event.target
                ) &&
                !profileButton.contains(
                    event.target
                )
            ) {

                profileMenu.classList.remove("show");
                profileMenu.classList.remove("active");

            }

        }
    );


    /* =====================================
       PROFILE
    ===================================== */

    const profileMenuItem =
        document.getElementById(
            "profileMenuItem"
        );


    if (profileMenuItem) {

        profileMenuItem.addEventListener(
            "click",
            () => {

                window.location.href =
                    "/frontend/profile/profile.html";

            }
        );

    }


    /* =====================================
       SETTINGS
    ===================================== */

    const settingsMenuItem =
        document.getElementById(
            "settingsMenuItem"
        );


    if (settingsMenuItem) {

        settingsMenuItem.addEventListener(
            "click",
            () => {

                window.location.href =
                    "/frontend/settings/settings.html";

            }
        );

    }


    /* =====================================
       LOGOUT
    ===================================== */

    const logoutMenuItem =
        document.getElementById(
            "logoutMenuItem"
        );


    if (logoutMenuItem) {

        logoutMenuItem.addEventListener(
            "click",
            () => {

                const confirmed =
                    confirm(
                        "Are you sure you want to logout?"
                    );


                if (!confirmed) {

                    return;

                }


                localStorage.removeItem("pawsyncToken");
                localStorage.removeItem("token");
                localStorage.removeItem("pawsyncUser");
                localStorage.removeItem("user");
                localStorage.removeItem("pawsyncSelectedPet");


                window.location.href =
                    "/frontend/auth/login/login.html";

            }
        );

    }

}

/* =========================================
   UPDATE NAVBAR MANAGING PET NAME
========================================= */

async function updateNavbarManagingPetName(petIdOrName) {
    const managingEl = document.getElementById("managingPetName");
    if (!managingEl) return;

    if (!petIdOrName) {
        petIdOrName = localStorage.getItem("pawsyncSelectedPet");
    }

    if (!petIdOrName) {
        managingEl.textContent = "Pet";
        return;
    }

    if (typeof petIdOrName === "string" && petIdOrName.length === 24 && /^[0-9a-fA-F]{24}$/.test(petIdOrName)) {
        const token = localStorage.getItem("pawsyncToken");
        if (token) {
            try {
                const res = await fetch(`/api/pets/${petIdOrName}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok && data.success && data.pet) {
                    managingEl.textContent = data.pet.petName;
                    return;
                }
            } catch (err) {}
        }
    }

    managingEl.textContent = petIdOrName;
}
window.updateNavbarManagingPetName = updateNavbarManagingPetName;

/* =========================================
   LOAD NAVBAR PROFILE
========================================= */

async function loadNavbarProfile() {

    const profileAvatar =
        document.getElementById(
            "profileAvatar"
        );

    const navbarProfileImage =
        document.getElementById(
            "navbarProfileImage"
        );

    const navbarProfileInitial =
        document.getElementById(
            "navbarProfileInitial"
        );

    const profileName =
        document.getElementById(
            "profileName"
        );


    if (
        !profileAvatar ||
        !navbarProfileImage ||
        !navbarProfileInitial
    ) {

        return;

    }


    const token =
        localStorage.getItem(
            "pawsyncToken"
        );


    if (!token) {

        console.log(
            "No PawSync token found."
        );

        return;

    }


    try {

        const response =
            await fetch(
                "/api/auth/profile",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            console.error(
                "Navbar profile error:",
                data
            );

            return;

        }


        const user =
            data.user || data;

            //this is for the testing 
            console.log(
    "NAVBAR USER DATA:",
    user
);

console.log(
    "PROFILE PHOTO:",
    user.profilePhoto
);


        /* =====================================
           USER NAME
        ===================================== */

        if (
            user.name
        ) {

            const firstName =
                user.name
                    .trim()
                    .split(/\s+/)[0];

            if (profileName) {
                profileName.textContent =
                    firstName;
            }

            const ownerNameEl =
                document.getElementById("ownerName");

            if (ownerNameEl) {
                ownerNameEl.textContent =
                    firstName;
            }

        }


        /* =====================================
           PROFILE PHOTO
        ===================================== */

        if (
            user.profilePhoto
        ) {

            navbarProfileImage.src =
                user.profilePhoto;

            navbarProfileImage.style.display =
                "block";

            navbarProfileInitial.style.display =
                "none";

        }
        else {

            navbarProfileImage.src =
                "";

            navbarProfileImage.style.display =
                "none";

            navbarProfileInitial.textContent =
                (user.name || "U")
                    .charAt(0)
                    .toUpperCase();

            navbarProfileInitial.style.display =
                "flex";

        }


    }
    catch (error) {

        console.error(
            "Unable to load navbar profile:",
            error
        );

    }

}




/* =========================================
   NOTIFICATION BUTTON
========================================= */

function setupNotificationButton() {

    const notificationButton =
        document.getElementById(
            "notificationButton"
        );

    if (!notificationButton) {
        return;
    }

    if (
        notificationButton.dataset.ready ===
        "true"
    ) {
        return;
    }

    notificationButton.dataset.ready =
        "true";

    notificationButton.addEventListener(
        "click",
        () => {
            window.location.href =
                "/frontend/notifications/notifications.html";
        }
    );

    updateNavbarNotificationBadge();
}

async function updateNavbarNotificationBadge() {
    const notificationButton = document.getElementById("notificationButton");
    if (!notificationButton) return;

    const countBadge = notificationButton.querySelector(".notification-count");
    if (!countBadge) return;

    const token = localStorage.getItem("pawsyncToken");
    if (!token) return;

    try {
        const res = await fetch("/api/notifications", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
            const count = data.unreadCount || 0;
            countBadge.textContent = count;
            if (count === 0) {
                countBadge.style.display = "none";
            } else {
                countBadge.style.display = "flex";
            }
        }
    } catch (err) {
        console.error("Error updating notification badge:", err);
    }
}
window.updateNavbarNotificationBadge = updateNavbarNotificationBadge;