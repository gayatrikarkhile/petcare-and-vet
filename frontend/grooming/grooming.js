/* =========================================================
   PAWSYNC / PETVERSE AI — GROOMING SECTION JAVASCRIPT
   ========================================================= */

const API_BASE = "/api";

let userPets = [];
let selectedPetId = null;
let activePlanData = null;
let currentWeekFilter = "1"; // Default to current week
let userManuallySelectedTab = false;

// Activity Type Icons mapping
const ACTIVITY_ICONS = {
    coat_care: "🪮",
    brushing: "🪮",
    bathing: "🛁",
    nail_care: "✂️",
    ear_care: "👂",
    paw_care: "🐾",
    dental_care: "🦷"
};

const ACTIVITY_LABELS = {
    coat_care: "Coat Care",
    brushing: "Brushing",
    bathing: "Bathing",
    nail_care: "Nail Care",
    ear_care: "Ear Care",
    paw_care: "Paw Care",
    dental_care: "Dental Care 🦷"
};

document.addEventListener("DOMContentLoaded", () => {
    initGroomingPage();
});

/* =========================================================
   1. AUTHENTICATION & API HELPERS
   ========================================================= */
function getAuthHeaders() {
    const headers = { "Content-Type": "application/json" };
    const token = localStorage.getItem("pawsyncToken");
    if (token) {
        headers.Authorization = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return headers;
}

async function apiFetch(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
            ...getAuthHeaders(),
            ...(options.headers || {})
        }
    });

    const contentType = response.headers.get("content-type") || "";
    let data = {};
    if (contentType.includes("application/json")) {
        data = await response.json();
    } else {
        const text = await response.text();
        console.error("Non-JSON Response:", text);
        throw new Error(`Request failed with status ${response.status}`);
    }

    if (!response.ok) {
        const err = new Error(data.message || "API request failed");
        err.status = response.status;
        err.data = data;
        throw err;
    }

    return data;
}

/* =========================================================
   2. INITIALIZE PAGE & PET SELECTION
   ========================================================= */
async function initGroomingPage() {
    setupEventListeners();
    await loadUserPets();
}

function setupEventListeners() {
    const petSelect = document.getElementById("petSelect");
    if (petSelect) {
        petSelect.addEventListener("change", (e) => {
            selectedPetId = e.target.value;
            if (selectedPetId) {
                localStorage.setItem("lastGroomingPetId", selectedPetId);
                userManuallySelectedTab = false;
                loadGroomingPlan(selectedPetId);
            }
        });
    }

    // Modal open / close
    const openFormBtn = document.getElementById("openFormBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const cancelModalBtn = document.getElementById("cancelModalBtn");

    if (openFormBtn) {
        openFormBtn.addEventListener("click", () => {
            openGroomingModal();
        });
    }

    if (closeModalBtn) closeModalBtn.addEventListener("click", hideModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener("click", hideModal);

    // Form submission
    const groomingForm = document.getElementById("groomingForm");
    if (groomingForm) {
        groomingForm.addEventListener("submit", handleFormSubmit);
    }

    // Regenerate Plan button
    const regeneratePlanBtn = document.getElementById("regeneratePlanBtn");
    if (regeneratePlanBtn) {
        regeneratePlanBtn.addEventListener("click", () => {
            if (selectedPetId) {
                generateNewMonthlyPlan(selectedPetId);
            } else {
                alert("Please select or add a pet first.");
            }
        });
    }

    // Week tabs
    const weekTabs = document.querySelectorAll(".filter-tab");
    weekTabs.forEach(tab => {
        tab.addEventListener("click", (e) => {
            weekTabs.forEach(t => t.classList.remove("active"));
            e.target.classList.add("active");
            currentWeekFilter = e.target.dataset.week;
            userManuallySelectedTab = true;
            renderMonthlyActivities();
        });
    });
}

async function loadUserPets() {
    try {
        const data = await apiFetch(`${API_BASE}/pets`);
        userPets = data.pets || data || [];

        const petSelect = document.getElementById("petSelect");
        if (!petSelect) return;

        if (!Array.isArray(userPets) || userPets.length === 0) {
            petSelect.innerHTML = `<option value="">No pets registered yet</option>`;
            renderEmptyNoPetsState();
            return;
        }

        petSelect.innerHTML = userPets.map(pet => `
            <option value="${pet._id}">${pet.species === "Cat" ? "🐱" : pet.species === "Rabbit" ? "🐰" : "🐶"} ${pet.petName} (${pet.breed})</option>
        `).join("");

        const urlParams = new URLSearchParams(window.location.search);
        const urlPetId = urlParams.get("petId");
        const savedPetId = localStorage.getItem("lastGroomingPetId");

        if (urlPetId && userPets.some(p => p._id === urlPetId)) {
            selectedPetId = urlPetId;
        } else if (savedPetId && userPets.some(p => p._id === savedPetId)) {
            selectedPetId = savedPetId;
        } else {
            selectedPetId = userPets[0]._id;
        }

        petSelect.value = selectedPetId;
        localStorage.setItem("lastGroomingPetId", selectedPetId);
        await loadGroomingPlan(selectedPetId);
    } catch (error) {
        console.error("Error loading user pets:", error);
        renderEmptyNoPetsState();
    }
}

function renderEmptyNoPetsState() {
    const metaEl = document.getElementById("selectedPetInfo");
    if (metaEl) metaEl.textContent = "No active pet profile";

    document.getElementById("todaysTasksList").innerHTML = `
        <div class="empty-state">
            <p>No pets found in your account.</p>
            <a href="/frontend/addPetForm/addPetForm.html" class="action-btn btn-primary" style="display: inline-block; margin-top: 8px; text-decoration: none;">+ Add a New Pet</a>
        </div>
    `;

    document.getElementById("monthlyActivitiesContainer").innerHTML = `
        <div class="empty-state">
            <p>Please add a pet to create a personalized monthly grooming plan.</p>
        </div>
    `;

    document.getElementById("historyLogList").innerHTML = `
        <div class="empty-state">No grooming history available.</div>
    `;
}

/* =========================================================
   3. LOAD GROOMING PLAN FOR SELECTED PET
   ========================================================= */
async function loadGroomingPlan(petId) {
    if (!petId) return;

    try {
        const selectedPetObj = userPets.find(p => p._id === petId);
        if (selectedPetObj) {
            renderPetHeader({
                petName: selectedPetObj.petName,
                species: selectedPetObj.species,
                breed: selectedPetObj.breed,
                age: selectedPetObj.dateOfBirth ? "Active" : "N/A",
                weight: selectedPetObj.currentWeight ? `${selectedPetObj.currentWeight.value} ${selectedPetObj.currentWeight.unit || "kg"}` : "N/A"
            });
        }

        const data = await apiFetch(`${API_BASE}/grooming/plan/${petId}`);

        if (data.code === "PROFILE_INCOMPLETE" || data.profileIncomplete) {
            const petName = data.pet?.petName || selectedPetObj?.petName || "Pet";
            renderIncompleteGroomingProfileState(petName);
            showProfileIncompletePopup(petName, "Grooming", openGroomingModal);
            return;
        }

        activePlanData = data;

        // Auto-select current week tab if user hasn't manually clicked
        if (!userManuallySelectedTab && data.currentWeekNum) {
            currentWeekFilter = String(data.currentWeekNum);
            updateWeekTabHighlight(currentWeekFilter);
        }

        renderPetHeader(data.pet || selectedPetObj);
        renderOverviewAndStats(data);
        renderTodaysTasks(data.todaysActivities || []);
        renderMonthlyActivities();
        renderHistoryLog(data.completionHistory || []);
    } catch (error) {
        console.error("Error loading grooming plan:", error);
        if (error.data && (error.data.code === "PROFILE_INCOMPLETE" || error.data.profileIncomplete)) {
            const petName = error.data.pet?.petName || "Pet";
            renderIncompleteGroomingProfileState(petName);
            showProfileIncompletePopup(petName, "Grooming", openGroomingModal);
            return;
        }
        renderPlanErrorState();
    }
}

function renderIncompleteGroomingProfileState(petName) {
    const todaysTasksList = document.getElementById("todaysTasksList");
    if (todaysTasksList) {
        todaysTasksList.innerHTML = `
            <div class="empty-state" style="padding: 24px; text-align: center;">
                <span style="font-size: 32px;">✂️</span>
                <h3 style="margin: 8px 0; color: #173b5f;">Complete ${petName}'s Grooming Profile</h3>
                <p style="color: #64748b; font-size: 0.9rem; max-width: 420px; margin: 0 auto 14px;">${petName}'s Grooming profile is not completed yet. Complete the Grooming information first to generate a personalized monthly grooming plan.</p>
                <button class="action-btn btn-primary" onclick="openGroomingModal()">Complete Grooming Profile</button>
            </div>
        `;
    }

    const monthlyContainer = document.getElementById("monthlyActivitiesContainer");
    if (monthlyContainer) {
        monthlyContainer.innerHTML = `
            <div class="empty-state" style="padding: 30px; text-align: center;">
                <p>No monthly grooming plan available. Please complete ${petName}'s grooming profile to unlock AI plan generation.</p>
            </div>
        `;
    }

    const historyList = document.getElementById("historyLogList");
    if (historyList) {
        historyList.innerHTML = `<div class="empty-state">No grooming history available.</div>`;
    }
}

function showProfileIncompletePopup(petName, sectionName, onCompleteClick) {
    let existingModal = document.getElementById("profileIncompleteModal");
    if (existingModal) existingModal.remove();

    const modal = document.createElement("div");
    modal.id = "profileIncompleteModal";
    modal.className = "modal-backdrop";
    modal.style.display = "flex";
    modal.style.zIndex = "4000";

    const icon = sectionName === "Nutrition" ? "🍲" : sectionName === "Grooming" ? "✂️" : "🏃";

    modal.innerHTML = `
        <div class="modal-dialog incomplete-modal-dialog" style="max-width: 480px; padding: 28px; text-align: center; border-radius: 20px; background: white; box-shadow: 0 20px 50px rgba(0,0,0,0.25);">
            <div style="font-size: 42px; margin-bottom: 12px;">${icon}</div>
            <h2 style="margin: 0 0 12px 0; font-size: 1.3rem; font-weight: 800; color: #173b5f;">Complete ${sectionName} Profile</h2>
            <p style="color: #475569; font-size: 0.95rem; line-height: 1.5; margin-bottom: 24px;">
                <strong>${petName}'s ${sectionName} profile is not completed yet.</strong><br>
                Complete the ${sectionName} information first to generate a personalized monthly ${sectionName.toLowerCase()} plan.
            </p>
            <div style="display: flex; justify-content: center; gap: 12px;">
                <button type="button" id="cancelIncompleteModalBtn" class="action-btn btn-secondary" style="padding: 10px 20px; border-radius: 10px; font-weight: 700; border: 1px solid #cbd5e1; background: #f1f5f9; cursor: pointer; color: #475569;">Cancel</button>
                <button type="button" id="completeIncompleteModalBtn" class="action-btn btn-primary" style="padding: 10px 20px; border-radius: 10px; font-weight: 700; background: #0d9588; color: white; border: none; cursor: pointer;">Complete ${sectionName} Profile</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("cancelIncompleteModalBtn").addEventListener("click", () => {
        modal.remove();
    });

    document.getElementById("completeIncompleteModalBtn").addEventListener("click", () => {
        modal.remove();
        if (typeof onCompleteClick === "function") {
            onCompleteClick();
        }
    });
}

function updateWeekTabHighlight(weekNumStr) {
    const weekTabs = document.querySelectorAll(".filter-tab");
    weekTabs.forEach(tab => {
        if (tab.dataset.week === weekNumStr) {
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    });
}

function renderPetHeader(pet) {
    if (!pet) return;
    const metaEl = document.getElementById("selectedPetInfo");
    const avatarEl = document.getElementById("petAvatarIcon");
    if (metaEl) {
        metaEl.textContent = `${pet.breed || pet.species || "Pet"} | ${pet.age || ""} | ${pet.weight || ""}`;
    }
    if (avatarEl) {
        avatarEl.textContent = (pet.species === "Cat") ? "🐱" : (pet.species === "Rabbit") ? "🐰" : "🐶";
    }
}

function renderPlanErrorState() {
    document.getElementById("todaysTasksList").innerHTML = `
        <div class="empty-state">
            <p>Could not load today's tasks.</p>
            <button class="action-btn btn-primary" onclick="generateNewMonthlyPlan('${selectedPetId}')">✨ Generate Plan with AI</button>
        </div>
    `;

    document.getElementById("monthlyActivitiesContainer").innerHTML = `
        <div class="empty-state">
            <p>No active grooming plan found for this pet.</p>
            <button class="action-btn btn-primary" onclick="generateNewMonthlyPlan('${selectedPetId}')">✨ Generate Monthly Grooming Plan</button>
        </div>
    `;

    document.getElementById("historyLogList").innerHTML = `
        <div class="empty-state">No grooming history recorded yet.</div>
    `;
}

/* =========================================================
   4. RENDER OVERVIEW, PROGRESS & SCORE
   ========================================================= */
function renderOverviewAndStats(data) {
    const totalEligible = data.scoreSummary?.totalEligibleArrangements || 0;
    const completedCount = data.scoreSummary?.completedEligibleArrangements || 0;
    const monthlyPct = totalEligible > 0 ? Math.round((completedCount / totalEligible) * 100) : 0;

    document.getElementById("monthlyCompletionPct").textContent = `${monthlyPct}%`;

    // Weekly progress
    const weeklyComp = data.weeklyProgress?.completed || 0;
    const weeklyTotal = data.weeklyProgress?.total || 0;
    const weeklyPct = data.weeklyProgress?.percentage || 0;

    document.getElementById("weeklyCompletedCount").textContent = `${weeklyComp} / ${weeklyTotal}`;
    document.getElementById("weeklyProgressBar").style.width = `${weeklyPct}%`;
    document.getElementById("weeklyRawCredits").textContent = `${weeklyComp} Completed`;

    // Score
    const groomingScore = data.scoreSummary?.groomingScore || 0;
    const scorePct = Math.min(100, Math.round((groomingScore / 25) * 100));

    document.getElementById("totalRawCredits").textContent = `${completedCount} / ${totalEligible} Tasks`;
    document.getElementById("groomingScoreVal").textContent = groomingScore.toFixed(1);
    document.getElementById("groomingScoreBar").style.width = `${scorePct}%`;
}

/* =========================================================
   5. RENDER TODAY'S GROOMING TASKS
   ========================================================= */
function renderTodaysTasks(todaysTasks) {
    const listEl = document.getElementById("todaysTasksList");
    const badgeEl = document.getElementById("todayProgressBadge");

    if (!listEl) return;

    const completedCount = (todaysTasks || []).filter(t => t.completed).length;
    if (badgeEl) {
        badgeEl.textContent = `Today's Progress: ${completedCount} / ${(todaysTasks || []).length}`;
    }

    if (!todaysTasks || todaysTasks.length === 0) {
        listEl.innerHTML = `
            <div class="today-task-item">
                <div class="task-info-block">
                    <span class="task-icon">✨</span>
                    <div>
                        <div class="task-title">All tasks up to date!</div>
                        <div class="task-desc">No grooming activities scheduled for today. Check your monthly plan below.</div>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    listEl.innerHTML = todaysTasks.map(task => {
        const icon = ACTIVITY_ICONS[task.activityType] || "✂️";
        const isDental = task.activityType === "dental_care";
        const completed = task.completed;
        const dayOfWeekStr = task.dayOfWeek ? task.dayOfWeek.toUpperCase() : "TODAY";

        return `
            <div class="today-task-item ${completed ? "completed" : ""}">
                <div class="task-info-block">
                    <span class="task-icon">${icon}</span>
                    <div>
                        <div class="task-day-label">🟢 TODAY • ${dayOfWeekStr} (${task.date || ""})</div>
                        <div class="task-title">${task.activityName} ${isDental ? "🦷" : ""}</div>
                        <div class="task-desc">${task.description || "Routine pet hygiene activity"}</div>
                    </div>
                </div>
                <div class="task-actions-right">
                    <button 
                        class="complete-btn ${completed ? "done" : ""}" 
                        onclick="completeGroomingActivity('${task.activityId}')"
                        ${completed ? "disabled" : ""}
                    >
                        ${completed ? "✓ Completed" : "Mark Complete"}
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

/* =========================================================
   6. RENDER MONTHLY ACTIVITIES GRID WITH WEEK FILTER & 4-STATE LIFECYCLE
   ========================================================= */
function renderMonthlyActivities() {
    const container = document.getElementById("monthlyActivitiesContainer");
    if (!container || !activePlanData) return;

    let activities = activePlanData.activities || [];

    if (currentWeekFilter !== "all") {
        const weekNum = parseInt(currentWeekFilter);
        activities = activities.filter(a => a.weekNumber === weekNum);
    }

    if (activities.length === 0) {
        container.innerHTML = `<div class="empty-state">No activities scheduled for Week ${currentWeekFilter}.</div>`;
        return;
    }

    container.innerHTML = `
        <div class="activities-grid">
            ${activities.map(act => {
                const icon = ACTIVITY_ICONS[act.activityType] || "✂️";
                const isDental = act.activityType === "dental_care";
                const status = act.status || (act.completed ? "completed" : "scheduled");
                const dayOfWeekFormatted = act.dayOfWeek ? act.dayOfWeek.toUpperCase() : "DAY " + act.dayNumber;

                let buttonHtml = "";
                let isTodayCard = false;

                if (status === "completed" || act.completed) {
                    buttonHtml = `<button class="complete-btn done" disabled>✓ Completed</button>`;
                } else if (status === "failed") {
                    buttonHtml = `<span class="status-badge-failed">❌ Failed to Complete</span>`;
                } else if (status === "due_today") {
                    isTodayCard = true;
                    buttonHtml = `<button class="complete-btn" onclick="completeGroomingActivity('${act.activityId}')">Mark Complete</button>`;
                } else {
                    buttonHtml = `<button class="complete-btn locked" disabled>🔵 Scheduled</button>`;
                }

                return `
                    <div class="activity-card-item ${isDental ? "dental-activity" : ""} ${isTodayCard ? "today-highlight" : ""}">
                        <div class="act-header">
                            <span class="act-day-badge">📅 ${dayOfWeekFormatted} (${act.date || ""})</span>
                            <span class="act-type-badge ${act.activityType}">${ACTIVITY_LABELS[act.activityType] || act.activityType}</span>
                        </div>
                        <div class="act-name">${icon} ${act.activityName}</div>
                        <div class="act-desc">${act.description || ""}</div>
                        <div class="act-footer">
                            <span class="week-tag">Week ${act.weekNumber}</span>
                            ${buttonHtml}
                        </div>
                    </div>
                `;
            }).join("")}
        </div>
    `;
}

/* =========================================================
   7. COMPLETE ACTIVITY HANDLER
   ========================================================= */
async function completeGroomingActivity(activityId) {
    if (!selectedPetId || !activityId) return;

    try {
        const res = await apiFetch(`${API_BASE}/grooming/complete/${selectedPetId}`, {
            method: "POST",
            body: JSON.stringify({ activityId })
        });

        if (res.alreadyCompleted) {
            alert(res.message || "Already completed.");
            return;
        }

        if (res.expired) {
            alert(res.message || "This activity has expired and can no longer be completed.");
            return;
        }

        if (res.future) {
            alert(res.message || "This activity is scheduled for a future date.");
            return;
        }

        await loadGroomingPlan(selectedPetId);
    } catch (error) {
        console.error("Error completing activity:", error);
        alert(error.message || "Failed to complete activity. Only today's activities can be marked complete.");
    }
}

/* =========================================================
   8. RENDER HISTORY LOG
   ========================================================= */
function renderHistoryLog(history) {
    const container = document.getElementById("historyLogList");
    if (!container) return;

    if (!history || history.length === 0) {
        container.innerHTML = `<div class="empty-state">No grooming activities logged yet.</div>`;
        return;
    }

    container.innerHTML = history.slice(0, 10).map(item => {
        const icon = ACTIVITY_ICONS[item.activityType] || "✂️";
        return `
            <div class="history-item">
                <div>
                    <span class="history-name">${icon} ${item.activityName}</span>
                    <span class="history-date"> — ${item.date}</span>
                </div>
                <span class="history-done-tag">✓ Logged</span>
            </div>
        `;
    }).join("");
}

/* =========================================================
   9. MODAL FORM & AI GENERATION HANDLERS
   ========================================================= */
async function openGroomingModal() {
    if (!selectedPetId) return;

    try {
        const res = await apiFetch(`${API_BASE}/grooming/profile/${selectedPetId}`);
        const pet = res.pet || {};
        const profile = res.groomingProfile || {};

        document.getElementById("modalPetName").textContent = pet.petName || "--";
        document.getElementById("modalPetBreed").textContent = `${pet.species || "Pet"} | ${pet.breed || ""}`;
        document.getElementById("modalPetMeta").textContent = `${pet.age || ""} | ${pet.weight || ""}`;

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val || "";
        };

        setVal("coatType", profile.coatType);
        setVal("sheddingLevel", profile.sheddingLevel);
        setVal("skinCondition", profile.skinCondition);
        setVal("brushingFrequency", profile.brushingFrequency);
        setVal("bathingFrequency", profile.bathingFrequency);
        setVal("nailTrimmingFrequency", profile.nailTrimmingFrequency);
        setVal("earCleaningFrequency", profile.earCleaningFrequency);
        setVal("pawCareRoutine", profile.pawCareRoutine);

        setVal("toothBrushingFrequency", profile.toothBrushingFrequency);
        setVal("dentalHygieneRoutine", profile.dentalHygieneRoutine);
        setVal("dentalChews", profile.dentalChews);
        setVal("currentDentalCondition", profile.currentDentalCondition);
        setVal("dentalConcerns", profile.dentalConcerns);

        document.getElementById("groomingModal").style.display = "flex";
    } catch (error) {
        console.error("Error opening grooming modal:", error);
        document.getElementById("groomingModal").style.display = "flex";
    }
}

function hideModal() {
    const modal = document.getElementById("groomingModal");
    if (modal) modal.style.display = "none";
}

async function handleFormSubmit(e) {
    e.preventDefault();
    if (!selectedPetId) return;

    const formData = new FormData(e.target);
    const profileObj = {};
    formData.forEach((value, key) => {
        profileObj[key] = value;
    });

    try {
        await apiFetch(`${API_BASE}/grooming/profile/${selectedPetId}`, {
            method: "POST",
            body: JSON.stringify(profileObj)
        });

        hideModal();
        userManuallySelectedTab = false;
        await generateNewMonthlyPlan(selectedPetId);
    } catch (error) {
        console.error("Error saving grooming profile:", error);
        alert("Failed to save grooming profile.");
    }
}

async function generateNewMonthlyPlan(petId) {
    if (!petId) return;

    try {
        const btn = document.getElementById("regeneratePlanBtn");
        if (btn) {
            btn.disabled = true;
            btn.textContent = "✨ Gemini Generating...";
        }

        const res = await apiFetch(`${API_BASE}/grooming/generate-plan/${petId}`, {
            method: "POST"
        });

        if (res.code === "PROFILE_INCOMPLETE" || res.profileIncomplete) {
            const petName = res.pet?.petName || "Pet";
            showProfileIncompletePopup(petName, "Grooming", openGroomingModal);
            return;
        }

        userManuallySelectedTab = false;
        await loadGroomingPlan(petId);
    } catch (error) {
        console.error("Error generating AI grooming plan:", error);
        if (error.data && (error.data.code === "PROFILE_INCOMPLETE" || error.data.profileIncomplete)) {
            const petName = error.data.pet?.petName || "Pet";
            showProfileIncompletePopup(petName, "Grooming", openGroomingModal);
            return;
        }
        alert(error.message || "Failed to generate plan. Please try again.");
    } finally {
        const btn = document.getElementById("regeneratePlanBtn");
        if (btn) {
            btn.disabled = false;
            btn.textContent = "✨ Generate New Monthly Plan";
        }
    }
}