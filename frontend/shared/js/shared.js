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

                dental:
                    "/frontend/dental/dental.html",


                /* =========================
                   RECORDS
                ========================= */

                medicalVault:
                    "/frontend/medicalVault/medicalVault.html",

                appointments:
                    "/frontend/appointments/appointments.html",

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
   NAVBAR
========================================= */

function setupNavbar() {

    setupProfileDropdown();

    setupNotificationButton();

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

            profileMenu.classList.toggle(
                "show"
            );

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

                profileMenu.classList.remove(
                    "show"
                );

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


                /*
                 Clear login/session data
                 if your project uses these.
                */

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "user"
                );


                window.location.href =
                    "/frontend/auth/login/login.html";

            }
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
                "/frontend/alerts/alerts.html";

        }
    );

}