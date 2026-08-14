/* =========================================
   LOAD LOGGED-IN OWNER PROFILE
========================================= */

async function loadOwnerProfile() {

    try {

        const token =
            localStorage.getItem(
                "pawsyncToken"
            );


        /* -------------------------
           CHECK LOGIN
        ------------------------- */

        if (!token) {

            console.error(
                "No authentication token found."
            );

            window.location.href =
                "../auth/login/login.html";

            return;

        }


        /* -------------------------
           REQUEST PROFILE
        ------------------------- */

        const response =
            await fetch(
                "http://localhost:5000/api/auth/profile",
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"

                    }

                }
            );


        const data =
            await response.json();


        /* -------------------------
           CHECK RESPONSE
        ------------------------- */

        if (!response.ok) {

            console.error(
                "Profile request failed:",
                data.message
            );

            return;

        }


        /* -------------------------
           DISPLAY OWNER NAME
        ------------------------- */

        const owner =
            data.user;


        if (owner && owner.name) {

            const firstName =
                owner.name.split(" ")[0];


            $("ownerName").textContent =
                firstName;


            $("profileName").textContent =
                firstName;


            $("profileAvatar").textContent =
                firstName
                    .charAt(0)
                    .toUpperCase();

        }


        /* -------------------------
           SAVE OWNER DATA
        ------------------------- */

        window.currentOwner =
            owner;


        console.log(
            "Logged-in owner:",
            owner
        );


    } catch (error) {

        console.error(
            "Error loading owner profile:",
            error
        );

    }

}


/* =========================================
   STATIC PET DATA
   Temporary frontend data
========================================= */

const pets = {

    bruno: {

        id: "pet_001",

        name: "Bruno",

        breed: "Labrador Retriever",

        species: "Dog",

        age: "2 Years",

        gender: "Male",

        weight: "20 kg",

        score: 61,

        message:
            "Attention required: Bruno has several pending health care items.",

        image:
            "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80",

        care: [

            {
                name:
                    "Morning Meal (High Protein Kibble)",

                time:
                    "08:00 AM",

                icon:
                    "🍴",

                completed:
                    true
            },

            {
                name:
                    "Fresh Water Refill & Filter Check",

                time:
                    "09:00 AM",

                icon:
                    "🥤",

                completed:
                    true
            },

            {
                name:
                    "Teeth Brushing & Dental Chew",

                time:
                    "11:30 AM",

                icon:
                    "🦷",

                completed:
                    true
            },

            {
                name:
                    "Evening Park Walk (45 Mins)",

                time:
                    "05:30 PM",

                icon:
                    "🏃",

                completed:
                    false
            },

            {
                name:
                    "Evening Meal & Joint Supplement",

                time:
                    "07:30 PM",

                icon:
                    "🥣",

                completed:
                    false
            }

        ],

        reminders: [

            {
                icon:
                    "💉",

                title:
                    "Rabies Booster",

                detail:
                    "Vaccination • Due 2026-08-18",

                status:
                    "Due Soon",

                className:
                    "warning"
            },

            {
                icon:
                    "✂️",

                title:
                    "Full Grooming Session",

                detail:
                    "2026-08-20",

                status:
                    "Scheduled",

                className:
                    "scheduled"
            },

            {
                icon:
                    "👨‍⚕️",

                title:
                    "Vet: Dr. Ananya Sharma",

                detail:
                    "2026-08-23 at 10:00 AM",

                status:
                    "Vet Appt",

                className:
                    "appointment"
            }

        ]

    },


    kitty: {

        id:
            "pet_002",

        name:
            "Kitty",

        breed:
            "Persian Cat",

        species:
            "Cat",

        age:
            "1 Year",

        gender:
            "Female",

        weight:
            "4.5 kg",

        score:
            86,

        message:
            "Kitty is doing well. Keep her care routine consistent.",

        image:
            "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=500&q=80",

        care: [

            {
                name:
                    "Breakfast",

                time:
                    "08:00 AM",

                icon:
                    "🥣",

                completed:
                    true
            },

            {
                name:
                    "Fresh Water",

                time:
                    "09:00 AM",

                icon:
                    "🥤",

                completed:
                    true
            },

            {
                name:
                    "Brushing",

                time:
                    "11:30 AM",

                icon:
                    "🪮",

                completed:
                    true
            },

            {
                name:
                    "Play Session",

                time:
                    "05:30 PM",

                icon:
                    "🧶",

                completed:
                    false
            },

            {
                name:
                    "Evening Meal",

                time:
                    "07:30 PM",

                icon:
                    "🥣",

                completed:
                    false
            }

        ],

        reminders: [

            {
                icon:
                    "💉",

                title:
                    "FVRCP Booster",

                detail:
                    "Vaccination • Due 2026-09-05",

                status:
                    "Upcoming",

                className:
                    "warning"
            },

            {
                icon:
                    "✂️",

                title:
                    "Grooming",

                detail:
                    "2026-08-24",

                status:
                    "Scheduled",

                className:
                    "scheduled"
            },

            {
                icon:
                    "👨‍⚕️",

                title:
                    "Vet: Dr. Ananya Sharma",

                detail:
                    "2026-08-28 at 11:00 AM",

                status:
                    "Vet Appt",

                className:
                    "appointment"
            }

        ]

    },


    coco: {

        id:
            "pet_003",

        name:
            "Coco",

        breed:
            "Eclectus Parrot",

        species:
            "Parrot",

        age:
            "3 Years",

        gender:
            "Male",

        weight:
            "420 g",

        score:
            92,

        message:
            "Coco is doing great. Continue the current nutrition and activity routine.",

        image:
            "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=500&q=80",

        care: [

            {
                name:
                    "Morning Fruit & Pellets",

                time:
                    "08:00 AM",

                icon:
                    "🥭",

                completed:
                    true
            },

            {
                name:
                    "Fresh Water",

                time:
                    "09:00 AM",

                icon:
                    "🥤",

                completed:
                    true
            },

            {
                name:
                    "Cage Cleaning",

                time:
                    "10:30 AM",

                icon:
                    "🧹",

                completed:
                    true
            },

            {
                name:
                    "Free Flight Time",

                time:
                    "05:30 PM",

                icon:
                    "🦜",

                completed:
                    false
            },

            {
                name:
                    "Evening Meal",

                time:
                    "07:00 PM",

                icon:
                    "🥣",

                completed:
                    false
            }

        ],

        reminders: [

            {
                icon:
                    "💉",

                title:
                    "Routine Health Check",

                detail:
                    "Checkup • 2026-08-26",

                status:
                    "Upcoming",

                className:
                    "warning"
            },

            {
                icon:
                    "🧹",

                title:
                    "Cage Deep Clean",

                detail:
                    "2026-08-21",

                status:
                    "Scheduled",

                className:
                    "scheduled"
            },

            {
                icon:
                    "👨‍⚕️",

                title:
                    "Vet: Dr. Ananya Sharma",

                detail:
                    "2026-09-01 at 09:30 AM",

                status:
                    "Vet Appt",

                className:
                    "appointment"
            }

        ]

    }

};


/* =========================================
   SELECTED PET
========================================= */

let selectedPetKey =
    localStorage.getItem(
        "pawsyncSelectedPet"
    ) || "bruno";


/* =========================================
   SHORT DOM HELPER
========================================= */

const $ =
    (id) =>
        document.getElementById(id);


/* =========================================
   PET SELECTOR
========================================= */

function renderPetSelector() {

    const selector =
        $("petSelector");


    if (!selector) {
        return;
    }


    selector.innerHTML =
        "";


    Object.entries(pets).forEach(
        ([key, pet]) => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                `pet-chip ${
                    key === selectedPetKey
                        ? "selected"
                        : ""
                }`;


            button.type =
                "button";


            button.innerHTML = `

                <img
                    src="${pet.image}"
                    alt="${pet.name}"
                >

                <span class="pet-chip-info">

                    <strong>
                        ${pet.name}
                    </strong>

                    <span>
                        ${pet.breed}
                    </span>

                </span>

            `;


            button.addEventListener(
                "click",
                () =>
                    selectPet(key)
            );


            selector.appendChild(
                button
            );

        }
    );


   const addButton =
    document.createElement(
        "button"
    );

addButton.className =
    "add-pet-chip";

addButton.type =
    "button";

addButton.textContent =
    "+ Add Pet";

addButton.addEventListener(
    "click",
    () => {

        window.location.href =
            "../../addPetForm/addPetForm.html";

    }
);

selector.appendChild(
    addButton
);

}


/* =========================================
   SELECT PET
========================================= */

function selectPet(key) {

    selectedPetKey =
        key;


    localStorage.setItem(
        "pawsyncSelectedPet",
        key
    );


    renderPetSelector();

    renderDashboard();

}


/* =========================================
   RENDER DASHBOARD
========================================= */

function renderDashboard() {

    const pet =
        pets[selectedPetKey];


    if (!pet) {
        return;
    }


    if ($("managingPetName")) {

        $("managingPetName")
            .textContent =
            pet.name;

    }


    if ($("aiPetName")) {

        $("aiPetName")
            .textContent =
            pet.name;

    }


    if ($("petName")) {

        $("petName")
            .textContent =
            pet.name;

    }


    if ($("petMeta")) {

        $("petMeta")
            .textContent =
            `${pet.breed} • ${pet.age} • ${pet.gender} • ${pet.weight}`;

    }


    if ($("healthScore")) {

        $("healthScore")
            .textContent =
            pet.score;

    }


    if ($("healthProgress")) {

        $("healthProgress")
            .style.width =
            `${pet.score}%`;

    }


    if ($("healthMessage")) {

        $("healthMessage")
            .innerHTML = `
                <span>✓</span>
                <span>
                    ${pet.message}
                </span>
            `;

    }


    const image =
        $("petImage");


    if (image) {

        image.src =
            pet.image;

        image.alt =
            pet.name;

    }


    renderCare(
        pet.care
    );


    renderReminders(
        pet.reminders
    );

}


/* =========================================
   RENDER CARE
========================================= */

function renderCare(items) {

    const list =
        $("careList");


    if (!list) {
        return;
    }


    list.innerHTML =
        "";


    items.forEach(
        (item) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                `care-item ${
                    item.completed
                        ? "completed"
                        : ""
                }`;


            row.innerHTML = `

                <button
                    class="check-button"
                    type="button"
                    aria-label="Toggle ${item.name}"
                >
                    ${item.completed ? "✓" : ""}
                </button>

                <span class="care-icon">
                    ${item.icon}
                </span>

                <span>

                    <span class="care-name">
                        ${item.name}
                    </span>

                    <span class="care-time">
                        ${item.time}
                    </span>

                </span>

            `;


            row
                .querySelector(
                    ".check-button"
                )
                .addEventListener(
                    "click",
                    () => {

                        item.completed =
                            !item.completed;

                        renderCare(
                            items
                        );

                    }
                );


            list.appendChild(
                row
            );

        }
    );


    const done =
        items.filter(
            item =>
                item.completed
        ).length;


    if ($("careCount")) {

        $("careCount")
            .textContent =
            `${done} / ${items.length} Done`;

    }

}


/* =========================================
   RENDER REMINDERS
========================================= */

function renderReminders(
    reminders
) {

    const list =
        $("remindersList");


    if (!list) {
        return;
    }


    list.innerHTML =
        "";


    reminders.forEach(
        (item) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "reminder-item";


            row.innerHTML = `

                <span class="reminder-icon">
                    ${item.icon}
                </span>

                <span class="reminder-main">

                    <strong>
                        ${item.title}
                    </strong>

                    <span>
                        ${item.detail}
                    </span>

                </span>

                <span
                    class="reminder-status ${item.className}"
                >
                    ${item.status}
                </span>

            `;


            list.appendChild(
                row
            );

        }
    );

}

/* =========================================
   PROFILE MENU
========================================= */

function setupProfileMenu() {

    const profileButton =
        $("profileButton");


    const profileMenu =
        $("profileMenu");


    if (!profileButton ||
        !profileMenu) {

        return;

    }


    profileButton.addEventListener(
        "click",
        () => {

            profileMenu.classList.toggle(
                "show"
            );

        }
    );


    document.addEventListener(
        "click",
        (event) => {

            if (
                !event.target.closest(
                    ".profile-wrap"
                )
            ) {

                profileMenu.classList.remove(
                    "show"
                );

            }

        }
    );

}


/* =========================================
   MOBILE MENU
========================================= */

function setupMobileMenu() {

    const mobileMenu =
        $("mobileMenu");


    const sidebar =
        $("sidebar");


    if (!mobileMenu ||
        !sidebar) {

        return;

    }


    mobileMenu.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );

        }
    );

}


/* =========================================
   PROFILE MENU → PROFILE PAGE
========================================= */

const profileMenuItem =
    document.getElementById(
        "profileMenuItem"
    );


if (profileMenuItem) {

    profileMenuItem.addEventListener(
        "click",
        function () {

            window.location.href =
                "../../profile/profile.html";

        }
    );

}


/* =========================================
   SETTINGS MENU → SETTINGS PAGE
========================================= */

const settingsMenuItem =
    document.getElementById(
        "settingsMenuItem"
    );


if (settingsMenuItem) {

    settingsMenuItem.addEventListener(
        "click",
        function () {

            window.location.href =
                "../../settings/settings.html";

        }
    );

}


/* =========================================
   LOGOUT
========================================= */

const logoutMenuItem =
    document.getElementById(
        "logoutMenuItem"
    );


if (logoutMenuItem) {

    logoutMenuItem.addEventListener(
        "click",
        function () {

            const confirmed =
                confirm(
                    "Are you sure you want to log out?"
                );


            if (!confirmed) {
                return;
            }


            localStorage.removeItem(
                "pawsyncToken"
            );


            localStorage.removeItem(
                "pawsyncUser"
            );


            window.location.href =
                "../../auth/login/login.html";

        }
    );

}


/* =========================================
   INITIALIZE DASHBOARD
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderPetSelector();

        renderDashboard();

        setupProfileMenu();

        setupMobileMenu();

        loadOwnerProfile();

    }
);

// /* =========================================
//    OWNER DASHBOARD PAGE NAVIGATION

//    IMPORTANT:
//    The sidebar and topbar stay here.

//    Individual pages are loaded inside
//    an iframe so their HTML/CSS/JS remain
//    completely separate.
// ========================================= */

// let originalDashboardHTML =
//     "";


// /* =========================================
//    SAVE ORIGINAL DASHBOARD
// ========================================= */

// document.addEventListener(
//     "DOMContentLoaded",
//     function () {

//         const pageContent =
//             document.getElementById(
//                 "pageContent"
//             );


//         if (!pageContent) {
//             return;
//         }


//         /*
//          * Save the original dashboard
//          * before another page is loaded.
//          */

//         originalDashboardHTML =
//             pageContent.innerHTML;


//         setupOwnerNavigation();

//     }
// );


// /* =========================================
//    SIDEBAR NAVIGATION
// ========================================= */

// function setupOwnerNavigation() {

//     const navItems =
//         document.querySelectorAll(
//             ".nav-item[data-page]"
//         );


//     navItems.forEach(
//         function (item) {

//             item.addEventListener(
//                 "click",
//                 function (event) {

//                     event.preventDefault();


//                     const page =
//                         this.dataset.page;


//                     setActiveNavItem(
//                         this
//                     );


//                     /* -------------------------
//                        DASHBOARD
//                     ------------------------- */

//                     if (
//                         page ===
//                         "dashboard"
//                     ) {

//                         showDashboard();

//                         return;

//                     }


//                     /* -------------------------
//                        MY PETS
//                     ------------------------- */

//                     if (
//                         page ===
//                         "pets"
//                     ) {

//                         loadOwnerPage(
//                             "../../pets/pets.html"
//                         );

//                         return;

//                     }


//                     /* -------------------------
//                        APPOINTMENTS
//                     ------------------------- */

//                     if (
//                         page ===
//                         "appointments"
//                     ) {

//                         loadOwnerPage(
//                             "../../appointments/appointments.html"
//                         );

//                         return;

//                     }


//                     /* -------------------------
//                        ANALYTICS
//                     ------------------------- */

//                     if (
//                         page ===
//                         "analytics"
//                     ) {

//                         loadOwnerPage(
//                             "../../analytics/analytics.html"
//                         );

//                         return;

//                     }


//                     /* -------------------------
//                        HEALTH
//                     ------------------------- */

//                     if (
//                         page ===
//                         "health"
//                     ) {

//                         loadOwnerPage(
//                             "../../health/health.html"
//                         );

//                         return;

//                     }


//                     /* -------------------------
//                        VACCINATION
//                     ------------------------- */

//                     if (
//                         page ===
//                         "vaccination"
//                     ) {

//                         loadOwnerPage(
//                             "../../vaccination/vaccination.html"
//                         );

//                         return;

//                     }


//                     /* -------------------------
//                        NUTRITION
//                     ------------------------- */

//                     if (
//                         page ===
//                         "nutrition"
//                     ) {

//                         loadOwnerPage(
//                             "../../nutrition/nutrition.html"
//                         );

//                         return;

//                     }


//                     /* -------------------------
//                        GROOMING
//                     ------------------------- */

//                     if (
//                         page ===
//                         "grooming"
//                     ) {

//                         loadOwnerPage(
//                             "../../grooming/grooming.html"
//                         );

//                         return;

//                     }


//                     /* -------------------------
//                        ACTIVITY
//                     ------------------------- */

//                     if (
//                         page ===
//                         "activity"
//                     ) {

//                         loadOwnerPage(
//                             "../../activity/activity.html"
//                         );

//                         return;

//                     }


//                     /* -------------------------
//                        DENTAL CARE
//                     ------------------------- */

//                     if (
//                         page ===
//                         "dental"
//                     ) {

//                         loadOwnerPage(
//                             "../../dental-care/dental-care.html"
//                         );

//                         return;

//                     }


//                     /* -------------------------
//                        MEDICAL VAULT
//                     ------------------------- */

//                     if (
//                         page ===
//                         "medical-vault"
//                     ) {

//                         loadOwnerPage(
//                             "../../medical-vault/medical-vault.html"
//                         );

//                         return;

//                     }


//                     console.log(
//                         "Page not connected yet:",
//                         page
//                     );

//                 }
//             );

//         }
//     );

// }


// /* =========================================
//    ACTIVE SIDEBAR ITEM
// ========================================= */

// function setActiveNavItem(
//     activeItem
// ) {

//     const navItems =
//         document.querySelectorAll(
//             ".nav-item[data-page]"
//         );


//     navItems.forEach(
//         function (item) {

//             item.classList.remove(
//                 "active"
//             );

//         }
//     );


//     activeItem.classList.add(
//         "active"
//     );

// }


// /* =========================================
//    LOAD PAGE INSIDE DASHBOARD
// ========================================= */

// function loadOwnerPage(
//     pagePath
// ) {

//     const pageContent =
//         document.getElementById(
//             "pageContent"
//         );


//     if (!pageContent) {
//         return;
//     }


//     /*
//      * embedded=true tells the individual
//      * page that it is being displayed
//      * inside the owner dashboard.
//      */

//     const separator =
//         pagePath.includes("?")
//             ? "&"
//             : "?";


//     const embeddedPage =
//         `${pagePath}${separator}embedded=true`;


//     pageContent.innerHTML = `

//         <iframe
//             class="owner-page-frame"
//             src="${embeddedPage}"
//             title="PawSync Page"
//         ></iframe>

//     `;

// }


// /* =========================================
//    RETURN TO DASHBOARD
// ========================================= */

// function showDashboard() {

//     const pageContent =
//         document.getElementById(
//             "pageContent"
//         );


//     if (!pageContent) {
//         return;
//     }


//     /*
//      * Remove the iframe.
//      */

//     pageContent.innerHTML =
//         originalDashboardHTML;


//     /*
//      * Reconnect dashboard functionality.
//      */

//     renderPetSelector();

//     renderDashboard();

// }


// /* =========================================
//    OWNER PAGE FRAME
// ========================================= */

// function setupOwnerPageFrame() {

//     const pageContent =
//         document.getElementById(
//             "pageContent"
//         );


//     if (!pageContent) {
//         return;
//     }


//     /*
//      * This function is intentionally
//      * kept separate so we can later
//      * add loading/error handling.
//      */

// }


// /* =========================================
//    END OWNER DASHBOARD NAVIGATION
// ========================================= */

