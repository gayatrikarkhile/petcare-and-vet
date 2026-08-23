/* =========================================
   PAWSYNC - VET APPOINTMENTS (OWNER VIEW)
   Connected to Live Verified Vets & Appointments API
========================================= */

const PawSyncOwnerAppts = {
  token: localStorage.getItem("pawsyncToken"),
  vets: [],

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
    this.attachEventListeners();
    await this.loadVerifiedVets();
    await this.loadMyBookedAppointments();
  },

  async loadVerifiedVets() {
    const vetGrid = document.getElementById("vetGrid");
    const emptyState = document.getElementById("emptyState");
    const vetCount = document.getElementById("vetCount");

    if (!vetGrid) return;

    // Loading UI State
    vetGrid.innerHTML = `
      <div class="vet-loading-state" style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #64748b;">
        <div style="font-size: 36px; margin-bottom: 8px;">⏳</div>
        <strong style="color: #0f172a; font-size: 16px;">Finding verified veterinarians...</strong>
        <p style="margin: 4px 0 0; font-size: 13.5px;">Searching PawSync verified network</p>
      </div>
    `;
    if (emptyState) emptyState.style.display = "none";

    try {
      let res;
      try {
        res = await this.apiRequest("/vets/verified");
      } catch (err) {
        res = await this.apiRequest("/vet/verified-vets");
      }

      this.vets = res.vets || [];
      this.renderVets(this.vets);
    } catch (e) {
      console.error("Error loading verified vets:", e);
      // API / Server Error State
      vetGrid.innerHTML = `
        <div class="vet-error-state" style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #dc2626; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 16px;">
          <div style="font-size: 36px; margin-bottom: 8px;">⚠️</div>
          <strong style="font-size: 16px;">Unable to load veterinarians</strong>
          <p style="margin: 4px 0 0; font-size: 13.5px;">Please try again.</p>
        </div>
      `;
      if (vetCount) vetCount.textContent = "0 Veterinarians Available";
    }
  },

  async loadMyBookedAppointments() {
    const grid = document.getElementById("bookedAppointmentsGrid");
    if (!grid) return;

    try {
      const res = await this.apiRequest("/appointments/owner");
      const appts = res.appointments || [];

      if (appts.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; background: #ffffff; padding: 24px; border-radius: 16px; border: 1px dashed #cbd5e1; text-align: center; color: #64748b;">
            <span style="font-size: 28px; display: block; margin-bottom: 6px;">📅</span>
            <strong style="color: #0f172a; font-size: 15px;">No appointments booked yet</strong>
            <p style="margin: 4px 0 0; font-size: 13px;">Choose a veterinarian above and click "Book Appointment" to schedule your first visit.</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = "";
      appts.forEach(appt => {
        const card = document.createElement("div");
        card.style.cssText = "background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:18px; display:flex; flex-direction:column; gap:10px; box-shadow:0 4px 12px rgba(0,0,0,0.03);";
        
        const doctorName = appt.vetId ? `Dr. ${appt.vetId.fullName || appt.vetId.name}` : "Veterinarian";
        const clinic = appt.vetId ? (appt.vetId.clinicName || "Clinic") : "Clinic";
        const petName = appt.petId ? appt.petId.petName : "Pet";
        const photo = appt.vetId && appt.vetId.profilePhoto ? appt.vetId.profilePhoto : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80";

        let statusBg = "#fef3c7";
        let statusColor = "#d97706";
        let statusText = "⏳ Pending Confirmation";
        if (appt.status === "accepted") {
          statusBg = "#d1fae5";
          statusColor = "#059669";
          statusText = "🟢 Confirmed";
        } else if (appt.status === "completed") {
          statusBg = "#e0e7ff";
          statusColor = "#4338ca";
          statusText = "✓ Completed";
        } else if (appt.status === "rejected" || appt.status === "cancelled") {
          statusBg = "#fee2e2";
          statusColor = "#dc2626";
          statusText = appt.status === "rejected" ? "🔴 Declined" : "❌ Cancelled";
        }

        card.innerHTML = `
          <div style="display:flex; justify-space-between; align-items:center;">
            <span style="background:${statusBg}; color:${statusColor}; padding:4px 10px; border-radius:99px; font-size:12px; font-weight:700;">${statusText}</span>
            <span style="font-size:12px; color:#64748b; font-weight:600;">ID: ${appt._id.slice(-6).toUpperCase()}</span>
          </div>
          <div style="display:flex; gap:12px; align-items:center;">
            <img src="${photo}" style="width:48px; height:48px; border-radius:50%; object-fit:cover; border:2px solid #0d9488;">
            <div>
              <h4 style="margin:0; font-size:15px; font-weight:700; color:#0f172a;">${doctorName}</h4>
              <p style="margin:2px 0 0; font-size:12px; color:#64748b;">${clinic}</p>
            </div>
          </div>
          <div style="background:#f8fafc; padding:10px 12px; border-radius:10px; font-size:13px; color:#334155; display:flex; flex-direction:column; gap:4px;">
            <div>📅 <strong>Date & Time:</strong> ${appt.date} at ${appt.time}</div>
            <div>🐾 <strong>Pet:</strong> ${petName}</div>
            <div>🩺 <strong>Reason:</strong> ${appt.appointmentType || appt.reason || 'General Checkup'}</div>
          </div>
        `;
        grid.appendChild(card);
      });
    } catch (e) {
      console.error("Error loading booked appointments:", e);
    }
  },

  renderVets(list) {
    const vetGrid = document.getElementById("vetGrid");
    const emptyState = document.getElementById("emptyState");
    const vetCount = document.getElementById("vetCount");

    if (!vetGrid) return;

    vetGrid.innerHTML = "";

    // Empty State (No Approved Vets)
    if (list.length === 0) {
      if (emptyState) {
        emptyState.style.display = "block";
        emptyState.innerHTML = `
          <div style="font-size: 40px; margin-bottom: 8px;">🩺</div>
          <h3 style="color: #0f172a; margin: 0 0 6px;">No verified veterinarians are available at the moment</h3>
          <p style="color: #64748b; margin: 0;">Please check again later.</p>
        `;
      }
      if (vetCount) vetCount.textContent = "0 Verified Veterinarians Available";
      return;
    }

    if (emptyState) emptyState.style.display = "none";
    if (vetCount) vetCount.textContent = `${list.length} Verified Veterinarian${list.length > 1 ? "s" : ""}`;

    list.forEach(vet => {
      const card = document.createElement("article");
      card.className = "vet-card-modern";
      card.setAttribute("data-vet-id", vet._id);

      const photo = vet.profilePhoto ? vet.profilePhoto : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80";
      const hoursStr = vet.availableHours ? `${vet.availableHours.start} - ${vet.availableHours.end}` : "10:00 AM - 6:00 PM";
      const rawStatus = (vet.verificationStatus || (vet.isVerified ? "APPROVED" : "PENDING")).toUpperCase();

      let badgeHtml = "";
      if (rawStatus === "APPROVED" || vet.isVerified) {
        badgeHtml = `
          <div style="background:#e6f4ea; color:#166534; padding:5px 12px; border-radius:99px; font-size:12.5px; font-weight:700; display:inline-flex; align-items:center; gap:6px;">
            <span style="display:inline-flex; align-items:center; justify-content:center; background:#166534; color:#ffffff; width:16px; height:16px; border-radius:50%; font-size:10px; font-weight:bold;">✓</span>
            PawSync Verified
          </div>
        `;
      } else {
        badgeHtml = `<div></div>`;
      }

      card.innerHTML = `
        <!-- TOP HEADER: BADGE & FAVORITE HEART -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          ${badgeHtml}
          <button type="button" class="fav-btn" style="background:transparent; border:none; color:#64748b; font-size:22px; cursor:pointer; padding:0; line-height:1;" title="Save to Favorites">
            ♡
          </button>
        </div>

        <!-- DOCTOR PROFILE AVATAR -->
        <div style="display:flex; justify-content:center; margin-bottom:16px;">
          <img src="${photo}" alt="Dr. ${vet.fullName}" style="width:130px; height:130px; border-radius:50%; object-fit:cover; box-shadow:0 8px 20px rgba(0,0,0,0.08); border:3px solid #ffffff;">
        </div>

        <!-- DOCTOR NAME & SPECIALIZATION -->
        <div style="text-align:center; margin-bottom:14px;">
          <h3 style="margin:0; font-size:20px; font-weight:800; color:#1e293b; letter-spacing:-0.02em;">Dr. ${vet.fullName}</h3>
          <p style="margin:4px 0 8px; font-size:14.5px; font-weight:600; color:#1e7e5a;">${vet.specialization || "Veterinary Surgery"}</p>
          <!-- Star rating removed as requested, showing only Experience -->
          <p style="margin:0; font-size:13.5px; font-weight:600; color:#64748b;">${vet.experienceYears || 3} Years Exp.</p>
        </div>

        <!-- DASHED DIVIDER -->
        <div style="border-top:1px dashed #e2e8f0; margin:10px 0 14px;"></div>

        <!-- LOCATION -->
        <div style="display:flex; gap:10px; align-items:flex-start; margin-bottom:16px; text-align:left; padding:0 4px;">
          <span style="font-size:16px; color:#64748b; margin-top:2px;">📍</span>
          <div>
            <strong style="display:block; font-size:13.5px; font-weight:600; color:#334155;">${vet.clinicName || "Clinic"}</strong>
            <span style="font-size:13px; color:#64748b;">${vet.clinicAddress || vet.city || "Ahmednagar"}</span>
          </div>
        </div>

        <!-- AVAILABILITY BOX -->
        <div style="background:#f0fdf4; border:1px solid #dcfce7; border-radius:14px; padding:12px 14px; margin-bottom:18px;">
          <div style="display:flex; align-items:center; gap:6px; color:#166534; font-weight:700; font-size:13.5px;">
            <span style="font-size:15px;">🕒</span> Available Today
          </div>
          <div style="margin-top:3px; font-size:12.5px; font-weight:600; color:#334155; padding-left:21px;">
            ${hoursStr}
          </div>
        </div>

        <!-- ACTION BUTTONS -->
        <div style="display:flex; gap:10px; margin-top:auto;">
          <button class="profile-btn" style="flex:1; background:#ffffff; border:1px solid #cbd5e1; color:#1e293b; padding:11px 8px; border-radius:12px; font-weight:700; font-size:13.5px; cursor:pointer; transition:all 0.2s;" onclick="PawSyncOwnerAppts.viewVetProfile('${vet._id}')">
            View Profile
          </button>
          <button class="book-btn" style="flex:1; background:#1e7e5a; color:#ffffff; border:none; padding:11px 8px; border-radius:12px; font-weight:700; font-size:13.5px; cursor:pointer; transition:all 0.2s; box-shadow:0 4px 12px rgba(30,126,90,0.25);" onclick="PawSyncOwnerAppts.bookVet('${vet._id}')">
            Book Now
          </button>
        </div>
      `;

      vetGrid.appendChild(card);
    });
  },

  viewVetProfile(vetId) {
    const vet = this.vets.find(v => v._id === vetId);
    if (!vet) return;

    const modal = document.getElementById("vetProfileModal");
    const content = document.getElementById("vetProfileModalContent");
    if (!modal || !content) return;

    const photo = vet.profilePhoto || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80";
    const availableDaysStr = (vet.availableDays && vet.availableDays.length > 0) ? vet.availableDays.join(", ") : "Mon - Sat";
    const hoursStr = vet.availableHours ? `${vet.availableHours.start} - ${vet.availableHours.end}` : "10:00 AM - 6:00 PM";

    content.innerHTML = `
      <div style="display:flex; gap:16px; align-items:center; margin-bottom:20px;">
        <img src="${photo}" style="width:72px; height:72px; border-radius:50%; object-fit:cover; border:3px solid #0d9488;">
        <div>
          <span style="background:#d1fae5; color:#059669; padding:4px 10px; border-radius:99px; font-size:12px; font-weight:800; display:inline-block; margin-bottom:4px;">🟢 PawSync Verified</span>
          <h2 style="margin:0; font-size:20px; color:#0f172a;">Dr. ${vet.fullName}</h2>
          <p style="margin:2px 0 0; font-size:14px; font-weight:700; color:#159b8f;">${vet.specialization || "General Veterinary"}</p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; background:#f8fafc; padding:16px; border-radius:14px; margin-bottom:20px; font-size:13.5px; color:#334155;">
        <div>🎓 <strong>Qualification:</strong><br>${vet.qualification || "B.V.Sc"}</div>
        <div>📜 <strong>Registration No:</strong><br>${vet.licenseNumber || "N/A"}</div>
        <div>⭐ <strong>Experience:</strong><br>${vet.experienceYears || 5} Years</div>
        <div>💰 <strong>Consultation Fee:</strong><br>₹${vet.consultationFee || 500}</div>
        <div style="grid-column: 1 / -1;">🏥 <strong>Clinic/Hospital:</strong><br>${vet.clinicName || "Clinic"}</div>
        <div style="grid-column: 1 / -1;">📍 <strong>Address / Location:</strong><br>${vet.clinicAddress || vet.city || "Pune, Maharashtra"}</div>
        <div style="grid-column: 1 / -1;">📅 <strong>Availability:</strong><br>${availableDaysStr} (${hoursStr})</div>
      </div>

      <button type="button" style="width:100%; background:#159b8f; color:#ffffff; border:none; padding:12px; border-radius:12px; font-weight:800; font-size:15px; cursor:pointer;" onclick="PawSyncOwnerAppts.bookVet('${vet._id}')">
        Book Appointment with Dr. ${vet.fullName}
      </button>
    `;

    modal.style.display = "flex";
  },

  bookVet(vetId) {
    const vet = this.vets.find(v => v._id === vetId);
    if (!vet) return;
    localStorage.setItem("selectedVet", JSON.stringify(vet));
    window.location.href = "/frontend/book-appointment/book-appointment.html";
  },

  attachEventListeners() {
    const searchVet = document.getElementById("searchVet");
    const specialtyFilter = document.getElementById("specialtyFilter");
    const myAppointmentsButton = document.getElementById("myAppointmentsButton");
    const closeVetProfileModal = document.getElementById("closeVetProfileModal");
    const vetProfileModal = document.getElementById("vetProfileModal");

    const filterFn = () => {
      const q = searchVet ? searchVet.value.toLowerCase().trim() : "";
      const spec = specialtyFilter ? specialtyFilter.value : "all";

      const filtered = this.vets.filter(v => {
        const matchesSearch = v.fullName.toLowerCase().includes(q) || v.specialization.toLowerCase().includes(q) || (v.clinicName && v.clinicName.toLowerCase().includes(q));
        const matchesSpec = spec === "all" || v.specialization === spec;
        return matchesSearch && matchesSpec;
      });

      this.renderVets(filtered);
    };

    if (searchVet) searchVet.addEventListener("input", filterFn);
    if (specialtyFilter) specialtyFilter.addEventListener("change", filterFn);

    if (myAppointmentsButton) {
      myAppointmentsButton.addEventListener("click", () => {
        const section = document.querySelector(".my-booked-appointments-section");
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
      });
    }

    if (closeVetProfileModal && vetProfileModal) {
      closeVetProfileModal.addEventListener("click", () => {
        vetProfileModal.style.display = "none";
      });
      vetProfileModal.addEventListener("click", (e) => {
        if (e.target === vetProfileModal) {
          vetProfileModal.style.display = "none";
        }
      });
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  PawSyncOwnerAppts.init();
});