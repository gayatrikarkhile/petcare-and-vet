/* =========================================================
   ACTIVITY JS — PETVERSE AI
========================================================= */

const API_BASE = (typeof window !== "undefined" && window.location && window.location.protocol === "file:") ? "http://localhost:5000/api" : "/api";
let pets = [];
let selectedPetId = null;
let selectedPet = null;
let activeWeek = "1";
let fullPlanData = null;

// Helper: escapeHTML
function escapeHTML(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getSpeciesIcon(speciesStr = "") {
    const s = speciesStr.toLowerCase();
    if (s.includes("dog")) return "🐶";
    if (s.includes("cat")) return "🐱";
    if (s.includes("bird") || s.includes("finch") || s.includes("parrot")) return "🦜";
    if (s.includes("rabbit") || s.includes("bunny")) return "🐰";
    if (s.includes("fish")) return "🐠";
    if (s.includes("reptile")) return "🦎";
    return "🐾";
}

// Helper: Get IST Date YYYY-MM-DD
function getISTTodayString() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());
}

// Helper: Format Date String to human readable (e.g. "Aug 20" or "Thursday, 20 August 2026")
function formatHumanDate(dateStr) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return new Intl.DateTimeFormat("en-US", {
        timeZone: "UTC",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(dt);
}

function formatShortDate(dateStr) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return new Intl.DateTimeFormat("en-US", {
        timeZone: "UTC",
        month: "short",
        day: "numeric"
    }).format(dt);
}

function getCategoryIcon(cat) {
    switch (cat) {
        case "physical_activity": return "🚶";
        case "play": return "🎾";
        case "mental_stimulation": return "🧠";
        case "training": return "🎓";
        default: return "🏃";
    }
}

function getCategoryLabel(cat) {
    switch (cat) {
        case "physical_activity": return "Physical Activity";
        case "play": return "Play";
        case "mental_stimulation": return "Mental Stimulation";
        case "training": return "Training";
        default: return "Activity";
    }
}

function calculateAge(dateOfBirth) {
    if (!dateOfBirth) return "Unknown";
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return "Unknown";
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    const years = Math.abs(ageDate.getUTCFullYear() - 1970);
    const months = Math.floor((diffMs % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
    if (years > 0) return `${years} Yrs${months > 0 ? ` ${months} Mos` : ""}`;
    return `${months} Mos`;
}

// API Helper
async function apiFetch(url, options = {}) {
    const token = localStorage.getItem("pawsyncToken");
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });
    const data = await response.json();
    if (!response.ok && !data.code) {
        throw new Error(data.message || `API error: ${response.status}`);
    }
    return data;
}

// =========================================================
// INITIALIZATION
// =========================================================
document.addEventListener("DOMContentLoaded", async () => {
    setupEventListeners();
    await loadPets();
});

function setupEventListeners() {
    const petSelector = document.getElementById("petSelector");
    if (petSelector) {
        petSelector.addEventListener("change", (e) => {
            selectedPetId = e.target.value;
            selectedPet = pets.find(p => (p._id || p.id) === selectedPetId);
            updatePetMetaBadge();
            loadActivityData();
        });
    }

    // Week tabs
    const weekTabs = document.querySelectorAll("#weekNavTabs .tab-btn");
    weekTabs.forEach(btn => {
        btn.addEventListener("click", () => {
            weekTabs.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeWeek = btn.getAttribute("data-week");
            renderMonthlyPlan();
        });
    });

    // Buttons
    const openModalBtn = document.getElementById("openActivityModalBtn");
    const closeModalBtn = document.getElementById("closeActivityModalBtn");
    const cancelModalBtn = document.getElementById("cancelActivityModalBtn");
    const form = document.getElementById("activityProfileForm");
    const regenBtn = document.getElementById("regeneratePlanBtn");

    if (openModalBtn) openModalBtn.addEventListener("click", openActivityModal);
    if (closeModalBtn) closeModalBtn.addEventListener("click", hideActivityModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener("click", hideActivityModal);
    if (form) form.addEventListener("submit", handleActivityFormSubmit);
    if (regenBtn) regenBtn.addEventListener("click", handleRegeneratePlan);
}

// =========================================================
// LOAD PETS
// =========================================================
async function loadPets() {
    try {
        const res = await apiFetch(`${API_BASE}/pets`);
        pets = res.pets || res.data || (Array.isArray(res) ? res : []);

        const petSelector = document.getElementById("petSelector");
        if (!petSelector) return;

        petSelector.innerHTML = "";
        if (pets.length === 0) {
            petSelector.innerHTML = `<option value="">No pets found</option>`;
            return;
        }

        pets.forEach(pet => {
            const id = pet._id || pet.id;
            const option = document.createElement("option");
            option.value = id;
            option.textContent = `${pet.petName || pet.name} (${pet.species || "Pet"})`;
            petSelector.appendChild(option);
        });

        // Default to first pet or saved pet
        selectedPetId = pets[0]._id || pets[0].id;
        petSelector.value = selectedPetId;
        selectedPet = pets[0];
        updatePetMetaBadge();

        await loadActivityData();
    } catch (err) {
        console.error("Error loading pets:", err);
    }
}

function updatePetMetaBadge() {
    const metaContainer = document.getElementById("selectedPetMeta");
    const avatarContainer = document.getElementById("selectedPetAvatar");
    if (!selectedPet) return;

    const breed = selectedPet.breed || "Standard";
    const age = calculateAge(selectedPet.dateOfBirth);
    const weight = selectedPet.currentWeight?.value || selectedPet.weight?.value || "--";
    const unit = selectedPet.currentWeight?.unit || selectedPet.weight?.unit || "kg";
    const icon = getSpeciesIcon(selectedPet.species);

    if (metaContainer) {
        metaContainer.innerHTML = `
            <span class="meta-pill">${icon} ${selectedPet.species || "Pet"}</span>
            <span class="meta-divider">•</span>
            <span>${breed}</span>
            <span class="meta-divider">•</span>
            <span>${age}</span>
            <span class="meta-divider">•</span>
            <span>${weight} ${unit}</span>
        `;
    }

    if (avatarContainer) {
        if (selectedPet.photo) {
            avatarContainer.innerHTML = `<img src="${selectedPet.photo}" alt="${selectedPet.petName || selectedPet.name}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        } else {
            avatarContainer.textContent = icon;
        }
    }
}

// =========================================================
// LOAD ACTIVITY DATA
// =========================================================
async function loadActivityData() {
    if (!selectedPetId) return;

    showLoading(true);

    try {
        const data = await apiFetch(`${API_BASE}/activity/plan/${selectedPetId}`);

        if (data.code === "PROFILE_INCOMPLETE" || data.profileIncomplete) {
            const petName = selectedPet?.petName || selectedPet?.name || "Pet";
            showIncompleteState(petName);
            showProfileIncompletePopup(petName);
            showLoading(false);
            return;
        }

        showCompletePlanState();
        fullPlanData = data;
        const petName = selectedPet?.petName || selectedPet?.name || "Pet";

        // Pre-fill profile modal form if available
        if (data.activityProfile) {
            prefillActivityForm(data.activityProfile);
        }

        // Determine current week automatically based on planStartDate & today
        calculateCurrentWeekTab(data.planStartDate);

        // Render sections
        renderOverview(data);
        renderTodaysActivities(data);
        renderMonthlyPlan();
        renderCredits(data);
        renderHistory(data.history || []);

        showLoading(false);
    } catch (err) {
        console.error("Error loading activity data:", err);
        showLoading(false);
    }
}

function calculateCurrentWeekTab(startDateRaw) {
    if (!startDateRaw) return;
    const todayStr = getISTTodayString();
    const startStr = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date(startDateRaw));

    const [y1, m1, d1] = startStr.split("-").map(Number);
    const [y2, m2, d2] = todayStr.split("-").map(Number);
    const diffDays = Math.max(0, Math.floor((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / (24 * 60 * 60 * 1000)));

    const currentWeekNum = String(Math.min(4, Math.floor(diffDays / 7) + 1));
    activeWeek = currentWeekNum;

    // Highlight tab
    const weekTabs = document.querySelectorAll("#weekNavTabs .tab-btn");
    weekTabs.forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-week") === activeWeek);
    });
}

function showLoading(isLoading) {
    const loader = document.getElementById("activityLoading");
    const content = document.getElementById("activityContent");
    if (loader) loader.style.display = isLoading ? "block" : "none";
    if (content) content.style.display = isLoading ? "none" : "block";
}

// =========================================================
// RENDER OVERVIEW
// =========================================================
function renderOverview(data) {
    const profile = data.activityProfile || {};
    const schedule = data.schedule || [];

    document.getElementById("overviewActivityLevel").textContent = profile.activityLevel || "Moderate";
    document.getElementById("overviewEnergyLevel").textContent = profile.energyLevel || "Moderate";

    // Daily target minutes
    const species = (selectedPet?.species || "Dog").toLowerCase();
    const targetMins = species.includes("dog") ? "60 min" : species.includes("cat") ? "30 min" : "45 min";
    document.getElementById("overviewDailyActivity").textContent = targetMins;

    // Calculate monthly progress
    const completedCount = schedule.filter(s => s.status === "completed").length;
    const totalCount = schedule.length || 1;
    const progressPct = Math.round((completedCount / totalCount) * 100);
    document.getElementById("overviewMonthlyProgress").textContent = `${progressPct}%`;
}

// =========================================================
// RENDER TODAY'S ACTIVITIES
// =========================================================
function renderTodaysActivities(data) {
    const todayStr = getISTTodayString();
    const todayLabel = document.getElementById("todayDateLabel");
    if (todayLabel) todayLabel.textContent = formatHumanDate(todayStr);

    const schedule = data.schedule || [];
    const todayTasks = schedule.filter(s => s.date === todayStr);
    const container = document.getElementById("todaysActivityList");
    const badge = document.getElementById("todayProgressBadge");

    if (!container) return;

    const completedToday = todayTasks.filter(t => t.status === "completed").length;
    if (badge) badge.textContent = `${completedToday} / ${todayTasks.length} Completed`;

    if (todayTasks.length === 0) {
        container.innerHTML = `<div class="today-item-card"><p style="color:#64748b; margin:0;">No activities scheduled for today.</p></div>`;
        return;
    }

    container.innerHTML = todayTasks.map(t => {
        const icon = getCategoryIcon(t.category);
        const catLabel = getCategoryLabel(t.category);
        const isCompleted = t.status === "completed";

        return `
            <div class="today-item-card">
                <div class="item-main-info">
                    <div class="category-icon-badge">${icon}</div>
                    <div class="item-details">
                        <h3>${t.activityName}</h3>
                        <div class="item-meta">
                            <span>⏱️ ${t.duration || 20} mins</span>
                            <span>🏷️ ${catLabel}</span>
                            <span class="credit-tag">+0.4 Credits</span>
                        </div>
                    </div>
                </div>
                <div>
                    ${isCompleted ? `
                        <span class="status-badge completed">✓ Completed (+0.4)</span>
                    ` : `
                        <button type="button" class="complete-action-btn" onclick="completeActivityTask('${t.activityId}', '${t.date}')">
                            ✓ Mark Complete
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join("");
}

// =========================================================
// RENDER MONTHLY PLAN
// =========================================================
function renderMonthlyPlan() {
    if (!fullPlanData || !fullPlanData.schedule) return;

    const todayStr = getISTTodayString();
    const schedule = fullPlanData.schedule;
    const grid = document.getElementById("monthlyPlanGrid");
    if (!grid) return;

    let filtered = schedule;
    if (activeWeek !== "all") {
        filtered = schedule.filter(s => String(s.weekNumber) === String(activeWeek));
    }

    if (filtered.length === 0) {
        grid.innerHTML = `<p style="color:#64748b; grid-column: 1/-1;">No activities found for this week.</p>`;
        return;
    }

    grid.innerHTML = filtered.map(item => {
        const icon = getCategoryIcon(item.category);
        const catLabel = getCategoryLabel(item.category);

        let badgeHtml = "";
        let actionBtnHtml = "";

        if (item.status === "completed") {
            badgeHtml = `<span class="status-badge completed">✅ Completed</span>`;
            actionBtnHtml = `<div style="font-size:0.85rem; font-weight:700; color:#15803d; margin-top:8px;">✓ Completed (+0.4)</div>`;
        } else if (item.date < todayStr || item.status === "failed") {
            badgeHtml = `<span class="status-badge failed">❌ Failed</span>`;
            actionBtnHtml = `<div style="font-size:0.85rem; font-weight:700; color:#dc2626; margin-top:8px;">Failed to Complete (Credit: 0)</div>`;
        } else if (item.date === todayStr) {
            badgeHtml = `<span class="status-badge due">🟢 Due Today</span>`;
            actionBtnHtml = `
                <button type="button" class="complete-action-btn" onclick="completeActivityTask('${item.activityId}', '${item.date}')" style="margin-top:8px;">
                    ✓ Mark Complete
                </button>
            `;
        } else {
            badgeHtml = `<span class="status-badge scheduled">🔵 Scheduled</span>`;
            actionBtnHtml = `<div style="font-size:0.85rem; font-weight:600; color:#2563eb; margin-top:8px;">Scheduled</div>`;
        }

        return `
            <div class="day-plan-card">
                <div class="day-card-header">
                    <span class="day-date-title">${icon} ${formatShortDate(item.date)}</span>
                    ${badgeHtml}
                </div>
                <div class="day-activity-info">
                    <h4>${item.activityName}</h4>
                    <p>${item.description || catLabel}</p>
                    <div style="font-size:0.8rem; color:#64748b; font-weight:600;">⏱️ ${item.duration || 20} min | 🏷️ ${catLabel}</div>
                    ${actionBtnHtml}
                </div>
            </div>
        `;
    }).join("");
}

// =========================================================
// RENDER CREDITS OVERVIEW
// =========================================================
function renderCredits(data) {
    const history = data.history || [];
    const schedule = data.schedule || [];
    const todayStr = getISTTodayString();

    // Week credits
    const completedItems = schedule.filter(s => s.status === "completed");
    const monthCredits = completedItems.length * 0.4;

    // Filter this week
    const currentWeekItems = schedule.filter(s => String(s.weekNumber) === String(activeWeek) && s.status === "completed");
    const weekCredits = currentWeekItems.length * 0.4;

    document.getElementById("weekCreditsVal").textContent = weekCredits.toFixed(1);
    document.getElementById("monthCreditsVal").textContent = monthCredits.toFixed(1);

    const maxCredits = 12.0; // 30 days * ~0.4
    const pct = Math.min(100, Math.round((monthCredits / maxCredits) * 100));
    document.getElementById("creditProgressBar").style.width = `${pct}%`;
}

// =========================================================
// RENDER HISTORY
// =========================================================
function renderHistory(historyList) {
    const container = document.getElementById("activityHistoryList");
    if (!container) return;

    if (!historyList || historyList.length === 0) {
        container.innerHTML = `<p style="color:#64748b;">No activity history recorded yet.</p>`;
        return;
    }

    const sorted = [...historyList].sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));

    container.innerHTML = sorted.map(item => {
        const isCompleted = item.status === "completed";
        const icon = isCompleted ? "✓" : "❌";
        const creditText = isCompleted ? `+${(item.creditValue || 0.4).toFixed(1)}` : "0";

        return `
            <div class="history-item-row">
                <div class="history-item-left">
                    <span class="history-date">${formatShortDate(item.date)}</span>
                    <span class="history-name">${item.activityName}</span>
                </div>
                <div class="history-item-right">
                    <span class="history-status-icon">${icon}</span>
                    <span class="history-credit ${isCompleted ? "" : "zero"}">${creditText}</span>
                </div>
            </div>
        `;
    }).join("");
}

// =========================================================
// COMPLETE ACTIVITY TASK
// =========================================================
async function completeActivityTask(activityId, dateStr) {
    if (!selectedPetId) return;

    try {
        const res = await apiFetch(`${API_BASE}/activity/complete`, {
            method: "POST",
            body: JSON.stringify({
                petId: selectedPetId,
                activityId: activityId,
                date: dateStr
            })
        });

        alert("Activity marked complete! +0.4 Activity Credits earned! 🏃");
        await loadActivityData();
    } catch (err) {
        console.error("Error completing activity:", err);
        alert(err.message || "Failed to mark activity complete.");
    }
}

// =========================================================
// PROFILE MODAL HELPERS & SUBMISSION
// =========================================================
function openActivityModal() {
    const modal = document.getElementById("activityModal");
    if (modal) modal.style.display = "flex";
}

function hideActivityModal() {
    const modal = document.getElementById("activityModal");
    if (modal) modal.style.display = "none";
}

function prefillActivityForm(profile) {
    if (!profile) return;
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el && val !== undefined && val !== null) el.value = val;
    };

    setVal("actActivityLevel", profile.activityLevel);
    setVal("actEnergyLevel", profile.energyLevel);
    setVal("actLifestyle", profile.lifestyle);
    setVal("actEnvironment", profile.environment);
    setVal("actFavorites", profile.favoriteActivities);
    setVal("actDisliked", profile.dislikedActivities);
    setVal("actRestrictions", profile.activityRestrictions);

    if (Array.isArray(profile.currentRoutine)) {
        document.querySelectorAll('#activityProfileForm input[name="currentRoutine"]').forEach(cb => {
            cb.checked = profile.currentRoutine.includes(cb.value);
        });
    }
}

async function handleActivityFormSubmit(e) {
    e.preventDefault();
    if (!selectedPetId) return;

    const saveBtn = document.getElementById("saveActivityModalBtn");
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving & Generating Plan...";
    }

    try {
        const routineCheckboxes = document.querySelectorAll('#activityProfileForm input[name="currentRoutine"]:checked');
        const currentRoutine = Array.from(routineCheckboxes).map(cb => cb.value);

        const payload = {
            activityLevel: document.getElementById("actActivityLevel")?.value || "Moderate",
            energyLevel: document.getElementById("actEnergyLevel")?.value || "Moderate",
            lifestyle: document.getElementById("actLifestyle")?.value || "Mixed",
            environment: document.getElementById("actEnvironment")?.value || "Outdoor access",
            currentRoutine: currentRoutine,
            favoriteActivities: document.getElementById("actFavorites")?.value || "",
            dislikedActivities: document.getElementById("actDisliked")?.value || "",
            activityRestrictions: document.getElementById("actRestrictions")?.value || ""
        };

        // 1. Save profile
        await apiFetch(`${API_BASE}/activity/profile/${selectedPetId}`, {
            method: "POST",
            body: JSON.stringify(payload)
        });

        // 2. Generate plan
        await apiFetch(`${API_BASE}/activity/generate-plan/${selectedPetId}`, {
            method: "POST"
        });

        hideActivityModal();
        alert("Activity Profile Saved & Personalized 30-Day Plan Generated! 🏃");
        await loadActivityData();
    } catch (err) {
        console.error("Error saving activity profile:", err);
        alert(err.message || "Failed to save activity profile.");
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = "Save Profile & Generate Plan";
        }
    }
}

async function handleRegeneratePlan() {
    if (!selectedPetId) return;
    if (!confirm("Are you sure you want to generate a new 30-day Activity Plan?")) return;

    const btn = document.getElementById("regeneratePlanBtn");
    if (btn) {
        btn.disabled = true;
        btn.textContent = "Generating Plan...";
    }

    try {
        await apiFetch(`${API_BASE}/activity/generate-plan/${selectedPetId}`, {
            method: "POST"
        });

        alert("New personalized 30-day Activity Plan generated! 🏃");
        await loadActivityData();
    } catch (err) {
        console.error("Error regenerating plan:", err);
        alert(err.message || "Failed to generate new activity plan.");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = "✨ Generate New Monthly Plan";
        }
    }
}

// =========================================================
// INCOMPLETE STATE & POPUP
// =========================================================
function showIncompleteState(petName) {
    const incCard = document.getElementById("activityIncompleteCard");
    const planView = document.getElementById("activityPlanView");
    const title = document.getElementById("incompletePetTitle");
    const msg = document.getElementById("incompletePetMsg");

    if (title) title.textContent = `Complete ${petName}'s Activity Profile`;
    if (msg) msg.textContent = `${petName}'s Activity profile is not completed yet. Please complete the Activity information before generating a personalized activity plan.`;

    if (incCard) incCard.style.display = "block";
    if (planView) planView.style.display = "none";
}

function showCompletePlanState() {
    const incCard = document.getElementById("activityIncompleteCard");
    const planView = document.getElementById("activityPlanView");

    if (incCard) incCard.style.display = "none";
    if (planView) planView.style.display = "block";
}

function showProfileIncompletePopup(petName) {
    let existingModal = document.getElementById("profileIncompleteModal");
    if (existingModal) existingModal.remove();

    const modal = document.createElement("div");
    modal.id = "profileIncompleteModal";
    modal.className = "modal-backdrop";
    modal.style.display = "flex";
    modal.style.zIndex = "4000";

    modal.innerHTML = `
        <div class="modal-dialog incomplete-modal-dialog" style="max-width: 480px; padding: 28px; text-align: center;">
            <div style="font-size: 42px; margin-bottom: 12px;">🏃</div>
            <h2 style="margin: 0 0 12px 0; font-size: 1.3rem; font-weight: 800; color: #173b5f;">Complete Activity Profile</h2>
            <p style="color: #475569; font-size: 0.95rem; line-height: 1.5; margin-bottom: 24px;">
                <strong>${escapeHTML(petName)}'s Activity profile is not completed yet.</strong><br>
                Complete the Activity information first to generate a personalized activity plan.
            </p>
            <div style="display: flex; justify-content: center; gap: 12px;">
                <button type="button" id="cancelIncompleteModalBtn" class="action-btn btn-secondary" style="padding: 10px 20px;">Cancel</button>
                <button type="button" id="completeIncompleteModalBtn" class="action-btn btn-primary" style="padding: 10px 20px;">Complete Activity Profile</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("cancelIncompleteModalBtn").addEventListener("click", () => {
        modal.remove();
    });

    document.getElementById("completeIncompleteModalBtn").addEventListener("click", () => {
        modal.remove();
        openActivityModal();
    });
}