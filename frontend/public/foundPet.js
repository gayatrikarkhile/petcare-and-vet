/* =========================================
   PAWSYNC PUBLIC PET SCANNER ENGINE
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    initFoundPetPage();
});

async function initFoundPetPage() {
    const urlParams = new URLSearchParams(window.location.search);
    let token = urlParams.get("token");

    if (!token) {
        const pathParts = window.location.pathname.split("/");
        token = pathParts[pathParts.length - 1];
    }

    if (!token || token === "foundPet.html") {
        showError("No QR Code token provided.");
        return;
    }

    try {
        const res = await fetch(`/api/pets/public/pet/${token}`);
        const data = await res.json();

        if (!res.ok || !data.success || !data.publicPet) {
            showError(data.message || "Pet record not found.");
            return;
        }

        renderPublicPet(data.publicPet, token);
    } catch (err) {
        console.error("Public scanner fetch error:", err);
        showError("Network error. Unable to load pet profile.");
    }
}

function showError(msg) {
    document.getElementById("loadingState").style.display = "none";
    const errBox = document.getElementById("errorState");
    errBox.querySelector("p").textContent = msg;
    errBox.style.display = "block";
}

function renderPublicPet(pet, token) {
    document.getElementById("loadingState").style.display = "none";
    document.getElementById("publicPetCard").style.display = "block";

    // Lost vs Safe banner
    if (pet.isLost) {
        document.getElementById("lostBanner").style.display = "block";
        document.getElementById("safeBanner").style.display = "none";
        if (pet.lostInfo && (pet.lostInfo.lastSeenLocation || pet.lostInfo.note)) {
            const card = document.getElementById("lastSeenCard");
            card.style.display = "block";
            document.getElementById("lastSeenLocation").textContent = `📍 Location: ${pet.lostInfo.lastSeenLocation || "Not specified"}`;
            document.getElementById("lastSeenDate").textContent = `📅 Date: ${pet.lostInfo.lostDate || "Recently"}`;
            document.getElementById("lastSeenNote").textContent = pet.lostInfo.note ? `"${pet.lostInfo.note}"` : "";
        }
    } else {
        document.getElementById("safeBanner").style.display = "block";
        document.getElementById("lostBanner").style.display = "none";
    }

    // Photo & Badges
    const photoImg = document.getElementById("publicPetPhoto");
    if (pet.photo) {
        photoImg.src = pet.photo;
    } else {
        photoImg.src = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80";
    }

    document.getElementById("publicSpeciesBadge").textContent = pet.species;
    document.getElementById("publicPetName").textContent = pet.name;
    document.getElementById("publicPetBreed").textContent = `${pet.species} • ${pet.breed}`;
    document.getElementById("publicGender").textContent = pet.gender;
    document.getElementById("publicAge").textContent = pet.age;
    document.getElementById("publicWeight").textContent = pet.weight || "--";

    // Contact Buttons
    const cleanPhone = (pet.ownerPhone || "").replace(/[^0-9+]/g, "");
    const callBtn = document.getElementById("btnCallOwner");
    const waBtn = document.getElementById("btnWhatsappOwner");

    if (cleanPhone) {
        callBtn.href = `tel:${cleanPhone}`;
        waBtn.href = `https://wa.me/${cleanPhone}?text=Hi! I found your pet ${encodeURIComponent(pet.name)} registered on PawSync.`;
    } else {
        callBtn.style.display = "none";
        waBtn.style.display = "none";
    }

    // Report Found Modal
    const reportBtn = document.getElementById("btnReportFound");
    const modal = document.getElementById("reportFoundModal");
    const closeBtn = document.getElementById("closeReportModal");
    const reportForm = document.getElementById("reportFoundForm");

    if (reportBtn && modal) {
        reportBtn.onclick = () => { modal.style.display = "flex"; };
        closeBtn.onclick = () => { modal.style.display = "none"; };

        reportForm.onsubmit = async (e) => {
            e.preventDefault();
            const location = document.getElementById("foundLocationInput").value;
            const finderPhone = document.getElementById("finderPhoneInput").value;
            const message = document.getElementById("finderMessageInput").value;

            try {
                const res = await fetch(`/api/pets/public/pet/${token}/report-found`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ location, finderPhone, message })
                });
                const data = await res.json();
                alert(data.message || "Report sent successfully!");
                modal.style.display = "none";
            } catch (err) {
                alert("Failed to submit report. Please call or WhatsApp the owner directly.");
            }
        };
    }
}
