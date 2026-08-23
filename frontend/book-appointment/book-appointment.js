/* =========================================
   PAWSYNC - BOOK APPOINTMENT
   Connected to Live Pets & Appointments API
========================================= */

const PawSyncBookAppt = {
  token: localStorage.getItem("pawsyncToken"),
  selectedVet: null,
  ownerPets: [],

  async apiRequest(endpoint, options = {}) {
    const headers = {
      ...options.headers,
      "Content-Type": "application/json"
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    const res = await fetch(`/api${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed.");
    return data;
  },

  async init() {
    // Read selected vet from localStorage
    try {
      const stored = localStorage.getItem("selectedVet");
      if (stored) {
        this.selectedVet = JSON.parse(stored);
      }
    } catch (e) {}

    if (!this.selectedVet) {
      alert("No veterinarian selected. Returning to Find Vet.");
      window.location.href = "/frontend/appointments/appointments.html";
      return;
    }

    this.renderSelectedVet();
    await this.loadOwnerPets();
    this.attachEvents();
  },

  renderSelectedVet() {
    const vet = this.selectedVet;
    const photo = vet.profilePhoto || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80";

    const vetImage = document.getElementById("vetImage");
    const vetName = document.getElementById("vetName");
    const vetSpecialty = document.getElementById("vetSpecialty");
    const vetFee = document.getElementById("vetFee");

    const summaryVetImage = document.getElementById("summaryVetImage");
    const summaryVetName = document.getElementById("summaryVetName");
    const summaryVetSpecialty = document.getElementById("summaryVetSpecialty");
    const summaryFee = document.getElementById("summaryFee");

    if (vetImage) vetImage.src = photo;
    if (vetName) vetName.textContent = `Dr. ${vet.fullName || vet.name}`;
    if (vetSpecialty) vetSpecialty.textContent = vet.specialization || vet.specialty || "General Veterinary";
    if (vetFee) vetFee.textContent = `₹${vet.consultationFee || vet.fee || 500}`;

    if (summaryVetImage) summaryVetImage.src = photo;
    if (summaryVetName) summaryVetName.textContent = `Dr. ${vet.fullName || vet.name}`;
    if (summaryVetSpecialty) summaryVetSpecialty.textContent = vet.specialization || vet.specialty || "General Veterinary";
    if (summaryFee) summaryFee.textContent = `₹${vet.consultationFee || vet.fee || 500}`;
  },

  async loadOwnerPets() {
    const petContainer = document.querySelector(".pet-options");
    if (!petContainer) return;

    try {
      const res = await this.apiRequest("/pets");
      this.ownerPets = res.pets || [];

      if (this.ownerPets.length === 0) {
        petContainer.innerHTML = `
          <div style="padding:15px;background:#fef2f2;border-radius:12px;color:#dc2626;">
            No registered pets found. Please <a href="/frontend/addPetForm/addPetForm.html" style="color:#2563eb;font-weight:700;">Add a Pet</a> to book an appointment.
          </div>
        `;
        return;
      }

      petContainer.innerHTML = this.ownerPets.map((p, idx) => {
        const icon = p.species === "Cat" ? "🐈" : (p.species === "Bird" ? "🦜" : "🐕");
        return `
          <label class="pet-option">
            <input type="radio" name="pet" value="${p._id}" data-petname="${p.petName}" ${idx === 0 ? "checked" : ""}>
            <div class="pet-option-content">
              <div class="pet-mini-avatar">${icon}</div>
              <div>
                <strong>${p.petName}</strong>
                <span>${p.species} • ${p.breed}</span>
              </div>
            </div>
            <span class="radio-check">✓</span>
          </label>
        `;
      }).join("");

      this.updateSummary();
    } catch (e) {
      console.error("Load pets error:", e);
    }
  },

  updateSummary() {
    const selectedPet = document.querySelector('input[name="pet"]:checked');
    const selectedDate = document.querySelector('input[name="date"]:checked') || document.getElementById("customApptDate");
    const selectedTime = document.querySelector('input[name="time"]:checked');
    const selectedReason = document.querySelector('input[name="reason"]:checked');

    if (selectedPet && document.getElementById("summaryPet")) {
      document.getElementById("summaryPet").textContent = selectedPet.dataset.petname || selectedPet.value;
    }
    if (selectedDate && document.getElementById("summaryDate")) {
      document.getElementById("summaryDate").textContent = selectedDate.value;
    }
    if (selectedTime && document.getElementById("summaryTime")) {
      document.getElementById("summaryTime").textContent = selectedTime.value;
    }
    if (selectedReason && document.getElementById("summaryReason")) {
      document.getElementById("summaryReason").textContent = selectedReason.value;
    }
  },

  attachEvents() {
    const form = document.getElementById("appointmentForm");
    const backBtn = document.getElementById("backButton");
    const notifBtn = document.getElementById("notificationButton");

    document.querySelectorAll('input[type="radio"]').forEach(r => {
      r.addEventListener("change", () => this.updateSummary());
    });

    if (backBtn) {
      backBtn.addEventListener("click", () => {
        window.location.href = "/frontend/appointments/appointments.html";
      });
    }

    if (notifBtn) {
      notifBtn.addEventListener("click", () => {
        window.location.href = "/frontend/alerts/alerts.html";
      });
    }

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        await this.submitBooking();
      });
    }
  },

  async submitBooking() {
    const selectedPetRadio = document.querySelector('input[name="pet"]:checked');
    const selectedDateRadio = document.querySelector('input[name="date"]:checked');
    const selectedTimeRadio = document.querySelector('input[name="time"]:checked');
    const selectedReasonRadio = document.querySelector('input[name="reason"]:checked');
    const notesInput = document.getElementById("notes");

    if (!selectedPetRadio) {
      alert("Please select a pet for this appointment.");
      return;
    }

    const petId = selectedPetRadio.value;
    const petName = selectedPetRadio.dataset.petname || "Pet";
    const dateStr = selectedDateRadio ? selectedDateRadio.value : new Date().toISOString().split("T")[0];
    const timeStr = selectedTimeRadio ? selectedTimeRadio.value : "10:00 AM";
    const reasonStr = selectedReasonRadio ? selectedReasonRadio.value : "General Checkup";
    const notesStr = notesInput ? notesInput.value : "";

    try {
      const res = await this.apiRequest("/appointments", {
        method: "POST",
        body: JSON.stringify({
          vetId: this.selectedVet._id || this.selectedVet.id,
          petId,
          appointmentType: reasonStr,
          date: dateStr,
          time: timeStr,
          reason: reasonStr,
          notes: notesStr
        })
      });

      // Show Success modal
      const successVet = document.getElementById("successVet");
      const successDetails = document.getElementById("successDetails");
      const successModal = document.getElementById("successModal");
      const successBtn = document.getElementById("successButton");

      if (successVet) successVet.textContent = `Dr. ${this.selectedVet.fullName || this.selectedVet.name}`;
      if (successDetails) successDetails.textContent = `${petName} • ${dateStr} • ${timeStr}`;

      if (successBtn) {
        successBtn.onclick = () => {
          window.location.href = "/frontend/owner/dashboard/ownerdashboard.html";
        };
      }

      if (successModal) {
        successModal.style.display = "flex";
        document.body.style.overflow = "hidden";
      } else {
        alert(`Appointment Request Sent Successfully!\n\nStatus: Pending Vet Confirmation\nDoctor: Dr. ${this.selectedVet.fullName || this.selectedVet.name}\nPet: ${petName}\nDate: ${dateStr} at ${timeStr}`);
        window.location.href = "/frontend/owner/dashboard/ownerdashboard.html";
      }
    } catch (err) {
      alert("Failed to book appointment: " + err.message);
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  PawSyncBookAppt.init();
});