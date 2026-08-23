/* =========================================
   PAWSYNC - PET-WISE ANALYTICS DASHBOARD & EXPORT
========================================= */

const API_BASE = (typeof window !== "undefined" && window.location && window.location.protocol === "file:") ? "http://localhost:5000/api" : "/api";
let currentPetId = null;
let currentAnalyticsData = null;
let trendChart = null;

function getToken() {
    return localStorage.getItem("pawsyncToken");
}

function getAuthHeaders() {
    const token = getToken();
    return {
        "Content-Type": "application/json",
        "Authorization": token ? (token.startsWith("Bearer ") ? token : `Bearer ${token}`) : ""
    };
}

document.addEventListener("DOMContentLoaded", () => {
    initAnalyticsPage();
});

async function initAnalyticsPage() {
    setupEventListeners();
    await loadUserPets();
}

function setupEventListeners() {
    const petSelect = document.getElementById("petSelect");
    if (petSelect) {
        petSelect.addEventListener("change", (e) => {
            const petId = e.target.value;
            if (petId) {
                currentPetId = petId;
                localStorage.setItem("pawsyncSelectedPet", petId);
                if (window.updateNavbarManagingPetName) {
                    window.updateNavbarManagingPetName(petId);
                }
                loadAnalyticsData(currentPetId);
            }
        });
    }

    const periodSelect = document.getElementById("periodSelect");
    if (periodSelect) {
        periodSelect.addEventListener("change", () => {
            if (currentPetId) {
                loadAnalyticsData(currentPetId);
            }
        });
    }

    const exportPdfBtn = document.getElementById("exportPdfBtn");
    const bottomExportPdfBtn = document.getElementById("bottomExportPdfBtn");
    if (exportPdfBtn) exportPdfBtn.addEventListener("click", exportPdfReport);
    if (bottomExportPdfBtn) bottomExportPdfBtn.addEventListener("click", exportPdfReport);

    const exportCsvBtn = document.getElementById("exportCsvBtn");
    if (exportCsvBtn) exportCsvBtn.addEventListener("click", exportCsvData);
}

/* =========================================
   LOAD USER PETS FOR DROPDOWN
========================================= */

async function loadUserPets() {
    const token = getToken();
    if (!token) {
        alert("Please login again.");
        window.location.href = "/frontend/auth/login/login.html";
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/pets`, {
            method: "GET",
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
            console.error("Failed to load pets:", data.message);
            return;
        }

        const pets = Array.isArray(data.pets) ? data.pets : [];
        const petSelect = document.getElementById("petSelect");

        if (!petSelect) return;
        petSelect.innerHTML = "";

        if (pets.length === 0) {
            petSelect.innerHTML = `<option value="">No pets found</option>`;
            return;
        }

        let savedPetId = localStorage.getItem("pawsyncSelectedPet");
        let initialPetId = pets[0]._id;

        pets.forEach(pet => {
            const opt = document.createElement("option");
            opt.value = pet._id;
            opt.textContent = `${pet.petName} (${pet.species || "Pet"})`;
            if (String(pet._id) === String(savedPetId)) {
                opt.selected = true;
                initialPetId = pet._id;
            }
            petSelect.appendChild(opt);
        });

        currentPetId = initialPetId;
        localStorage.setItem("pawsyncSelectedPet", currentPetId);
        if (window.updateNavbarManagingPetName) {
            window.updateNavbarManagingPetName(currentPetId);
        }

        await loadAnalyticsData(currentPetId);
    } catch (err) {
        console.error("LOAD PETS ERROR:", err);
    }
}

/* =========================================
   FETCH ANALYTICS DATA FROM BACKEND
========================================= */

async function loadAnalyticsData(petId) {
    if (!petId) return;

    const periodSelect = document.getElementById("periodSelect");
    const period = periodSelect ? periodSelect.value : "30";

    try {
        const response = await fetch(`${API_BASE}/pets/analytics/${petId}?period=${period}`, {
            method: "GET",
            headers: getAuthHeaders()
        });

        const data = await response.json();
        if (!response.ok || !data.success || !data.analytics) {
            console.error("Analytics fetch failed:", data.message);
            return;
        }

        currentAnalyticsData = data.analytics;
        renderAnalyticsDashboard(data.analytics);
    } catch (err) {
        console.error("LOAD ANALYTICS ERROR:", err);
    }
}

/* =========================================
   RENDER ANALYTICS DASHBOARD
========================================= */

function renderAnalyticsDashboard(an) {
    if (!an) return;
    const pet = an.pet || {};

    // 1. PET OVERVIEW HERO
    const petPhoto = document.getElementById("analyticsPetPhoto");
    const petEmoji = document.getElementById("analyticsPetEmoji");
    if (petPhoto && petEmoji) {
        if (pet.image) {
            petPhoto.src = pet.image;
            petPhoto.style.display = "block";
            petEmoji.style.display = "none";
        } else {
            petPhoto.style.display = "none";
            petEmoji.style.display = "block";
        }
    }

    setText("analyticsPetName", pet.name || "Pet Analytics");
    setText("analyticsPetSpecies", pet.species || "Species");
    setText("analyticsPetBreed", pet.breed || "Breed");
    setText("analyticsPetAge", pet.age || "Age");
    setText("analyticsPetWeight", pet.weight || "Weight");
    setText("analyticsPetGender", pet.gender || "Gender");
    setText("petMetaSubheader", `${pet.name || "Pet"}'s performance analytics from ${an.period.start} to ${an.period.end}`);

    // 2. OVERALL CARE SCORE
    const ov = an.overall || {};
    setText("overallScoreVal", ov.score || 0);
    setBarWidth("overallScoreBar", ov.score || 0);

    const nut = an.nutrition || {};
    const groom = an.grooming || {};
    const act = an.activity || {};
    const vac = an.vaccination || {};

    setText("scoreNutVal", `${nut.completionRate || 0}%`);
    setText("scoreGroomVal", `${groom.completionRate || 0}%`);
    setText("scoreActVal", `${act.completionRate || 0}%`);
    setText("scoreVacVal", `${vac.completed > 0 ? 100 : 0}%`);

    // 3. CARE PERFORMANCE METRICS
    setText("completedTasksNum", ov.totalCompleted || 0);
    setText("missedTasksNum", ov.totalMissed || 0);
    setText("completionRateNum", `${ov.completionRate || 0}%`);

    // 4. SECTION ANALYTICS
    // Nutrition
    setText("nutSchedVal", nut.scheduled || 0);
    setText("nutCompVal", nut.completed || 0);
    setText("nutMissVal", nut.missed || 0);
    setText("nutRateVal", `${nut.completionRate || 0}%`);
    setBarWidth("nutBar", nut.completionRate || 0);
    setText("nutConsistencyPill", `Consistency: ${nut.consistency || "Good"}`);

    // Grooming (Includes Dental)
    setText("groomSchedVal", groom.scheduled || 0);
    setText("groomCompVal", groom.completed || 0);
    setText("groomMissVal", groom.missed || 0);
    setText("groomRateVal", `${groom.completionRate || 0}%`);
    setBarWidth("groomBar", groom.completionRate || 0);
    setText("groomConsistencyPill", `Consistency: ${groom.consistency || "Good"}`);

    // Activity
    setText("actSchedVal", act.scheduled || 0);
    setText("actCompVal", act.completed || 0);
    setText("actMissVal", act.missed || 0);
    setText("actRateVal", `${act.completionRate || 0}%`);
    setBarWidth("actBar", act.completionRate || 0);
    setText("actConsistencyPill", `Consistency: ${act.consistency || "Good"}`);

    // Vaccination
    setText("vacCompVal", vac.completed || 0);
    setText("vacUpVal", vac.upcoming || 0);
    setText("vacOverVal", vac.overdue || 0);
    const vacBanner = document.getElementById("vacStatusBanner");
    if (vacBanner) {
        vacBanner.textContent = `Status: ${vac.status || "🟢 On Track"}`;
        vacBanner.style.background = vac.overdue > 0 ? "#fef2f2" : "#f0fdf4";
        vacBanner.style.color = vac.overdue > 0 ? "#991b1b" : "#166534";
    }

    // 5. CARE PERFORMANCE OVER TIME CHART
    renderTrendChart(an.trendData || { labels: [], scores: [] });

    // 6. CARE CREDITS SUMMARY
    const cred = an.credits || {};
    setText("credNut", (cred.nutrition || 0).toFixed(1));
    setText("credGroom", (cred.grooming || 0).toFixed(1));
    setText("credAct", (cred.activity || 0).toFixed(1));
    setText("credVac", (cred.vaccination || 0).toFixed(1));
    setText("credTotal", (cred.total || 0).toFixed(1));

    // 7. AI PET INSIGHT SUMMARY
    setText("aiSummaryText", an.aiSummary || "Care summary is ready for review.");

    // 8. RECENT CARE HISTORY TABLE
    renderRecentHistoryTable(an.recentHistory || []);
}

/* =========================================
   HELPER UTILITIES
========================================= */

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val !== undefined && val !== null ? val : "--";
}

function setBarWidth(id, pct) {
    const el = document.getElementById(id);
    if (el) el.style.width = `${Math.min(100, Math.max(0, pct))}%`;
}

/* =========================================
   TREND CHART RENDERER
========================================= */

function renderTrendChart(trend) {
    const canvas = document.getElementById("trendChartCanvas");
    if (!canvas) return;

    if (trendChart) {
        trendChart.destroy();
    }

    const ctx = canvas.getContext("2d");
    trendChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: trend.labels || ["Week 1", "Week 2", "Week 3", "Week 4"],
            datasets: [{
                label: "Care Performance Score",
                data: trend.scores || [0, 0, 0, 0],
                borderColor: "#0d9588",
                backgroundColor: "rgba(13, 149, 136, 0.1)",
                fill: true,
                tension: 0.3,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: "#0d9588"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    ticks: { stepSize: 20 }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

/* =========================================
   RECENT CARE HISTORY TABLE RENDERER
========================================= */

function renderRecentHistoryTable(history) {
    const tbody = document.getElementById("recentHistoryBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!history || history.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#64748b; padding:18px;">No recent care history records found.</td></tr>`;
        return;
    }

    history.forEach(item => {
        const tr = document.createElement("tr");
        const isDone = item.status === "Completed";
        tr.innerHTML = `
            <td>${item.date}</td>
            <td>${item.icon || "📋"} ${item.section}</td>
            <td><strong>${item.activity}</strong></td>
            <td><span class="${isDone ? "status-badge-done" : "status-badge-miss"}">${isDone ? "✓ Completed" : "✗ Missed"}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

/* =========================================
   EXPORT PDF REPORT TO LOCAL DOWNLOADS
========================================= */

function exportPdfReport() {
    if (!currentAnalyticsData) {
        alert("Analytics data is loading. Please try again in a moment.");
        return;
    }

    const petName = currentAnalyticsData.pet ? currentAnalyticsData.pet.name : "Pet";
    const element = document.getElementById("analyticsReportContainer");

    const opt = {
        margin:       [0.4, 0.4, 0.4, 0.4],
        filename:     `${petName}_PawSync_Analytics_Report.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    if (window.html2pdf) {
        window.html2pdf().set(opt).from(element).save();
    } else {
        window.print();
    }
}

/* =========================================
   EXPORT CSV REPORT TO LOCAL DOWNLOADS
========================================= */

function exportCsvData() {
    if (!currentAnalyticsData) {
        alert("Analytics data is loading. Please try again in a moment.");
        return;
    }

    const pet = currentAnalyticsData.pet || {};
    const ov = currentAnalyticsData.overall || {};
    const cred = currentAnalyticsData.credits || {};
    const petName = pet.name || "Pet";

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `PAWSYNC PET CARE ANALYTICS REPORT\n`;
    csvContent += `Pet Name,${pet.name || ""}\n`;
    csvContent += `Species,${pet.species || ""}\n`;
    csvContent += `Breed,${pet.breed || ""}\n`;
    csvContent += `Age,${pet.age || ""}\n`;
    csvContent += `Weight,${pet.weight || ""}\n`;
    csvContent += `Report Period,${currentAnalyticsData.period.start} to ${currentAnalyticsData.period.end}\n\n`;

    csvContent += `CARE SUMMARY METRICS\n`;
    csvContent += `Overall Care Score,${ov.score}/100\n`;
    csvContent += `Completed Tasks,${ov.totalCompleted}\n`;
    csvContent += `Missed Tasks,${ov.totalMissed}\n`;
    csvContent += `Completion Rate,${ov.completionRate}%\n\n`;

    csvContent += `CARE CREDITS BREAKDOWN\n`;
    csvContent += `Nutrition Credits,${cred.nutrition}\n`;
    csvContent += `Grooming Credits,${cred.grooming}\n`;
    csvContent += `Activity Credits,${cred.activity}\n`;
    csvContent += `Vaccination Credits,${cred.vaccination}\n`;
    csvContent += `Total Credits,${cred.total}\n\n`;

    csvContent += `RECENT CARE HISTORY\n`;
    csvContent += `Date,Section,Activity,Status\n`;

    (currentAnalyticsData.recentHistory || []).forEach(row => {
        csvContent += `${row.date},${row.section},"${row.activity}",${row.status}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${petName}_PawSync_Analytics.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}