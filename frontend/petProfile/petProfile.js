/* =========================================
   PAWSYNC PET PROFILE
   DYNAMIC VERSION FROM MONGODB
========================================= */

const API_BASE = (typeof window !== "undefined" && window.location && window.location.protocol === "file:") ? "http://localhost:5000/api" : "/api";
let currentPet = null;

function getToken() {
    return localStorage.getItem("pawsyncToken");
}

function getSelectedPetId() {
    return localStorage.getItem("pawsyncSelectedPet");
}

function getAuthHeaders() {
    const token = getToken();
    return {
        "Content-Type": "application/json",
        "Authorization": token ? (token.startsWith("Bearer ") ? token : `Bearer ${token}`) : ""
    };
}

function calculateAge(dateOfBirth) {
    if (!dateOfBirth) return "Age not available";
    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) return "Age not available";

    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    if (today.getDate() < birthDate.getDate()) {
        months--;
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    if (years > 0) {
        return years === 1 ? "1 Year" : `${years} Years`;
    }
    if (months > 0) {
        return months === 1 ? "1 Month" : `${months} Months`;
    }
    return "Less than 1 Month";
}

function formatDateForInput(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = (value !== undefined && value !== null && value !== "") ? value : "--";
}

document.addEventListener("DOMContentLoaded", () => {
    initPetProfilePage();
});

async function initPetProfilePage() {
    setupEventListeners();
    await loadPetProfile();
}

function setupEventListeners() {
    const backButton = document.getElementById("backButton");
    if (backButton) {
        backButton.addEventListener("click", () => {
            window.location.href = "/frontend/pets/pets.html";
        });
    }

    const editPetBtn = document.getElementById("editPetBtn");
    if (editPetBtn) {
        editPetBtn.addEventListener("click", () => {
            if (currentPet) openEditModal(currentPet);
        });
    }

    const deletePetBtn = document.getElementById("deletePetBtn");
    if (deletePetBtn) {
        deletePetBtn.addEventListener("click", handleDeletePet);
    }

    const closeEditModalBtn = document.getElementById("closeEditModalBtn");
    const cancelEditModalBtn = document.getElementById("cancelEditModalBtn");

    if (closeEditModalBtn) closeEditModalBtn.addEventListener("click", hideEditModal);
    if (cancelEditModalBtn) cancelEditModalBtn.addEventListener("click", hideEditModal);

    const editPetForm = document.getElementById("editPetForm");
    if (editPetForm) {
        editPetForm.addEventListener("submit", handleEditFormSubmit);
    }

    const notificationButton = document.getElementById("notificationButton");
    if (notificationButton) {
        notificationButton.addEventListener("click", () => {
            alert("Notifications up to date.");
        });
    }
}

async function loadPetProfile() {
    const token = getToken();
    const selectedPetId = getSelectedPetId();

    if (!token) {
        alert("Please login again.");
        window.location.href = "/frontend/auth/login/login.html";
        return;
    }

    if (!selectedPetId) {
        alert("No pet selected.");
        window.location.href = "/frontend/pets/pets.html";
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/pets/${selectedPetId}`, {
            method: "GET",
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            // Fallback: search all pets array
            const allRes = await fetch(`${API_BASE}/pets`, { headers: getAuthHeaders() });
            const allData = await allRes.json();
            const petList = Array.isArray(allData.pets) ? allData.pets : Array.isArray(allData) ? allData : [];
            const foundPet = petList.find(p => String(p._id) === String(selectedPetId));

            if (foundPet) {
                currentPet = foundPet;
                displayPet(currentPet);
                return;
            }
            throw new Error(data.message || "Pet profile not found.");
        }

        currentPet = data.pet;
        displayPet(currentPet);
    } catch (error) {
        console.error("LOAD PET PROFILE ERROR:", error);
        alert("Unable to load pet profile: " + error.message);
    }
}

function displayPet(pet) {
    if (!pet) return;

    // Photo
    const petImage = document.getElementById("petImage");
    if (petImage) {
        petImage.src = pet.petPhoto || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80";
        petImage.alt = pet.petName || "Pet Photo";
    }

    // Weight formatted
    let weightText = "--";
    if (pet.currentWeight && pet.currentWeight.value !== undefined) {
        weightText = `${pet.currentWeight.value} ${pet.currentWeight.unit || "kg"}`;
    }

    // Hero Header Elements
    setText("petName", pet.petName);
    if (window.updateNavbarManagingPetName) window.updateNavbarManagingPetName(pet.petName);
    setText("petType", pet.species ? pet.species.toUpperCase() : "PET");
    setText("petBreed", pet.breed);
    setText("petAge", calculateAge(pet.dateOfBirth));
    setText("petGender", pet.gender);
    setText("petWeight", weightText);
    setText("petMicrochip", pet.microchipId || "None");

    // Basic Information Card
    setText("infoName", pet.petName);
    setText("infoSpecies", pet.species);
    setText("infoBreed", pet.breed);
    setText("infoGender", pet.gender);
    setText("infoAge", calculateAge(pet.dateOfBirth));
    setText("infoWeight", weightText);
    setText("infoReproductive", pet.reproductiveStatus || "Not specified");
    setText("infoMicrochip", pet.microchipId || "None");

    // Health Score
    const healthScore = pet.healthScore !== undefined ? Number(pet.healthScore) : 0;
    setText("healthScore", healthScore);

    const scoreProgress = document.getElementById("scoreProgress");
    if (scoreProgress) {
        scoreProgress.style.width = `${healthScore}%`;
    }

    // Medical conditions & allergies
    renderTagList("allergiesList", pet.knownAllergies, "No known allergies");
    renderTagList("conditionsList", pet.medicalConditions || pet.existingMedicalConditions, "No existing medical conditions");

    // Load Pet Safety QR
    loadPetQrDetails(pet._id, pet);
}

/* =========================================
   PET SAFETY QR & LOST/FOUND LOGIC
========================================= */

let currentQrToken = null;

async function loadPetQrDetails(petId, pet) {
    try {
        const res = await fetch(`${API_BASE}/pets/${petId}/qr`, {
            method: "GET",
            headers: getAuthHeaders()
        });

        const data = await res.json();
        if (!res.ok || !data.success || !data.qr) {
            console.error("QR Fetch error:", data);
            return;
        }

        currentQrToken = data.qr.qrToken;
        const publicUrl = `${window.location.origin}/pet/found/${currentQrToken}`;

        // Render QR Code
        const qrContainer = document.getElementById("qrcodeCanvas");
        if (qrContainer) {
            qrContainer.innerHTML = "";
            if (window.QRCode) {
                new QRCode(qrContainer, {
                    text: publicUrl,
                    width: 180,
                    height: 180,
                    colorDark: "#0f172a",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });
            }
        }

        // Render QR Labels & Badges
        setText("qrPetName", pet.petName);
        setText("qrPetBreed", `${pet.species} • ${pet.breed}`);

        const petLostBadge = document.getElementById("petLostStatusBadge");
        const toggleLostBtn = document.getElementById("toggleLostStatusBtn");

        if (pet.isLost) {
            if (petLostBadge) {
                petLostBadge.textContent = "🚨 Lost";
                petLostBadge.className = "pet-lost-badge lost";
            }
            if (toggleLostBtn) {
                toggleLostBtn.textContent = "🟢 Mark as Found";
                toggleLostBtn.className = "action-btn primary-btn";
            }
        } else {
            if (petLostBadge) {
                petLostBadge.textContent = "🟢 Safe";
                petLostBadge.className = "pet-lost-badge safe";
            }
            if (toggleLostBtn) {
                toggleLostBtn.textContent = "🔴 Mark as Lost";
                toggleLostBtn.className = "action-btn danger-btn";
            }
        }

        setupQrActionButtons(pet, publicUrl);
    } catch (err) {
        console.error("LOAD QR ERROR:", err);
    }
}

function setupQrActionButtons(pet, publicUrl) {
    const downloadBtn = document.getElementById("downloadQrBtn");
    const printBtn = document.getElementById("printQrBtn");
    const previewBtn = document.getElementById("previewQrBtn");
    const toggleLostBtn = document.getElementById("toggleLostStatusBtn");
    const regenerateBtn = document.getElementById("regenerateQrBtn");

    if (downloadBtn) {
        downloadBtn.onclick = () => {
            const qrCanvas = document.querySelector("#qrcodeCanvas canvas") || document.querySelector("#qrcodeCanvas img");
            if (!qrCanvas) return alert("QR Code canvas loading...");

            const imgUrl = qrCanvas.toDataURL ? qrCanvas.toDataURL("image/png") : qrCanvas.src;
            const a = document.createElement("a");
            a.href = imgUrl;
            a.download = `${pet.petName}_PawSync_QR.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
    }

    if (printBtn) {
        printBtn.onclick = () => {
            const qrCanvas = document.querySelector("#qrcodeCanvas canvas") || document.querySelector("#qrcodeCanvas img");
            if (!qrCanvas) return alert("QR Code loading...");

            const imgUrl = qrCanvas.toDataURL ? qrCanvas.toDataURL("image/png") : qrCanvas.src;
            const printWin = window.open("", "_blank");
            printWin.document.write(`
                <html>
                <head>
                    <title>Print Pet Tag - ${pet.petName}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; }
                        .tag { border: 3px dashed #0d9588; border-radius: 24px; padding: 30px; text-align: center; max-width: 320px; }
                        .tag h2 { color: #0d9588; margin: 0 0 16px 0; }
                        .tag h3 { margin: 12px 0 4px 0; font-size: 1.4rem; color: #0f172a; }
                        .tag p { margin: 0; font-size: 0.9rem; color: #64748b; }
                    </style>
                </head>
                <body>
                    <div class="tag">
                        <h2>🐾 PawSync</h2>
                        <img src="${imgUrl}" width="180" height="180"/>
                        <h3>${pet.petName}</h3>
                        <p>${pet.species} • ${pet.breed}</p>
                        <p style="margin-top:14px; font-weight:700; color:#0d9588;">Scan if this pet is found 📍</p>
                    </div>
                    <script>window.onload = function() { window.print(); window.close(); }</script>
                </body>
                </html>
            `);
            printWin.document.close();
        };
    }

    if (previewBtn) {
        previewBtn.onclick = () => {
            window.open(publicUrl, "_blank");
        };
    }

    if (toggleLostBtn) {
        toggleLostBtn.onclick = () => {
            if (pet.isLost) {
                updatePetLostStatus(pet._id, false);
            } else {
                openMarkLostModal();
            }
        };
    }

    if (regenerateBtn) {
        regenerateBtn.onclick = async () => {
            const confirmed = confirm(`Are you sure you want to regenerate the QR code for "${pet.petName}"?\nThe old QR code will no longer work if scanned.`);
            if (!confirmed) return;

            try {
                const res = await fetch(`${API_BASE}/pets/${pet._id}/qr/regenerate`, {
                    method: "PUT",
                    headers: getAuthHeaders()
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    alert("QR Code regenerated successfully!");
                    loadPetQrDetails(pet._id, pet);
                } else {
                    alert(data.message || "Failed to regenerate QR code.");
                }
            } catch (err) {
                alert("Network error. Unable to regenerate QR code.");
            }
        };
    }
}

/* MARK AS LOST MODAL HANDLERS */
function openMarkLostModal() {
    const modal = document.getElementById("markLostModal");
    if (modal) modal.style.display = "flex";

    const closeBtn = document.getElementById("closeLostModalBtn");
    const cancelBtn = document.getElementById("cancelLostBtn");
    const lostForm = document.getElementById("markLostForm");

    if (closeBtn) closeBtn.onclick = hideMarkLostModal;
    if (cancelBtn) cancelBtn.onclick = hideMarkLostModal;

    if (lostForm) {
        lostForm.onsubmit = async (e) => {
            e.preventDefault();
            const location = document.getElementById("lostLocation").value;
            const date = document.getElementById("lostDate").value;
            const note = document.getElementById("lostNote").value;

            await updatePetLostStatus(currentPet._id, true, { location, date, note });
            hideMarkLostModal();
        };
    }
}

function hideMarkLostModal() {
    const modal = document.getElementById("markLostModal");
    if (modal) modal.style.display = "none";
}

async function updatePetLostStatus(petId, isLost, details = {}) {
    try {
        const payload = {
            isLost,
            lastSeenLocation: details.location || "",
            lostDate: details.date || "",
            note: details.note || ""
        };

        const res = await fetch(`${API_BASE}/pets/${petId}/status`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok && data.success) {
            currentPet.isLost = isLost;
            currentPet.lostInfo = data.lostInfo;
            displayPet(currentPet);
            alert(data.message || `Status updated for ${currentPet.petName}`);
        } else {
            alert(data.message || "Failed to update pet status.");
        }
    } catch (err) {
        alert("Unable to update pet status.");
    }
}

function renderTagList(elementId, items, emptyMessage) {
    const container = document.getElementById(elementId);
    if (!container) return;

    container.innerHTML = "";

    let list = [];
    if (Array.isArray(items)) {
        list = items;
    } else if (typeof items === "string" && items.trim()) {
        list = items.split(",").map(s => s.trim());
    }

    if (list.length === 0) {
        container.textContent = emptyMessage;
        return;
    }

    list.forEach(val => {
        const tag = document.createElement("span");
        tag.className = "medical-tag";
        tag.textContent = val;
        container.appendChild(tag);
    });
}

/* =========================================
   EDIT PET MODAL & SUBMIT
========================================= */
function openEditModal(pet) {
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || "";
    };

    setVal("editPetName", pet.petName);
    setVal("editSpecies", pet.species || "Dog");
    setVal("editBreed", pet.breed);
    setVal("editGender", pet.gender || "Male");
    setVal("editOwnerPhone", pet.ownerPhone || "");
    setVal("editReproductiveStatus", pet.reproductiveStatus || "Intact");
    setVal("editDateOfBirth", formatDateForInput(pet.dateOfBirth));
    setVal("editWeight", pet.currentWeight?.value || "");
    setVal("editWeightUnit", pet.currentWeight?.unit || "kg");
    setVal("editMicrochip", pet.microchipId);
    setVal("editPetPhoto", pet.petPhoto);

    const modal = document.getElementById("editPetModal");
    if (modal) modal.style.display = "flex";
}

function hideEditModal() {
    const modal = document.getElementById("editPetModal");
    if (modal) modal.style.display = "none";
}

async function handleEditFormSubmit(e) {
    e.preventDefault();
    const selectedPetId = getSelectedPetId();
    if (!selectedPetId) return;

    const saveBtn = document.getElementById("saveEditModalBtn");
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";
    }

    try {
        const payload = {
            petName: document.getElementById("editPetName").value,
            species: document.getElementById("editSpecies").value,
            breed: document.getElementById("editBreed").value,
            gender: document.getElementById("editGender").value,
            ownerPhone: document.getElementById("editOwnerPhone").value,
            reproductiveStatus: document.getElementById("editReproductiveStatus").value,
            dateOfBirth: document.getElementById("editDateOfBirth").value,
            weight: document.getElementById("editWeight").value,
            weightUnit: document.getElementById("editWeightUnit").value,
            microchip: document.getElementById("editMicrochip").value,
            petPhoto: document.getElementById("editPetPhoto").value
        };

        const response = await fetch(`${API_BASE}/pets/${selectedPetId}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to update pet profile.");
        }

        hideEditModal();
        currentPet = data.pet;
        displayPet(currentPet);
        alert("Pet profile updated successfully!");
    } catch (error) {
        console.error("EDIT PET ERROR:", error);
        alert(error.message || "Failed to update pet profile.");
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = "Save Changes";
        }
    }
}

/* =========================================
   DELETE PET HANDLER
========================================= */
async function handleDeletePet() {
    const selectedPetId = getSelectedPetId();
    if (!selectedPetId || !currentPet) return;

    const confirmDelete = confirm(`Are you sure you want to delete "${currentPet.petName}"?\nThis action cannot be undone and will permanently remove all records associated with this pet.`);
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_BASE}/pets/${selectedPetId}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to delete pet.");
        }

        alert(`Pet profile for "${currentPet.petName}" has been deleted.`);
        localStorage.removeItem("pawsyncSelectedPet");
        window.location.href = "/frontend/pets/pets.html";
    } catch (error) {
        console.error("DELETE PET ERROR:", error);
        alert(error.message || "Unable to delete pet.");
    }
}