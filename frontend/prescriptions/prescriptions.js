/* =========================================================
   PAWSYNC PET PRESCRIPTIONS CONTROLLER
========================================================= */

let allOwnerPets = [];
let allPrescriptions = [];
let activePetFilter = "all";

document.addEventListener("DOMContentLoaded", () => {
    loadPrescriptionsData();
});

async function loadPrescriptionsData() {
    const gridEl = document.getElementById("prescriptionsGrid");
    if (!gridEl) return;

    const token = localStorage.getItem("pawsyncToken");
    if (!token) {
        window.location.href = "/frontend/auth/login/login.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/prescriptions/owner", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            gridEl.innerHTML = `<div class="empty-state">
                <span>⚠️</span>
                <h3>Unable to load prescriptions</h3>
                <p>${data.message || "Please try again later."}</p>
            </div>`;
            return;
        }

        allOwnerPets = data.pets || [];
        allPrescriptions = data.prescriptions || [];

        renderPetTabs();

        const selectedPetFromStorage = localStorage.getItem("pawsyncSelectedPet");
        if (selectedPetFromStorage && allOwnerPets.some(p => p._id === selectedPetFromStorage)) {
            activePetFilter = selectedPetFromStorage;
        }

        filterAndRenderPrescriptions();

    } catch (error) {
        console.error("Error loading prescriptions data:", error);
        gridEl.innerHTML = `<div class="empty-state">
            <span>⚠️</span>
            <h3>Error connecting to server</h3>
            <p>Please check your backend server connection.</p>
        </div>`;
    }
}

function renderPetTabs() {
    const tabsContainer = document.getElementById("petFilterTabs");
    if (!tabsContainer) return;

    tabsContainer.innerHTML = `
        <button class="pet-tab-btn ${activePetFilter === "all" ? "active" : ""}" onclick="switchPetFilter('all')">
            <span>🐾</span> All Pets
        </button>
    `;

    allOwnerPets.forEach(pet => {
        let emoji = "🐾";
        const species = (pet.species || "").toLowerCase();
        if (species.includes("cat")) emoji = "🐱";
        else if (species.includes("dog")) emoji = "🐶";
        else if (species.includes("bird")) emoji = "🐦";
        else if (species.includes("rabbit")) emoji = "🐰";

        const btn = document.createElement("button");
        btn.className = `pet-tab-btn ${activePetFilter === pet._id ? "active" : ""}`;
        btn.innerHTML = `<span>${emoji}</span> ${pet.petName} (${pet.species || "Pet"})`;
        btn.onclick = () => switchPetFilter(pet._id);
        tabsContainer.appendChild(btn);
    });
}

function switchPetFilter(petId) {
    activePetFilter = petId;
    renderPetTabs();
    filterAndRenderPrescriptions();
}

function filterAndRenderPrescriptions() {
    const gridEl = document.getElementById("prescriptionsGrid");
    gridEl.innerHTML = "";

    let filtered = allPrescriptions;
    if (activePetFilter !== "all") {
        filtered = allPrescriptions.filter(rx => {
            const rxPetId = rx.petId ? (rx.petId._id || rx.petId) : null;
            return rxPetId && rxPetId.toString() === activePetFilter.toString();
        });
    }

    if (filtered.length === 0) {
        let petName = "your pets";
        if (activePetFilter !== "all") {
            const matchedPet = allOwnerPets.find(p => p._id === activePetFilter);
            if (matchedPet) petName = matchedPet.petName;
        }

        gridEl.innerHTML = `<div class="empty-state">
            <span>💊</span>
            <h3>No digital prescriptions saved for ${petName}</h3>
            <p>Prescriptions issued by your veterinarian will automatically be saved and organized here.</p>
        </div>`;
        return;
    }

    filtered.forEach(rx => {
        const petObj = rx.petId || {};
        const vetObj = rx.vetId || {};

        const petName = petObj.petName || "Pet";
        const species = petObj.species || "Pet";
        const breed = petObj.breed || "";
        const vetName = vetObj.fullName ? `Dr. ${vetObj.fullName}` : "Veterinarian";
        const clinic = vetObj.clinicName || "PawSync Certified Vet Clinic";
        const dateStr = formatDate(rx.startDate || rx.createdAt);

        const card = document.createElement("div");
        card.className = "rx-card";
        card.innerHTML = `
            <div>
                <div class="rx-card-header">
                    <div class="rx-pet-info">
                        ${petObj.petPhoto ? `<img src="${petObj.petPhoto}" class="rx-pet-avatar" alt="${petName}">` : `<div class="rx-pet-avatar">🐾</div>`}
                        <div class="rx-pet-details">
                            <h3>${petName}</h3>
                            <span>${species} ${breed ? `• ${breed}` : ""}</span>
                        </div>
                    </div>
                    <span class="rx-status-badge">${rx.status || "Active"}</span>
                </div>

                <div class="rx-med-box">
                    <div class="rx-med-name">
                        <span>💊</span> ${rx.medicineName}
                    </div>
                    <div class="rx-med-meta">
                        <div class="rx-meta-item">
                            <strong>Dosage</strong>
                            <span>${rx.dosage}</span>
                        </div>
                        <div class="rx-meta-item">
                            <strong>Frequency</strong>
                            <span>${rx.frequency || "Once daily"}</span>
                        </div>
                        <div class="rx-meta-item">
                            <strong>Duration</strong>
                            <span>${rx.duration || "7 days"}</span>
                        </div>
                        <div class="rx-meta-item">
                            <strong>Prescribed On</strong>
                            <span>${dateStr}</span>
                        </div>
                    </div>
                    ${rx.instructions ? `
                        <div class="rx-instructions">
                            <strong>Instructions:</strong> ${rx.instructions}
                        </div>
                    ` : ""}
                </div>

                <div class="rx-doctor-info">
                    Prescribed by <strong>${vetName}</strong> (${clinic})
                </div>
            </div>

            <div class="rx-actions">
                <button class="btn-view-rx" onclick="viewRxModal('${rx._id}')">
                    <span>📄</span> View Digital Rx Document
                </button>
            </div>
        `;

        gridEl.appendChild(card);
    });
}

function formatDate(dateInput) {
    if (!dateInput) return "N/A";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "N/A";
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
}

function viewRxModal(rxId) {
    const rx = allPrescriptions.find(item => item._id === rxId);
    if (!rx) return;
    activeRxItem = rx;

    const petObj = rx.petId || {};
    const vetObj = rx.vetId || {};

    const contentEl = document.getElementById("rxModalContent");
    contentEl.innerHTML = `
        <div class="rx-doc-header">
            <div>
                <div class="rx-doc-brand">🐾 PawSync</div>
                <div style="font-size: 11px; color: #64748b; font-weight: 800; letter-spacing: 0.1em; margin-top: 4px;">OFFICIAL VETERINARY PRESCRIPTION</div>
            </div>
            <div class="rx-doc-vet">
                <h4>Dr. ${vetObj.fullName || "Veterinarian"}</h4>
                <div>${vetObj.specialization || "Veterinary Medicine"}</div>
                <div>${vetObj.clinicName || "PawSync Certified Vet Clinic"}</div>
                <div>${vetObj.clinicAddress || "Clinic Address"}</div>
                ${vetObj.phone ? `<div>Phone: ${vetObj.phone}</div>` : ""}
            </div>
        </div>

        <div class="rx-doc-patient">
            <div><strong>Patient Name:</strong> ${petObj.petName || "Pet"}</div>
            <div><strong>Species/Breed:</strong> ${petObj.species || ""} ${petObj.breed ? `(${petObj.breed})` : ""}</div>
            <div><strong>Rx Date:</strong> ${formatDate(rx.startDate || rx.createdAt)}</div>
            <div><strong>Status:</strong> ${rx.status || "Active"}</div>
        </div>

        <div style="font-size: 18px; font-weight: 850; color: #0d9488; margin-bottom: 12px;">Rx Medicines</div>

        <table class="rx-table">
            <thead>
                <tr>
                    <th>Medicine Name</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>${rx.medicineName}</strong></td>
                    <td>${rx.dosage}</td>
                    <td>${rx.frequency || "Once daily"}</td>
                    <td>${rx.duration || "7 days"}</td>
                </tr>
            </tbody>
        </table>

        ${rx.instructions ? `
            <div style="background: #f8fafc; border-radius: 10px; padding: 14px; margin-bottom: 20px; font-size: 13px;">
                <strong style="color: #0f172a;">Special Instructions:</strong>
                <p style="margin: 4px 0 0; color: #475569;">${rx.instructions}</p>
            </div>
        ` : ""}

        <div style="margin-top: 30px; text-align: right; font-size: 13px; color: #475569;">
            <div style="font-weight: 850; color: #0f172a;">Dr. ${vetObj.fullName || "Veterinarian"}</div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Electronically Verified via PawSync</div>
        </div>
    `;

    document.getElementById("rxModal").style.display = "flex";
}

function closeRxModal() {
    document.getElementById("rxModal").style.display = "none";
}

function downloadPrescription() {
    if (!activeRxItem) return;

    const rx = activeRxItem;
    const petObj = rx.petId || {};
    const vetObj = rx.vetId || {};
    const petName = petObj.petName || "Pet";
    const dateStr = formatDate(rx.startDate || rx.createdAt);

    const docHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>PawSync Prescription - ${petName}</title>
<style>
body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #0f172a; max-width: 700px; margin: 0 auto; background: #f8fafc; }
.rx-doc { border: 2px solid #0d9488; border-radius: 16px; padding: 32px; background: #ffffff; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
.rx-doc-header { display: flex; justify-content: space-between; padding-bottom: 18px; border-bottom: 2px solid #0d9488; margin-bottom: 20px; }
.rx-doc-brand { font-size: 24px; font-weight: 850; color: #0d9488; }
.rx-doc-vet { text-align: right; font-size: 13px; color: #475569; }
.rx-doc-patient { background: #f8fafc; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 13px; }
.rx-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
.rx-table th, .rx-table td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 13.5px; }
.rx-table th { background: #f0fdfa; color: #0f766e; font-weight: 800; font-size: 12px; text-transform: uppercase; }
.rx-footer { margin-top: 30px; text-align: right; font-size: 13px; color: #475569; }
</style>
</head>
<body>
<div class="rx-doc">
  <div class="rx-doc-header">
    <div>
      <div class="rx-doc-brand">🐾 PawSync</div>
      <div style="font-size: 11px; color: #64748b; font-weight: 800; letter-spacing: 0.1em; margin-top: 4px;">OFFICIAL VETERINARY PRESCRIPTION</div>
    </div>
    <div class="rx-doc-vet">
      <h4 style="margin:0; font-size:16px; color:#0f172a;">Dr. ${vetObj.fullName || "Veterinarian"}</h4>
      <div>${vetObj.specialization || "Veterinary Medicine"}</div>
      <div>${vetObj.clinicName || "PawSync Certified Vet Clinic"}</div>
      <div>${vetObj.clinicAddress || "Clinic Address"}</div>
      ${vetObj.phone ? `<div>Phone: ${vetObj.phone}</div>` : ""}
    </div>
  </div>
  <div class="rx-doc-patient">
    <div><strong>Patient Name:</strong> ${petName}</div>
    <div><strong>Species/Breed:</strong> ${petObj.species || ""} ${petObj.breed ? `(${petObj.breed})` : ""}</div>
    <div><strong>Rx Date:</strong> ${dateStr}</div>
    <div><strong>Status:</strong> ${rx.status || "Active"}</div>
  </div>
  <div style="font-size: 18px; font-weight: 850; color: #0d9488; margin-bottom: 12px;">Rx Medicines</div>
  <table class="rx-table">
    <thead>
      <tr>
        <th>Medicine Name</th>
        <th>Dosage</th>
        <th>Frequency</th>
        <th>Duration</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>${rx.medicineName}</strong></td>
        <td>${rx.dosage}</td>
        <td>${rx.frequency || "Once daily"}</td>
        <td>${rx.duration || "7 days"}</td>
      </tr>
    </tbody>
  </table>
  ${rx.instructions ? `
    <div style="background: #f8fafc; border-radius: 10px; padding: 14px; margin-bottom: 20px; font-size: 13px;">
      <strong style="color: #0f172a;">Special Instructions:</strong>
      <p style="margin: 4px 0 0; color: #475569;">${rx.instructions}</p>
    </div>
  ` : ""}
  <div class="rx-footer">
    <div style="font-weight: 850; color: #0f172a;">Dr. ${vetObj.fullName || "Veterinarian"}</div>
    <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Electronically Verified via PawSync</div>
  </div>
</div>
</body>
</html>`;

    const blob = new Blob([docHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PawSync_Prescription_${petName.replace(/\s+/g, '_')}_${rx.medicineName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
