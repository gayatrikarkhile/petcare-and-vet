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
                owner.name.trim().replace(/^Dr\.\s*/i, "").split(" ")[0];


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
   DYNAMIC PET DATA (LOADED FROM BACKEND)
========================================= */

let pets = {};

/* =========================================
   LOAD REAL PETS FROM BACKEND
========================================= */

async function loadOwnerPets() {

    try {

        const token =
            localStorage.getItem("pawsyncToken");

        if (!token) {

            console.error(
                "No authentication token found."
            );

            return;
        }


        const response =
            await fetch(
                "http://localhost:5000/api/pets",
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


        console.log(
            "OWNER PETS FROM BACKEND:",
            data
        );


        if (!response.ok || !data.success) {

            console.error(
                "Unable to load pets:",
                data.message
            );

            return;
        }


        console.log(
            "TOTAL PETS:",
            data.pets.length
        );


        console.log(
            "PET DATA:",
            data.pets
        );


        /* ---------------------------------
           CONVERT DATABASE PETS
           INTO DASHBOARD FORMAT
        --------------------------------- */

        pets = {};


        data.pets.forEach(
            (pet) => {

                const key =
                    pet._id;


                pets[key] = {

                    id:
                        pet._id,

                    name:
                        pet.petName,

                    breed:
                        pet.breed || "Breed not specified",

                    species:
                        pet.species,

                    age:
                        "Age not available",

                    gender:
                        pet.gender,

                    weight:
                        pet.currentWeight
                            ? `${pet.currentWeight.value} ${pet.currentWeight.unit}`
                            : "Weight not available",

                    score:
                        0,

                    message:
                        `${pet.petName}'s health information is ready to be managed.`,

                    image:
                        pet.petPhoto || "",

                    care:
                        [],

                    reminders:
                        []

                };

            }
        );


        /* ---------------------------------
           SELECT FIRST REAL PET
        --------------------------------- */

        if (data.pets.length > 0) {
            if (!selectedPetKey || !pets[selectedPetKey]) {
                selectedPetKey = data.pets[0]._id;
                localStorage.setItem("pawsyncSelectedPet", selectedPetKey);
            }
        }

        renderPetSelector();
        renderPetGarden(data.pets, selectedPetKey);
        if (selectedPetKey) {
            loadPetDashboard(selectedPetKey);
        }


    } catch (error) {

        console.error(
            "Load pets error:",
            error
        );

    }

}


/* =========================================
   SELECTED PET
========================================= */

let selectedPetKey =
    localStorage.getItem(
        "pawsyncSelectedPet"
    ) || "";

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

/* =========================================
   ✨ PAWSYNC PET GARDEN RENDERER
========================================= */

function renderPetGarden(petsList, selectedPetId) {
    const stage = document.getElementById("petGardenStage");
    if (!stage) return;

    stage.innerHTML = "";

    const petsArray = Array.isArray(petsList) ? petsList : Object.values(petsList || {});

    if (!petsArray || petsArray.length === 0) {
        stage.innerHTML = `
            <div style="text-align:center; padding: 20px; color: #0d9588;">
                <p style="font-size:2.5rem; margin:0 0 8px 0;">🐾</p>
                <p style="font-weight:600; margin:0;">No pets added yet. Add a pet to see them in the garden!</p>
            </div>
        `;
        return;
    }

    petsArray.forEach(pet => {
        const petId = pet._id || pet.id;
        const isSelected = String(petId) === String(selectedPetId);

        const species = (pet.species || pet.type || "").toLowerCase();
        let animClass = "pet-anim-default";
        let defaultEmoji = "🐾";

        if (species.includes("dog")) {
            animClass = "pet-anim-dog";
            defaultEmoji = "🐶";
        } else if (species.includes("cat")) {
            animClass = "pet-anim-cat";
            defaultEmoji = "🐱";
        } else if (species.includes("bird") || species.includes("finch") || species.includes("parrot")) {
            animClass = "pet-anim-bird";
            defaultEmoji = "🐦";
        } else if (species.includes("rabbit") || species.includes("bunny")) {
            animClass = "pet-anim-rabbit";
            defaultEmoji = "🐰";
        }

        const card = document.createElement("div");
        card.className = `garden-pet-card ${isSelected ? "selected-pet-highlight" : ""}`;
        card.setAttribute("title", `Select ${pet.petName || pet.name}`);

        const petPhoto = pet.petPhoto || pet.image;
        let avatarContent = `<span class="emoji-avatar">${defaultEmoji}</span>`;
        if (petPhoto) {
            avatarContent = `<img src="${petPhoto}" alt="${pet.petName || pet.name}" />`;
        }

        card.innerHTML = `
            <div class="garden-pet-avatar ${animClass}">
                ${avatarContent}
            </div>
            <span class="garden-pet-name">${pet.petName || pet.name}</span>
        `;

        card.addEventListener("click", () => {
            selectPet(petId);
        });

        stage.appendChild(card);
    });
}

function selectPet(key) {
    selectedPetKey = key;
    localStorage.setItem("pawsyncSelectedPet", key);

    renderPetSelector();
    renderPetGarden(pets, key);
    loadPetDashboard(key);
}

/* =========================================
   LOAD PROFILE COMPLETION
========================================= */

async function loadProfileCompletion(petId) {

    try {

        if (!petId) {
            console.warn("No pet ID available for profile completion.");
            return;
        }

        const token =
            localStorage.getItem("pawsyncToken");

        if (!token) {
            console.warn("Authentication token not found.");
            return;
        }

        const response = await fetch(
            `http://localhost:5000/api/pets/${petId}/profile-completion`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const data = await response.json();

        console.log(
            "PROFILE COMPLETION:",
            data
        );

        if (!response.ok || !data.success) {

            console.error(
                "Profile completion failed:",
                data.message
            );

            return;
        }

        updateProfileCompletion(
            data.completion
        );

    } catch (error) {

        console.error(
            "Error loading profile completion:",
            error
        );

    }
}

/* =========================================
   UPDATE PROFILE COMPLETION UI
========================================= */

function updateProfileCompletion(completion) {

    const percentElement =
        document.getElementById(
            "profileCompletionPercent"
        );

    const progressElement =
        document.getElementById(
            "profileCompletionProgress"
        );

    const messageElement =
        document.getElementById(
            "profileCompletionMessage"
        );

    const buttonElement =
        document.getElementById(
            "completeProfileButton"
        );


    if (!percentElement ||
        !progressElement ||
        !messageElement) {

        console.warn(
            "Profile completion elements not found."
        );

        return;
    }


    const percent = Math.max(
        0,
        Math.min(
            100,
            Number(completion) || 0
        )
    );


    /* Percentage text */

    percentElement.textContent =
        `${percent}%`;


    /* Progress bar */

    progressElement.style.width =
        `${percent}%`;


    /* Message */

    if (percent >= 100) {

        messageElement.textContent =
            "Your pet profile is complete. Personalized care schedules are ready.";

        if (buttonElement) {
            buttonElement.style.display =
                "none";
        }

    } else {

        messageElement.textContent =
            "Complete your pet profile to unlock personalized care schedules.";

        if (buttonElement) {
            buttonElement.style.display =
                "inline-block";
        }

    }

}
/* =========================================
   RENDER DASHBOARD
========================================= */

/* =========================================
   DYNAMIC DASHBOARD LOADER
========================================= */

async function loadPetDashboard(petId) {
    if (!petId) return;
    const token = localStorage.getItem("pawsyncToken");
    if (!token) return;

    try {
        const response = await fetch(`http://localhost:5000/api/pets/dashboard/${petId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();

        if (response.ok && data.success && data.dashboard) {
            const db = data.dashboard;
            const p = db.pet;

            // 1. PET CARD
            if ($("managingPetName")) $("managingPetName").textContent = p.name;
            if ($("aiPetName")) $("aiPetName").textContent = p.name;
            if ($("petName")) $("petName").textContent = p.name;

            if ($("petMeta")) {
                $("petMeta").textContent = `${p.breed} • ${p.age} • ${p.gender} • ${p.weight}`;
            }

            if ($("petImage") && p.image) {
                $("petImage").src = p.image;
                $("petImage").alt = p.name;
            }

            // 2. HEALTH SCORE
            if ($("healthScore")) $("healthScore").textContent = db.healthScore;
            if ($("healthProgress")) $("healthProgress").style.width = `${db.healthScore}%`;
            if ($("healthMessage")) {
                $("healthMessage").innerHTML = `
                    <span>✓</span>
                    <span>${p.name}'s health information is ready to be managed.</span>
                `;
            }

            // 3. PROFILE COMPLETION
            updateProfileCompletion(db.profileCompletion);

            // 4. TODAY'S CARE
            renderTodayCare(db.todayCare, petId);

            // 5. UPCOMING REMINDERS & APPOINTMENTS
            renderUpcomingReminders(db.upcomingReminders);
            renderAppointments(db.appointments);

            // 6. PET CARE PROGRESS CARD
            if (db.careProgress) {
                const cp = db.careProgress;
                if ($("cardOverallPct")) $("cardOverallPct").textContent = `${cp.overall}%`;
                if ($("cardOverallFill")) $("cardOverallFill").style.width = `${cp.overall}%`;
                if ($("cardNutPct")) $("cardNutPct").textContent = `${cp.nutrition}%`;
                if ($("cardGroomPct")) $("cardGroomPct").textContent = `${cp.grooming}%`;
                if ($("cardActPct")) $("cardActPct").textContent = `${cp.activity}%`;
                if ($("cardVacPct")) $("cardVacPct").textContent = `${cp.vaccination}%`;
            }

            // 7. CARE STREAK CARD
            if (db.careStreak) {
                const cs = db.careStreak;
                if ($("cardStreakValue")) $("cardStreakValue").textContent = `${cs.current} ${cs.current === 1 ? 'Day' : 'Days'}`;
                if ($("cardStreakMsg")) $("cardStreakMsg").textContent = cs.message || "You've completed your care routines for consecutive days. Keep it going! 🐾";
            }

            // 8. AI PET INSIGHT CARD
            if (db.aiInsight && $("cardAiInsightText")) {
                $("cardAiInsightText").textContent = db.aiInsight.text || `${p.name}'s care plan is active and running smoothly. 🐾`;
            }

            // 9. NEXT CARE CARD
            if (db.nextCare) {
                const nc = db.nextCare;
                if ($("cardNextCareIcon")) $("cardNextCareIcon").textContent = nc.icon || "📅";
                if ($("cardNextCareTitle")) $("cardNextCareTitle").textContent = nc.title || "No upcoming care";
                if ($("cardNextCareDetail")) $("cardNextCareDetail").textContent = nc.detail || "You're all caught up!";
                if ($("cardNextCareDays")) {
                    $("cardNextCareDays").textContent = nc.daysRemaining > 0 ? `${nc.daysRemaining} ${nc.daysRemaining === 1 ? 'day' : 'days'} remaining` : "Today / Up to date";
                }
                if ($("cardNextCareLink") && nc.navUrl) {
                    $("cardNextCareLink").href = nc.navUrl;
                }
            }
        }
    } catch (err) {
        console.error("Error loading pet dashboard data:", err);
    }
}

function renderTodayCare(todayCare, petId) {
    const list = $("careList");
    const countEl = $("careCount");
    if (!list) return;

    list.innerHTML = "";

    const tasks = todayCare.tasks || [];
    const completed = todayCare.completed || 0;
    const total = todayCare.total || 0;

    if (countEl) {
        if (total === 0) {
            countEl.textContent = "0 / 0 Done";
        } else {
            countEl.textContent = `${completed} / ${total} Done`;
        }
    }

    if (tasks.length === 0) {
        let emptyMsg = "📅 No care tasks scheduled for today.";
        if (!todayCare.nutritionAvailable && !todayCare.groomingAvailable) {
            emptyMsg = "Nutrition & Grooming schedules not generated yet. Complete pet profiles to view daily care.";
        }
        list.innerHTML = `
            <div style="padding: 36px 16px; text-align: center; color: #64748b; font-size: 0.95rem;">
                <p style="margin: 0 0 8px 0; font-size: 2rem;">📅</p>
                <p style="margin: 0; font-weight: 500; line-height: 1.4;">${emptyMsg}</p>
            </div>
        `;
        return;
    }

    tasks.forEach(task => {
        const row = document.createElement("div");
        row.className = `care-item ${task.completed ? "completed" : ""}`;

        row.innerHTML = `
            <button class="check-button" type="button" aria-label="Toggle ${task.title}">
                ${task.completed ? "✓" : ""}
            </button>
            <span class="care-icon">${task.icon || "📋"}</span>
            <span style="flex:1;">
                <span class="care-name" style="display:flex; justify-content:space-between; align-items:center;">
                    <span>${task.title}</span>
                    <span style="font-size: 0.72rem; font-weight: 700; background: #e2e8f0; color: #475569; padding: 2px 8px; border-radius: 10px;">${task.category}</span>
                </span>
                <span class="care-time">${task.detail}</span>
            </span>
        `;

        const checkBtn = row.querySelector(".check-button");
        if (checkBtn) {
            checkBtn.addEventListener("click", async () => {
                if (task.completed) return;
                await markDashboardTaskComplete(petId, task);
            });
        }

        list.appendChild(row);
    });
}

async function markDashboardTaskComplete(petId, task) {
    const token = localStorage.getItem("pawsyncToken");
    if (!token) return;

    try {
        if (task.type === "grooming") {
            const res = await fetch("http://localhost:5000/api/grooming/complete", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ petId, activityId: task.id })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert(`Grooming activity marked complete! (+${data.creditEarned || 0.4} Credits) ✂️`);
                loadPetDashboard(petId);
                return;
            }
            alert(data.message || "Failed to mark task complete.");
        } else if (task.type === "nutrition") {
            const res = await fetch(`http://localhost:5000/api/nutrition/complete/${petId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert(`Nutrition meal marked complete! 🍲`);
                loadPetDashboard(petId);
                return;
            }
            alert(data.message || "Failed to mark meal complete.");
        }
    } catch (err) {
        console.error("Dashboard task completion error:", err);
        alert("Unable to complete task.");
    }
}

function renderUpcomingReminders(reminders) {
    const list = $("remindersList");
    if (!list) return;

    list.innerHTML = "";

    if (!reminders || reminders.length === 0) {
        list.innerHTML = `
            <div style="padding: 40px 16px; text-align: center; color: #64748b;">
                <div style="font-size: 2.2rem; margin-bottom: 8px;">🔔</div>
                <p style="font-weight: 700; color: #173b5f; margin: 0 0 4px 0;">No upcoming reminders.</p>
                <p style="font-size: 0.88rem; margin: 0; color: #64748b;">You're all caught up! 🐾</p>
            </div>
        `;
        return;
    }

    reminders.forEach(item => {
        const row = document.createElement("div");
        row.className = "reminder-item";
        row.innerHTML = `
            <span class="reminder-icon">${item.icon || "🔔"}</span>
            <span class="reminder-main">
                <strong>${item.title}</strong>
                <span>${item.detail}</span>
            </span>
            <span class="reminder-status ${item.className || "scheduled"}">
                ${item.status}
            </span>
        `;
        list.appendChild(row);
    });
}

function renderAppointments(appointments) {
    const list = $("appointmentsList");
    if (!list) return;

    list.innerHTML = "";

    if (!appointments || appointments.length === 0) {
        list.innerHTML = `
            <div class="empty-appointments">
                <span class="empty-icon">🩺</span>
                <h4>No Vet Appointments Scheduled</h4>
                <p>Schedule a visit with a verified veterinarian for your pet's routine checkups or health care.</p>
                <a href="/frontend/appointments/appointments.html" class="book-vet-btn">+ Book Vet Visit</a>
            </div>
        `;
        return;
    }

    appointments.forEach(appt => {
        const item = document.createElement("div");
        item.className = "appointment-card-item";

        const vetPhotoHtml = appt.vetPhoto
            ? `<img src="${appt.vetPhoto}" alt="${appt.vetName}" class="appt-vet-avatar">`
            : `<div class="appt-vet-avatar">👨‍⚕️</div>`;

        let statusClass = "pending";
        let statusLabel = "⏳ Pending Confirmation";
        if (appt.status === "accepted") {
            statusClass = "accepted";
            statusLabel = "🟢 Confirmed";
        } else if (appt.status === "completed") {
            statusClass = "completed";
            statusLabel = "✓ Completed";
        } else if (appt.status === "rejected") {
            statusClass = "rejected";
            statusLabel = "🔴 Declined";
        } else if (appt.status === "cancelled") {
            statusClass = "cancelled";
            statusLabel = "❌ Cancelled";
        }

        item.innerHTML = `
            <div class="appt-left-group">
                ${vetPhotoHtml}
                <div class="appt-info">
                    <h4>${appt.vetName}</h4>
                    <p class="appt-meta">${appt.specialization} • ${appt.clinicName}</p>
                    <p class="appt-date-time">📅 ${appt.date} at ${appt.time}</p>
                    <p class="appt-meta" style="font-size: 12px; color: #475569;">🐾 ${appt.petName} — ${appt.reason}</p>
                </div>
            </div>
            <div class="appt-right-group">
                <span class="appt-status-badge ${statusClass}">${statusLabel}</span>
            </div>
        `;

        list.appendChild(item);
    });
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
   COMPLETE PET PROFILE MODAL
========================================= */

async function openProfileCompletionModal() {

    const overlay =
        document.getElementById(
            "profileModalOverlay"
        );

    const petNameElement =
        document.getElementById(
            "profileModalPetName"
        );

    const percentElement =
        document.getElementById(
            "modalCompletionPercent"
        );

    const progressElement =
        document.getElementById(
            "modalCompletionProgress"
        );


    if (!overlay) {

        console.warn(
            "Profile completion modal not found."
        );

        return;
    }


    /* =========================================
       GET CURRENTLY SELECTED PET
    ========================================= */

    const pet =
        pets[selectedPetKey];


    if (!pet) {

        console.warn(
            "No pet selected."
        );

        return;
    }


    /* =========================================
       PET NAME
    ========================================= */

    if (petNameElement) {

        petNameElement.textContent =
            `Complete ${pet.name}'s Profile`;

    }


    /* =========================================
       GET PET ID
    ========================================= */

    const petId =
        pet.id || pet._id;


    if (!petId) {

        console.error(
            "Pet ID not found:",
            pet
        );

        return;
    }


    /* =========================================
       GET AUTH TOKEN
    ========================================= */

    const token =
        localStorage.getItem(
            "pawsyncToken"
        );


    if (!token) {

        console.error(
            "Authentication token not found."
        );

        return;
    }


    /* =========================================
       GET PROFILE COMPLETION
    ========================================= */

    try {

        const response =
            await fetch(
                `/api/pets/${petId}/profile-completion`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            "Bearer " + token,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "PROFILE COMPLETION:",
            data
        );


        if (
            !response.ok ||
            !data.success
        ) {

            console.error(
                "Unable to load profile completion:",
                data
            );

            return;
        }


        /* =====================================
           COMPLETION PERCENTAGE
        ===================================== */

        const completion =
            data.completion || 0;


        if (percentElement) {

            percentElement.textContent =
                `${completion}%`;

        }


        if (progressElement) {

            progressElement.style.width =
                `${completion}%`;

        }


        /* =====================================
           NUTRITION COMPLETION
        ===================================== */

        const nutritionCompleted =
            data.sections?.nutrition === true;


        console.log(
            "Selected Pet:",
            pet.name
        );

        console.log(
            "Nutrition completed:",
            nutritionCompleted
        );


        /* =====================================
           FIND CURRENT NUTRITION ELEMENT
           
           It can be either:
           1. Complete button
           2. Complete badge
        ===================================== */

        const nutritionElement =
            document.querySelector(
                "#nutritionCompleteButton, #nutritionStatusElement"
            );


        if (nutritionElement) {


            /* =================================
               NUTRITION IS COMPLETE
            ================================= */

            if (nutritionCompleted) {

                nutritionElement.outerHTML = `

                    <span
                        id="nutritionStatusElement"
                        class="section-status completed-status"
                    >
                        ✓ Complete
                    </span>

                `;

            }


            /* =================================
               NUTRITION IS NOT COMPLETE
            ================================= */

            else {

                nutritionElement.outerHTML = `

                    <button
                        type="button"
                        class="complete-profile-button"
                        id="nutritionCompleteButton"
                    >
                        Complete →
                    </button>

                `;

            }

        }


        /* =====================================
           GROOMING COMPLETION
        ===================================== */

        const groomingCompleted =
            data.sections?.grooming === true;

        const groomingElement =
            document.querySelector(
                "#groomingCompleteButton, #groomingStatusElement, [data-section='grooming']"
            );

        if (groomingElement) {

            if (groomingCompleted) {

                groomingElement.outerHTML = `
                    <span
                        id="groomingStatusElement"
                        class="section-status completed-status"
                    >
                        ✓ Complete
                    </span>
                `;

            } else {

                groomingElement.outerHTML = `
                    <button
                        type="button"
                        class="complete-profile-button"
                        id="groomingCompleteButton"
                        data-section="grooming"
                    >
                        Complete →
                    </button>
                `;

            }

        }


        /* =====================================
           ACTIVITY COMPLETION
        ===================================== */

        const activityCompleted =
            data.sections?.activity === true;

        const activityElement =
            document.querySelector(
                "#activityCompleteButton, #activityStatusElement, [data-section='activity']"
            );

        if (activityElement) {

            if (activityCompleted) {

                activityElement.outerHTML = `
                    <span
                        id="activityStatusElement"
                        class="section-status completed-status"
                    >
                        ✓ Complete
                    </span>
                `;

            } else {

                activityElement.outerHTML = `
                    <button
                        type="button"
                        class="complete-profile-button"
                        id="activityCompleteButton"
                        data-section="activity"
                    >
                        Complete →
                    </button>
                `;

            }

        }


    } catch (error) {

        console.error(
            "Profile completion error:",
            error
        );

    }


    /* =========================================
       SHOW MODAL
    ========================================= */

    overlay.style.display =
        "flex";


    /* =========================================
       PREVENT BACKGROUND SCROLLING
    ========================================= */

    document.body.style.overflow =
        "hidden";
}


/* =========================================
   CLOSE PROFILE MODAL
========================================= */

function closeProfileCompletionModal() {

    const overlay =
        document.getElementById(
            "profileModalOverlay"
        );


    if (!overlay) {
        return;
    }


    overlay.style.display =
        "none";


    /* Restore page scrolling */

    document.body.style.overflow =
        "";
}


/* =========================================
   PROFILE MODAL EVENTS
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const completeProfileButton =
            document.getElementById(
                "completeProfileButton"
            );

        const closeButton =
            document.getElementById(
                "profileModalClose"
            );

        const overlay =
            document.getElementById(
                "profileModalOverlay"
            );


        /* Open modal */

        if (completeProfileButton) {

            completeProfileButton.addEventListener(
                "click",
                openProfileCompletionModal
            );

        }


        /* Close modal */

        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeProfileCompletionModal
            );

        }


        /* Close when clicking outside modal */

        if (overlay) {

            overlay.addEventListener(
                "click",
                (event) => {

                    if (
                        event.target === overlay
                    ) {

                        closeProfileCompletionModal();

                    }

                }
            );

        }


        /* Close with ESC */

        document.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Escape"
                ) {

                    closeProfileCompletionModal();

                }

            }
        );

    }
);

/* =========================================
   PROFILE MODAL EVENT SETUP
========================================= */

function setupProfileModalEvents() {

    const completeProfileButton =
        document.getElementById(
            "completeProfileButton"
        );

    const closeButton =
        document.getElementById(
            "profileModalClose"
        );

    const overlay =
        document.getElementById(
            "profileModalOverlay"
        );


    console.log(
        "PROFILE MODAL BUTTON:",
        completeProfileButton
    );


    /* =====================================
       OPEN PROFILE MODAL
    ===================================== */

    if (completeProfileButton) {

        completeProfileButton.onclick =
            function () {

                console.log(
                    "Complete Profile clicked"
                );

                openProfileCompletionModal();

            };

    }


    /* =====================================
       CLOSE PROFILE MODAL
    ===================================== */

    if (closeButton) {

        closeButton.onclick =
            function () {

                closeProfileCompletionModal();

            };

    }


    /* =====================================
       CLOSE BY CLICKING OUTSIDE
    ===================================== */

    if (overlay) {

        overlay.onclick =
            function (event) {

                if (
                    event.target === overlay
                ) {

                    closeProfileCompletionModal();

                }

            };

    }

}


/* =========================================
   RUN EVENT SETUP
========================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        setupProfileModalEvents
    );

} else {

    setupProfileModalEvents();

}

/* =========================================
   SPECIES-SPECIFIC NUTRITION QUESTIONS
========================================= */

function renderSpeciesNutritionFields(pet) {

    const container =
        document.getElementById(
            "speciesNutritionFields"
        );


    if (!container) {

        console.error(
            "Species nutrition fields container not found."
        );

        return;

    }


    // Clear previous pet's questions
    container.innerHTML = "";


    const species =
        (pet?.species || "")
            .toLowerCase()
            .trim();


    console.log(
        "Nutrition questions for species:",
        species
    );


    /* =====================================
       DOG
    ===================================== */

    if (species === "dog") {

        container.innerHTML = `

            <div class="nutrition-form-group">

                <label for="dogFoodType">
                    Main Food Type
                </label>

                <select
                    id="dogFoodType"
                    name="speciesFoodType"
                >

                    <option value="">
                        Select food type
                    </option>

                    <option value="Dry Food">
                        Dry Food
                    </option>

                    <option value="Wet Food">
                        Wet Food
                    </option>

                    <option value="Homemade">
                        Homemade
                    </option>

                    <option value="Mixed">
                        Mixed
                    </option>

                </select>

            </div>


            <div class="nutrition-form-group">

                <label for="dogTreatFrequency">
                    Treat Frequency
                </label>

                <select
                    id="dogTreatFrequency"
                    name="speciesTreatFrequency"
                >

                    <option value="">
                        Select frequency
                    </option>

                    <option value="Never">
                        Never
                    </option>

                    <option value="Occasionally">
                        Occasionally
                    </option>

                    <option value="Daily">
                        Daily
                    </option>

                    <option value="Multiple times daily">
                        Multiple times daily
                    </option>

                </select>

            </div>


            <div class="nutrition-form-group">

                <label for="dogWeightGoal">
                    Weight / Body Goal
                </label>

                <select
                    id="dogWeightGoal"
                    name="speciesWeightGoal"
                >

                    <option value="">
                        Select goal
                    </option>

                    <option value="Maintain">
                        Maintain current weight
                    </option>

                    <option value="Gain">
                        Healthy weight gain
                    </option>

                    <option value="Lose">
                        Weight management
                    </option>

                </select>

            </div>

        `;

    }


    /* =====================================
       CAT
    ===================================== */

    else if (species === "cat") {

        container.innerHTML = `

            <div class="nutrition-form-group">

                <label for="catFoodType">
                    Main Food Type
                </label>

                <select
                    id="catFoodType"
                    name="speciesFoodType"
                >

                    <option value="">
                        Select food type
                    </option>

                    <option value="Dry Food">
                        Dry Food
                    </option>

                    <option value="Wet Food">
                        Wet Food
                    </option>

                    <option value="Mixed">
                        Mixed
                    </option>

                    <option value="Homemade">
                        Homemade
                    </option>

                </select>

            </div>


            <div class="nutrition-form-group">

                <label for="catWaterIntake">
                    Water Intake
                </label>

                <select
                    id="catWaterIntake"
                    name="speciesWaterIntake"
                >

                    <option value="">
                        Select
                    </option>

                    <option value="Good">
                        Good
                    </option>

                    <option value="Moderate">
                        Moderate
                    </option>

                    <option value="Low">
                        Low
                    </option>

                    <option value="Unknown">
                        Unknown
                    </option>

                </select>

            </div>


            <div class="nutrition-form-group">

                <label for="catIndoorOutdoor">
                    Lifestyle
                </label>

                <select
                    id="catIndoorOutdoor"
                    name="speciesLifestyle"
                >

                    <option value="">
                        Select lifestyle
                    </option>

                    <option value="Indoor">
                        Indoor
                    </option>

                    <option value="Outdoor">
                        Outdoor
                    </option>

                    <option value="Both">
                        Indoor & Outdoor
                    </option>

                </select>

            </div>

        `;

    }


    /* =====================================
       BIRD / PARROT
    ===================================== */

    else if (
        species === "bird" ||
        species === "parrot"
    ) {

        container.innerHTML = `

            <div class="nutrition-form-group">

                <label for="birdDietType">
                    Main Diet Type
                </label>

                <select
                    id="birdDietType"
                    name="speciesDietType"
                >

                    <option value="">
                        Select diet
                    </option>

                    <option value="Seeds">
                        Seed-based
                    </option>

                    <option value="Pellets">
                        Pellet-based
                    </option>

                    <option value="Mixed">
                        Seeds + Pellets
                    </option>

                    <option value="Fresh Food">
                        Fresh food based
                    </option>

                </select>

            </div>


            <div class="nutrition-form-group">

                <label for="birdFreshFood">
                    Fresh Fruits & Vegetables
                </label>

                <select
                    id="birdFreshFood"
                    name="speciesFreshFood"
                >

                    <option value="">
                        Select frequency
                    </option>

                    <option value="Never">
                        Never
                    </option>

                    <option value="Occasionally">
                        Occasionally
                    </option>

                    <option value="Daily">
                        Daily
                    </option>

                </select>

            </div>


            <div class="nutrition-form-group">

                <label for="birdCalciumSource">
                    Calcium / Mineral Source
                </label>

                <select
                    id="birdCalciumSource"
                    name="speciesCalciumSource"
                >

                    <option value="">
                        Select
                    </option>

                    <option value="Cuttlebone">
                        Cuttlebone
                    </option>

                    <option value="Mineral Block">
                        Mineral Block
                    </option>

                    <option value="Supplement">
                        Supplement
                    </option>

                    <option value="None">
                        None
                    </option>

                    <option value="Unknown">
                        Unknown
                    </option>

                </select>

            </div>

        `;

    }


    /* =====================================
       RABBIT
    ===================================== */

    else if (species === "rabbit") {

        container.innerHTML = `

            <div class="nutrition-form-group">

                <label for="rabbitHay">
                    Hay Availability
                </label>

                <select
                    id="rabbitHay"
                    name="speciesHayAvailability"
                >

                    <option value="">
                        Select
                    </option>

                    <option value="Always available">
                        Always available
                    </option>

                    <option value="Sometimes">
                        Sometimes
                    </option>

                    <option value="Rarely">
                        Rarely
                    </option>

                    <option value="None">
                        None
                    </option>

                </select>

            </div>


            <div class="nutrition-form-group">

                <label for="rabbitVegetables">
                    Fresh Vegetables
                </label>

                <select
                    id="rabbitVegetables"
                    name="speciesVegetableFrequency"
                >

                    <option value="">
                        Select frequency
                    </option>

                    <option value="Daily">
                        Daily
                    </option>

                    <option value="Several times a week">
                        Several times a week
                    </option>

                    <option value="Occasionally">
                        Occasionally
                    </option>

                    <option value="Never">
                        Never
                    </option>

                </select>

            </div>


            <div class="nutrition-form-group">

                <label for="rabbitPellets">
                    Pellet Feeding
                </label>

                <select
                    id="rabbitPellets"
                    name="speciesPelletFeeding"
                >

                    <option value="">
                        Select
                    </option>

                    <option value="Daily">
                        Daily
                    </option>

                    <option value="Sometimes">
                        Sometimes
                    </option>

                    <option value="None">
                        None
                    </option>

                </select>

            </div>

        `;

    }


    /* =====================================
       FISH
    ===================================== */

    else if (species === "fish") {

        container.innerHTML = `

            <div class="nutrition-form-group">

                <label for="fishFoodType">
                    Food Type
                </label>

                <select
                    id="fishFoodType"
                    name="speciesFoodType"
                >

                    <option value="">
                        Select food type
                    </option>

                    <option value="Flakes">
                        Flakes
                    </option>

                    <option value="Pellets">
                        Pellets
                    </option>

                    <option value="Frozen">
                        Frozen
                    </option>

                    <option value="Live Food">
                        Live food
                    </option>

                    <option value="Mixed">
                        Mixed
                    </option>

                </select>

            </div>


            <div class="nutrition-form-group">

                <label for="fishFeedingFrequency">
                    Feeding Frequency
                </label>

                <select
                    id="fishFeedingFrequency"
                    name="speciesFeedingFrequency"
                >

                    <option value="">
                        Select
                    </option>

                    <option value="Once daily">
                        Once daily
                    </option>

                    <option value="Twice daily">
                        Twice daily
                    </option>

                    <option value="Multiple times daily">
                        Multiple times daily
                    </option>

                    <option value="Other">
                        Other
                    </option>

                </select>

            </div>


            <div class="nutrition-form-group">

                <label for="fishTankFeeding">
                    Feeding Environment
                </label>

                <input
                    type="text"
                    id="fishTankFeeding"
                    name="speciesEnvironment"
                    placeholder="e.g. community tank"
                >

            </div>

        `;

    }


    /* =====================================
       HORSE
    ===================================== */

    else if (species === "horse") {

        container.innerHTML = `

            <div class="nutrition-form-group">

                <label for="horseForage">
                    Main Forage
                </label>

                <input
                    type="text"
                    id="horseForage"
                    name="speciesForage"
                    placeholder="e.g. hay, pasture"
                >

            </div>


            <div class="nutrition-form-group">

                <label for="horseFeedFrequency">
                    Feed Frequency
                </label>

                <select
                    id="horseFeedFrequency"
                    name="speciesFeedFrequency"
                >

                    <option value="">
                        Select
                    </option>

                    <option value="1-2 times">
                        1–2 times daily
                    </option>

                    <option value="3 times">
                        3 times daily
                    </option>

                    <option value="Multiple small meals">
                        Multiple small meals
                    </option>

                </select>

            </div>


            <div class="nutrition-form-group">

                <label for="horseSupplements">
                    Supplements
                </label>

                <input
                    type="text"
                    id="horseSupplements"
                    name="speciesSupplements"
                    placeholder="e.g. mineral supplement"
                >

            </div>

        `;

    }


    /* =====================================
       TURTLE
    ===================================== */

    else if (species === "turtle") {

        container.innerHTML = `

            <div class="nutrition-form-group">

                <label for="turtleDiet">
                    Diet Type
                </label>

                <select
                    id="turtleDiet"
                    name="speciesDietType"
                >

                    <option value="">
                        Select
                    </option>

                    <option value="Herbivore">
                        Herbivore
                    </option>

                    <option value="Omnivore">
                        Omnivore
                    </option>

                    <option value="Carnivore">
                        Carnivore
                    </option>

                </select>

            </div>


            <div class="nutrition-form-group">

                <label for="turtleCalcium">
                    Calcium Source
                </label>

                <select
                    id="turtleCalcium"
                    name="speciesCalciumSource"
                >

                    <option value="">
                        Select
                    </option>

                    <option value="Supplement">
                        Supplement
                    </option>

                    <option value="Calcium Block">
                        Calcium block
                    </option>

                    <option value="Natural Source">
                        Natural source
                    </option>

                    <option value="None">
                        None
                    </option>

                </select>

            </div>

        `;

    }


    /* =====================================
       OTHER
    ===================================== */

    else {

        container.innerHTML = `

            <div class="nutrition-form-group">

                <label for="otherDietDetails">
                    Diet Information
                </label>

                <textarea
                    id="otherDietDetails"
                    name="speciesDietDetails"
                    rows="4"
                    placeholder="Describe your pet's regular diet..."
                ></textarea>

            </div>

        `;

    }

}

// =========================================
// NUTRITION MODAL
// =========================================

function openNutritionModal(pet) {

    const modal =
        document.getElementById(
            "nutritionModalOverlay"
        );

    if (!modal) {
        console.error(
            "Nutrition modal not found."
        );
        return;
    }


    // -----------------------------------------
    // PET NAME
    // -----------------------------------------

    const petName =
        pet?.petName ||
        pet?.name ||
        "Pet";


    const nameElement =
        document.getElementById(
            "nutritionModalPetName"
        );

    if (nameElement) {

        nameElement.textContent =
            `${petName}'s Nutrition`;

    }


    // -----------------------------------------
    // SPECIES
    // -----------------------------------------

    const species =
        pet?.species ||
        "Pet";


    renderSpeciesNutritionFields(
        pet
    );


    const speciesElement =
        document.getElementById(
            "nutritionModalSpecies"
        );

    if (speciesElement) {

        speciesElement.textContent =
            `Personalized nutrition for ${species}`;

    }


    // -----------------------------------------
    // RESET & LOAD PET'S NUTRITION PROFILE
    // -----------------------------------------

    const petId = pet?.id || pet?._id;

    const form = document.getElementById("nutritionProfileForm");

    if (form) {

        form.reset();

    }


    if (petId) {

        const token = localStorage.getItem("pawsyncToken");

        if (token) {

            fetch(`http://localhost:5000/api/nutrition/${petId}`, {

                headers: {

                    "Authorization": `Bearer ${token}`

                }

            })

            .then(res => res.ok ? res.json() : null)

            .then(data => {

                if (data && data.nutritionProfile) {

                    const p = data.nutritionProfile;

                    const setVal = (id, val) => {

                        const el = document.getElementById(id);

                        if (el && val !== undefined && val !== null) {

                            el.value = val;

                        }

                    };


                    setVal("nutritionDietType", p.dietType);

                    setVal("nutritionPrimaryFood", p.primaryFood);

                    setVal("nutritionMealsPerDay", p.mealsPerDay);

                    setVal("nutritionCalorieTarget", p.calorieTarget);

                    setVal("nutritionAllergies", p.allergies);

                    setVal("nutritionTreats", p.treatsAllowed);

                    setVal("nutritionWaterAccess", p.waterAccess);

                    setVal("nutritionGoal", p.nutritionGoal);

                    setVal("nutritionNotes", p.notes);


                    if (Array.isArray(p.dietaryRestrictions)) {

                        document.querySelectorAll('#nutritionRestrictions input[type="checkbox"]').forEach(cb => {

                            cb.checked = p.dietaryRestrictions.includes(cb.value);

                        });

                    }

                }

            })

            .catch(err => console.warn("Error pre-filling nutrition profile:", err));

        }

    }


    // -----------------------------------------
    // SHOW MODAL
    // -----------------------------------------

    modal.style.display = "flex";

    document.body.style.overflow = "hidden";

}


function closeNutritionModal() {

    const modal =
        document.getElementById(
            "nutritionModalOverlay"
        );

    if (modal) {

        modal.style.display = "none";

    }

    document.body.style.overflow = "";

}
document.addEventListener(
    "DOMContentLoaded",
    () => {

        const closeButton =
            document.getElementById(
                "nutritionModalClose"
            );

        const cancelButton =
            document.getElementById(
                "nutritionCancelButton"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeNutritionModal
            );

        }


        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                closeNutritionModal
            );

        }

    }
);

/* =========================================
   NUTRITION BUTTON
========================================= */

function setupNutritionButton() {

    const nutritionButton =
        document.getElementById(
            "nutritionCompleteButton"
        );


    if (!nutritionButton) {

        console.warn(
            "Nutrition Complete button not found."
        );

        return;

    }


    nutritionButton.onclick =
        function () {

            console.log(
                "Nutrition Complete clicked"
            );


            /* ---------------------------------
               GET CURRENTLY SELECTED PET
            --------------------------------- */

            const pet =
                pets[selectedPetKey];


            if (!pet) {

                console.error(
                    "No selected pet found:",
                    selectedPetKey
                );

                return;

            }


            console.log(
                "Selected pet for nutrition:",
                pet
            );


            /* ---------------------------------
               OPEN NUTRITION MODAL
            --------------------------------- */

            openNutritionModal(
                pet
            );

        };

}

/* =========================================
   NUTRITION BUTTON - DYNAMIC CLICK
========================================= */

function setupNutritionButtonDelegation() {

    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "#nutritionCompleteButton"
                );


            if (!button) {
                return;
            }


            console.log(
                "Dynamic Nutrition Complete clicked"
            );


            /* =================================
               GET CURRENTLY SELECTED PET
            ================================= */

            const pet =
                pets[selectedPetKey];


            if (!pet) {

                console.error(
                    "No selected pet found:",
                    selectedPetKey
                );

                return;

            }


            console.log(
                "Opening nutrition for:",
                pet.name
            );


            /* =================================
               OPEN NUTRITION MODAL
            ================================= */

            openNutritionModal(
                pet
            );

        }
    );

}
/* =========================================
   SAVE NUTRITION PROFILE
========================================= */

function setupNutritionForm() {

    const form =
        document.getElementById(
            "nutritionProfileForm"
        );


    if (!form) {

        console.warn(
            "Nutrition form not found."
        );

        return;

    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* =====================================
               GET SELECTED PET
            ===================================== */

            const pet =
                pets[selectedPetKey];


            if (!pet) {

                alert(
                    "Please select a pet first."
                );

                return;

            }


            console.log(
                "Saving nutrition for:",
                pet
            );


            /* =====================================
               GET AUTH TOKEN
            ===================================== */

            const token =
                localStorage.getItem(
                    "pawsyncToken"
                );


            if (!token) {

                alert(
                    "Authentication required. Please login again."
                );

                return;

            }


            /* =====================================
               COMMON NUTRITION DATA
            ===================================== */

            const dietType =
                document.getElementById(
                    "nutritionDietType"
                )?.value || "";


            const primaryFood =
                document.getElementById(
                    "nutritionPrimaryFood"
                )?.value || "";


            const mealsPerDay =
                document.getElementById(
                    "nutritionMealsPerDay"
                )?.value || "";


            const calorieTarget =
                document.getElementById(
                    "nutritionCalorieTarget"
                )?.value || "";


            const allergies =
                document.getElementById(
                    "nutritionAllergies"
                )?.value || "";


            const treatsAllowed =
                document.getElementById(
                    "nutritionTreats"
                )?.value || "";


            const waterAccess =
                document.getElementById(
                    "nutritionWaterAccess"
                )?.value || "";


            const nutritionGoal =
                document.getElementById(
                    "nutritionGoal"
                )?.value || "";


            const notes =
                document.getElementById(
                    "nutritionNotes"
                )?.value || "";


            /* =====================================
               DIETARY RESTRICTIONS
            ===================================== */

            const restrictionCheckboxes =
                document.querySelectorAll(
                    '#nutritionRestrictions input[type="checkbox"]:checked'
                );


            const dietaryRestrictions =
                Array.from(
                    restrictionCheckboxes
                ).map(
                    checkbox =>
                        checkbox.value
                );


            /* =====================================
               SPECIES-SPECIFIC DATA
            ===================================== */

            const speciesSpecific = {};


            const speciesFields =
                document.querySelectorAll(
                    "#speciesNutritionFields input, " +
                    "#speciesNutritionFields select, " +
                    "#speciesNutritionFields textarea"
                );


            speciesFields.forEach(
                field => {

                    if (
                        field.name &&
                        field.value !== ""
                    ) {

                        speciesSpecific[
                            field.name
                        ] = field.value;

                    }

                }
            );


            console.log(
                "Species-specific nutrition:",
                speciesSpecific
            );


            /* =====================================
               FINAL DATA
            ===================================== */

            const nutritionData = {

                petId:
                    pet.id,

                dietType:
                    dietType,

                primaryFood:
                    primaryFood,

                mealsPerDay:
                    mealsPerDay,

                calorieTarget:
                    calorieTarget,

                allergies:
                    allergies,

                dietaryRestrictions:
                    dietaryRestrictions,

                treatsAllowed:
                    treatsAllowed,

                waterAccess:
                    waterAccess,

                nutritionGoal:
                    nutritionGoal,

                speciesSpecific:
                    speciesSpecific,

                notes:
                    notes

            };


            console.log(
                "NUTRITION DATA:",
                nutritionData
            );


            /* =====================================
               SEND TO BACKEND
            ===================================== */

            const saveBtn = document.getElementById("nutritionSaveButton");
            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.textContent = "Saving Nutrition...";
            }

            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/nutrition",
                        {

                            method:
                                "POST",

                            headers: {

                                "Authorization":
                                    `Bearer ${token}`,

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    nutritionData
                                )

                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "NUTRITION API RESPONSE:",
                    data
                );


                /* =================================
                   SUCCESS
                ================================= */

                if (
                    response.ok &&
                    data.success
                ) {

                    alert(
                        "Nutrition is Saved! 🍲"
                    );


                    closeNutritionModal();


                    /*
                       Reload profile completion
                    */

                    loadProfileCompletion(
                        selectedPetKey
                    );


                    return;

                }


                /* =================================
                   ERROR
                ================================= */

                alert(
                    data.message ||
                    "Failed to save nutrition profile."
                );


            } catch (error) {

                console.error(
                    "Nutrition save error:",
                    error
                );


                alert(
                    "Unable to connect to the server."
                );

            } finally {
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.textContent = "Save Nutrition";
                }
            }

        }
    );

}

/* =========================================
   GROOMING MODAL & FORM
========================================= */

function openGroomingModal(pet) {
    const modal = document.getElementById("groomingModalOverlay");
    if (!modal) {
        console.error("Grooming modal not found.");
        return;
    }

    const petName = pet?.petName || pet?.name || "Pet";
    const petId = pet?.id || pet?._id;

    const nameEl = document.getElementById("groomingModalPetName");
    if (nameEl) nameEl.textContent = `${petName}'s Grooming`;

    const speciesEl = document.getElementById("groomingModalSpecies");
    if (speciesEl) speciesEl.textContent = `Personalized grooming & coat care for ${pet?.species || "Pet"}`;

    const form = document.getElementById("groomingProfileForm");
    if (form) form.reset();

    if (petId) {
        const token = localStorage.getItem("pawsyncToken");
        if (token) {
            fetch(`http://localhost:5000/api/grooming/profile/${petId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.groomingProfile) {
                    const p = data.groomingProfile;
                    const setVal = (id, val) => {
                        const el = document.getElementById(id);
                        if (el && val !== undefined && val !== null) el.value = val;
                    };
                    setVal("groomingCoatType", p.coatType);
                    setVal("groomingSheddingLevel", p.sheddingLevel);
                    setVal("groomingSkinCondition", p.skinCondition);
                    setVal("groomingBrushingFreq", p.brushingFrequency);
                    setVal("groomingBathingFreq", p.bathingFrequency);
                    setVal("groomingNailFreq", p.nailTrimmingFrequency);
                    setVal("groomingEarFreq", p.earCleaningFrequency);
                    setVal("groomingToothFreq", p.toothBrushingFrequency);
                    setVal("groomingPawCare", p.pawCareRoutine);
                }
            })
            .catch(err => console.warn("Error pre-filling grooming profile:", err));
        }
    }

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeGroomingModal() {
    const modal = document.getElementById("groomingModalOverlay");
    if (modal) modal.style.display = "none";
    document.body.style.overflow = "";
}

function setupGroomingButtonDelegation() {
    document.addEventListener("click", function (event) {
        const button = event.target.closest("#groomingCompleteButton, [data-section='grooming']");
        if (!button) return;

        const pet = pets[selectedPetKey];
        if (!pet) return;

        openGroomingModal(pet);
    });

    const closeBtn = document.getElementById("groomingModalClose");
    const cancelBtn = document.getElementById("groomingCancelButton");
    if (closeBtn) closeBtn.addEventListener("click", closeGroomingModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeGroomingModal);
}

function setupGroomingForm() {
    const form = document.getElementById("groomingProfileForm");
    if (!form) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const pet = pets[selectedPetKey];
        if (!pet) {
            alert("Please select a pet first.");
            return;
        }

        const token = localStorage.getItem("pawsyncToken");
        if (!token) {
            alert("Authentication required. Please login again.");
            return;
        }

        const saveBtn = document.getElementById("groomingSaveButton");
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = "Saving Grooming...";
        }

        const groomingData = {
            coatType: document.getElementById("groomingCoatType")?.value || "Short Hair",
            sheddingLevel: document.getElementById("groomingSheddingLevel")?.value || "Low",
            skinCondition: document.getElementById("groomingSkinCondition")?.value || "Normal",
            brushingFrequency: document.getElementById("groomingBrushingFreq")?.value || "Weekly",
            bathingFrequency: document.getElementById("groomingBathingFreq")?.value || "Monthly",
            nailTrimmingFrequency: document.getElementById("groomingNailFreq")?.value || "Monthly",
            earCleaningFrequency: document.getElementById("groomingEarFreq")?.value || "Monthly",
            toothBrushingFrequency: document.getElementById("groomingToothFreq")?.value || "Weekly",
            pawCareRoutine: document.getElementById("groomingPawCare")?.value || "As needed",
            profileCompleted: true
        };

        const petId = pet.id || pet._id;

        try {
            const response = await fetch(`http://localhost:5000/api/grooming/profile/${petId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(groomingData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Generate 30-day plan via Gemini AI
                try {
                    await fetch(`http://localhost:5000/api/grooming/generate-plan/${petId}`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    });
                } catch (genErr) {
                    console.warn("Plan generation warning:", genErr);
                }

                alert("Grooming Profile Saved & 30-Day Plan Generated! ✂️");
                closeGroomingModal();
                loadProfileCompletion(selectedPetKey);
                return;
            }

            alert(data.message || "Failed to save grooming profile.");
        } catch (error) {
            console.error("Grooming save error:", error);
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = "Save Grooming";
            }
        }
    });
}

/* =========================================
   ACTIVITY MODAL & FORM
========================================= */

function openActivityDashModal(pet) {
    const modal = document.getElementById("activityModalOverlay");
    if (!modal) {
        console.error("Activity modal not found.");
        return;
    }

    const petName = pet?.petName || pet?.name || "Pet";
    const petId = pet?.id || pet?._id;

    const nameEl = document.getElementById("activityModalPetName");
    if (nameEl) nameEl.textContent = `${petName}'s Activity`;

    const speciesEl = document.getElementById("activityModalSpecies");
    if (speciesEl) speciesEl.textContent = `Personalized physical exercise & training for ${pet?.species || "Pet"}`;

    const form = document.getElementById("activityDashProfileForm");
    if (form) form.reset();

    if (petId) {
        const token = localStorage.getItem("pawsyncToken");
        if (token) {
            fetch(`http://localhost:5000/api/activity/profile/${petId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.activityProfile) {
                    const p = data.activityProfile;
                    const setVal = (id, val) => {
                        const el = document.getElementById(id);
                        if (el && val !== undefined && val !== null) el.value = val;
                    };
                    setVal("actDashLevel", p.activityLevel);
                    setVal("actDashEnergy", p.energyLevel);
                    setVal("actDashLifestyle", p.lifestyle);
                    setVal("actDashEnv", p.environment);
                    setVal("actDashFavorites", p.favoriteActivities);
                    setVal("actDashDisliked", p.dislikedActivities);
                    setVal("actDashRestrictions", p.activityRestrictions);

                    if (Array.isArray(p.currentRoutine)) {
                        document.querySelectorAll('#activityDashProfileForm input[name="currentRoutine"]').forEach(cb => {
                            cb.checked = p.currentRoutine.includes(cb.value);
                        });
                    }
                }
            })
            .catch(err => console.warn("Error pre-filling activity profile:", err));
        }
    }

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeActivityDashModal() {
    const modal = document.getElementById("activityModalOverlay");
    if (modal) modal.style.display = "none";
    document.body.style.overflow = "";
}

function setupActivityButtonDelegation() {
    document.addEventListener("click", function (event) {
        const button = event.target.closest("#activityCompleteButton, [data-section='activity']");
        if (!button) return;

        const pet = pets[selectedPetKey];
        if (!pet) return;

        openActivityDashModal(pet);
    });

    const closeBtn = document.getElementById("activityModalClose");
    const cancelBtn = document.getElementById("activityDashCancelBtn");
    if (closeBtn) closeBtn.addEventListener("click", closeActivityDashModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeActivityDashModal);
}

function setupActivityDashForm() {
    const form = document.getElementById("activityDashProfileForm");
    if (!form) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const pet = pets[selectedPetKey];
        if (!pet) {
            alert("Please select a pet first.");
            return;
        }

        const token = localStorage.getItem("pawsyncToken");
        if (!token) {
            alert("Authentication required. Please login again.");
            return;
        }

        const saveBtn = document.getElementById("activityDashSaveBtn");
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = "Saving Activity...";
        }

        const routineCheckboxes = document.querySelectorAll('#activityDashProfileForm input[name="currentRoutine"]:checked');
        const currentRoutine = Array.from(routineCheckboxes).map(cb => cb.value);

        const activityData = {
            activityLevel: document.getElementById("actDashLevel")?.value || "Moderate",
            energyLevel: document.getElementById("actDashEnergy")?.value || "Moderate",
            lifestyle: document.getElementById("actDashLifestyle")?.value || "Mixed",
            environment: document.getElementById("actDashEnv")?.value || "Park access & outdoor walking",
            currentRoutine: currentRoutine,
            favoriteActivities: document.getElementById("actDashFavorites")?.value || "",
            dislikedActivities: document.getElementById("actDashDisliked")?.value || "",
            activityRestrictions: document.getElementById("actDashRestrictions")?.value || ""
        };

        const petId = pet.id || pet._id;

        try {
            const response = await fetch(`http://localhost:5000/api/activity/profile/${petId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(activityData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Generate 30-day activity plan via Gemini AI
                try {
                    await fetch(`http://localhost:5000/api/activity/generate-plan/${petId}`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    });
                } catch (genErr) {
                    console.warn("Activity plan generation warning:", genErr);
                }

                alert("Activity Profile Saved & 30-Day Plan Generated! 🏃");
                closeActivityDashModal();
                loadProfileCompletion(selectedPetKey);
                return;
            }

            alert(data.message || "Failed to save activity profile.");
        } catch (error) {
            console.error("Activity save error:", error);
            alert("Unable to connect to the server.");
        } finally {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = "Save Activity";
            }
        }
    });
}

/* =========================================
   INITIALIZE DASHBOARD
========================================= */
document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupProfileMenu();

        setupMobileMenu();

        setupNutritionButton();

        setupNutritionButtonDelegation();

        setupNutritionForm();

        setupGroomingButtonDelegation();

        setupGroomingForm();

        setupActivityButtonDelegation();

        setupActivityDashForm();

        loadOwnerProfile();

        loadOwnerPets();

    }
);