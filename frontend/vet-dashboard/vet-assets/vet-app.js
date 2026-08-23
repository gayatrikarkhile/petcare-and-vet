/**
 * PawSync Vet Dashboard Core JS
 * Handles Authentication, Dynamic API Data Loading, Render Shell, Page Controllers & Modals
 */

const PawSyncVet = {
  token: localStorage.getItem("pawsyncToken"),
  profile: null,
  user: null,

  async apiRequest(endpoint, options = {}) {
    const headers = {
      ...options.headers
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "API request failed.");
    }
    return data;
  },

  async init() {
    if (!this.token) {
      window.location.href = "/frontend/auth/login/login.html";
      return;
    }

    try {
      const profileRes = await this.apiRequest("/vet/profile/me");
      this.profile = profileRes.profile || null;
      this.user = profileRes.user || (this.profile ? this.profile.userId : null);

      if (this.user && this.user.role && this.user.role !== "vet") {
        alert("Access Denied. Vet Dashboard is reserved for Veterinary Professionals.");
        window.location.href = "/frontend/owner/dashboard/ownerdashboard.html";
        return;
      }
    } catch (e) {
      console.warn("Could not verify vet user session:", e);
    }

    const page = document.body.dataset.vetpage || "dashboard";
    const pageTitles = {
      dashboard: "Dashboard",
      appointments: "Appointments",
      patients: "My Patients",
      records: "Medical Records",
      vaccinations: "Vaccinations",
      prescriptions: "Prescriptions",
      profile: "My Profile",
      notifications: "Notifications",
      settings: "Settings"
    };

    this.renderShell(pageTitles[page] || "Dashboard");
    this.loadNotificationBadge();

    switch (page) {
      case "dashboard":
        this.loadDashboard();
        break;
      case "appointments":
        this.loadAppointmentsPage();
        break;
      case "patients":
        this.loadPatientsPage();
        break;
      case "records":
        this.loadRecordsPage();
        break;
      case "vaccinations":
        this.loadVaccinationsPage();
        break;
      case "prescriptions":
        this.loadPrescriptionsPage();
        break;
      case "profile":
        this.loadProfilePage();
        break;
      case "notifications":
        this.loadNotificationsPage();
        break;
    }
  },

  async loadNotificationBadge() {
    try {
      const res = await this.apiRequest("/notifications");
      const badgeEl = document.getElementById("vet-notif-badge");
      if (badgeEl) {
        if (res.unreadCount > 0) {
          badgeEl.textContent = res.unreadCount;
          badgeEl.style.display = "inline-block";
        } else {
          badgeEl.style.display = "none";
        }
      }
    } catch (e) {}
  },

  renderShell(activePage) {
    const mainNav = [
      ["vetdashboard.html", "🏠", "Dashboard"],
      ["vet-appointments.html", "📅", "Appointments"],
      ["vet-patients.html", "👥", "My Patients"],
      ["vet-records.html", "🩺", "Medical Records"]
    ];

    const accountNav = [
      ["vet-profile.html", "👤", "My Profile"]
    ];

    let rawName = "";
    if (this.profile && this.profile.fullName) {
      rawName = this.profile.fullName.trim();
    } else if (this.user && this.user.name) {
      rawName = this.user.name.trim();
    }
    rawName = rawName.replace(/^Dr\.\s*/i, "");
    const firstName = rawName ? rawName.split(/\s+/)[0] : "Doctor";
    const displayVetName = `Dr. ${firstName}`;
    const avatarPhoto = this.profile && this.profile.profilePhoto ? this.profile.profilePhoto : (this.user && this.user.profilePhoto ? this.user.profilePhoto : "");
    const initials = firstName.charAt(0).toUpperCase() || "D";

    // Sidebar (Strict PawSync Vet Structure)
    const sidebarEl = document.getElementById("vet-sidebar");
    if (sidebarEl) {
      sidebarEl.innerHTML = `
        <a href="vetdashboard.html" class="vet-brand" style="margin-bottom: 24px;">
          <div class="vet-brand-icon">🩺</div>
          <span>PawSync Vet</span>
        </a>
        <div class="vet-section-label">MAIN</div>
        ${mainNav.map(n => `
          <a class="vet-nav-item ${activePage === n[2] ? "active" : ""}" href="${n[0]}">
            <span class="vet-nav-icon" style="font-size:18px;">${n[1]}</span>
            <span>${n[2]}</span>
          </a>
        `).join("")}
        <div class="vet-section-label">ACCOUNT</div>
        ${accountNav.map(n => `
          <a class="vet-nav-item ${activePage === n[2] ? "active" : ""}" href="${n[0]}">
            <span class="vet-nav-icon" style="font-size:18px;">${n[1]}</span>
            <span>${n[2]}</span>
          </a>
        `).join("")}
        <a class="vet-nav-item" href="javascript:void(0)" onclick="PawSyncVet.logout()" style="color:#ef4444; margin-top:8px;">
          <span class="vet-nav-icon" style="font-size:18px;">🚪</span>
          <span>Logout</span>
        </a>
      `;
    }

    // Topbar
    const topbarEl = document.getElementById("vet-topbar");
    if (topbarEl) {
      const rawStatus = (this.profile && (this.profile.verificationStatus || (this.profile.isVerified ? "APPROVED" : "PENDING")) || "PENDING").toUpperCase();

      let statusBadge = `<span class="vet-status pending" onclick="location.href='vet-profile.html'" style="cursor:pointer;">🟡 Verification Pending</span>`;
      if (rawStatus === "APPROVED" || rawStatus === "VERIFIED" || (this.profile && this.profile.isVerified)) {
        statusBadge = `<span class="vet-status verified">🟢 PawSync Verified</span>`;
      } else if (rawStatus === "REJECTED") {
        statusBadge = `<span class="vet-status rejected" onclick="location.href='vet-profile.html'" style="cursor:pointer;">🔴 Verification Rejected</span>`;
      }

      topbarEl.innerHTML = `
        <a href="vetdashboard.html" class="vet-brand">
          <div class="vet-brand-icon">🩺</div>
          <span>PawSync Vet Dashboard</span>
        </a>
        <div class="vet-top-actions">
          <div class="vet-search">
            <span>🔍</span>
            <input type="search" placeholder="Search records, patients..." oninput="PawSyncVet.handleGlobalSearch(this.value)">
          </div>
          ${statusBadge}
          <button class="vet-notification-btn" onclick="location.href='vet-notifications.html'" aria-label="Notifications" style="display:none;">
            <span>🔔</span>
            <span class="vet-badge-count" id="vet-notif-badge" style="display:none">0</span>
          </button>
          
          <div class="vet-profile-dropdown-wrap">
            <button type="button" class="vet-doctor-btn" id="vetProfileBtn" onclick="PawSyncVet.toggleProfileDropdown(event)">
              ${avatarPhoto ? `<img src="${avatarPhoto}" class="vet-avatar" alt="Vet">` : `<div class="vet-avatar">${initials}</div>`}
              <span>${displayVetName}</span>
              <span class="vet-chevron" style="font-size:11px; margin-left:4px; transition:transform 0.2s;">▼</span>
            </button>
            <div class="vet-profile-menu" id="vetProfileMenu" style="display: none;">
              <button type="button" class="vet-menu-item" onclick="location.href='vet-profile.html'">
                <span>👤</span> My Profile
              </button>
              <div class="vet-menu-divider"></div>
              <button type="button" class="vet-menu-item logout" onclick="PawSyncVet.logout()">
                <span>🚪</span> Logout
              </button>
            </div>
          </div>
        </div>
      `;

      this.setupGlobalDropdownListeners();
    }
  },

  toggleProfileDropdown(e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById("vetProfileMenu");
    const btn = document.getElementById("vetProfileBtn");
    if (!menu) return;
    const isHidden = menu.style.display === "none" || !menu.style.display;
    menu.style.display = isHidden ? "flex" : "none";
    if (btn) {
      const chevron = btn.querySelector(".vet-chevron");
      if (chevron) chevron.style.transform = isHidden ? "rotate(180deg)" : "rotate(0deg)";
    }
  },

  setupGlobalDropdownListeners() {
    if (this._dropdownListenerAttached) return;
    this._dropdownListenerAttached = true;
    document.addEventListener("click", (e) => {
      const wrap = document.querySelector(".vet-profile-dropdown-wrap");
      if (wrap && !wrap.contains(e.target)) {
        const menu = document.getElementById("vetProfileMenu");
        if (menu) menu.style.display = "none";
        const btn = document.getElementById("vetProfileBtn");
        if (btn) {
          const chevron = btn.querySelector(".vet-chevron");
          if (chevron) chevron.style.transform = "rotate(0deg)";
        }
      }
    });
  },

  logout() {
    localStorage.removeItem("pawsyncToken");
    window.location.href = "/frontend/auth/login/login.html";
  },

  /* =========================================================
     DASHBOARD CONTROLLER
  ========================================================= */
  async loadDashboard() {
    const statsContainer = document.getElementById("vet-stats-grid");
    const requestsContainer = document.getElementById("vet-requests-list");
    const patientsContainer = document.getElementById("vet-recent-patients");
    const promptContainer = document.getElementById("vet-profile-prompt-container");

    // Dynamic Verification Status Banner
    if (promptContainer) {
      const rawStatus = (this.profile && (this.profile.verificationStatus || (this.profile.isVerified ? "APPROVED" : "PENDING")) || "PENDING").toUpperCase();

      if (rawStatus === "APPROVED" || rawStatus === "VERIFIED" || (this.profile && this.profile.isVerified)) {
        promptContainer.innerHTML = `
          <div style="background:#d1fae5; color:#059669; border:1px solid #a7f3d0; padding:18px 24px; border-radius:16px; margin-bottom:24px; display:flex; align-items:center; gap:16px;">
            <span style="font-size:32px;">🟢</span>
            <div>
              <h3 style="margin:0 0 2px; font-size:17px; font-weight:800;">PawSync Verified Veterinarian</h3>
              <p style="margin:0; font-size:13.5px; opacity:0.9;">Your practice has been reviewed and approved by Platform Admin. You are PawSync Verified and active for pet owner appointment bookings.</p>
            </div>
          </div>
        `;
      } else if (rawStatus === "REJECTED") {
        promptContainer.innerHTML = `
          <div style="background:#fee2e2; color:#dc2626; border:1px solid #fca5a5; padding:20px 24px; border-radius:16px; margin-bottom:24px;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
              <span style="font-size:28px;">🔴</span>
              <h3 style="margin:0; font-size:18px; font-weight:800;">Verification Rejected</h3>
            </div>
            <div style="background:#ffffff; padding:12px 16px; border-radius:10px; border:1px solid #fca5a5; font-size:14px; margin-bottom:10px;">
              <strong>Reason:</strong> ${this.profile ? (this.profile.rejectionReason || "Professional registration document could not be verified.") : "Professional registration document could not be verified."}
            </div>
            <p style="margin:0 0 12px; font-size:13.5px;">Please update your professional information or registration certificates, then resubmit for platform verification.</p>
            <button class="vet-banner-btn" onclick="location.href='vet-profile.html'" style="background:#dc2626; color:#fff; border:0; padding:8px 18px; border-radius:8px; font-weight:700; cursor:pointer;">Update Profile & Resubmit →</button>
          </div>
        `;
      } else {
        promptContainer.innerHTML = `
          <div style="background:#fef3c7; color:#d97706; border:1px solid #fde68a; padding:18px 24px; border-radius:16px; margin-bottom:24px; display:flex; align-items:center; justify-content:space-between; gap:16px;">
            <div style="display:flex; align-items:center; gap:14px;">
              <span style="font-size:32px;">🟡</span>
              <div>
                <h3 style="margin:0 0 2px; font-size:17px; font-weight:800;">Verification Pending Review</h3>
                <p style="margin:0; font-size:13.5px; opacity:0.9;">Your registration details have been submitted and are under review by Platform Admin.</p>
              </div>
            </div>
            <button onclick="location.href='vet-profile.html'" style="background:#d97706; color:#fff; border:0; padding:8px 16px; border-radius:8px; font-weight:700; white-space:nowrap; cursor:pointer;">View Status →</button>
          </div>
        `;
      }
    }

    // Greeting
    let rawName = "";
    if (this.profile && this.profile.fullName) {
      rawName = this.profile.fullName.trim();
    } else if (this.user && this.user.name) {
      rawName = this.user.name.trim();
    }
    rawName = rawName.replace(/^Dr\.\s*/i, "");
    const firstName = rawName ? rawName.split(/\s+/)[0] : "Doctor";
    const titleEl = document.getElementById("vet-greeting-title");
    if (titleEl) titleEl.textContent = `Welcome back, Dr. ${firstName} 👋`;

    // Load Stats with Attractive Colorful Icons
    try {
      const statsRes = await this.apiRequest("/vet/stats");
      const stats = statsRes.stats;
      if (statsContainer) {
        statsContainer.innerHTML = `
          <div class="vet-card vet-stat">
            <div class="vet-stat-icon-indigo" style="background:#e0e7ff; color:#4338ca; font-size:24px; width:48px; height:48px; border-radius:14px; display:grid; place-items:center;">📅</div>
            <div>
              <div class="vet-stat-value" style="color:#4338ca; font-size:24px; font-weight:800;">${stats.todayAppointments}</div>
              <div class="vet-stat-label" style="font-size:13px; color:#64748b;">Today's Appointments</div>
            </div>
          </div>
          <div class="vet-card vet-stat">
            <div class="vet-stat-icon-amber" style="background:#fef3c7; color:#d97706; font-size:24px; width:48px; height:48px; border-radius:14px; display:grid; place-items:center;">🔔</div>
            <div>
              <div class="vet-stat-value" style="color:#d97706; font-size:24px; font-weight:800;">${stats.pendingRequests}</div>
              <div class="vet-stat-label" style="font-size:13px; color:#64748b;">Pending Requests</div>
            </div>
          </div>
          <div class="vet-card vet-stat">
            <div class="vet-stat-icon-emerald" style="background:#d1fae5; color:#059669; font-size:24px; width:48px; height:48px; border-radius:14px; display:grid; place-items:center;">🩺</div>
            <div>
              <div class="vet-stat-value" style="color:#059669; font-size:24px; font-weight:800;">${stats.upcomingAppointments}</div>
              <div class="vet-stat-label" style="font-size:13px; color:#64748b;">Upcoming Confirmed</div>
            </div>
          </div>
          <div class="vet-card vet-stat">
            <div class="vet-stat-icon-rose" style="background:#ffe4e6; color:#e11d48; font-size:24px; width:48px; height:48px; border-radius:14px; display:grid; place-items:center;">👥</div>
            <div>
              <div class="vet-stat-value" style="color:#e11d48; font-size:24px; font-weight:800;">${stats.totalPatients}</div>
              <div class="vet-stat-label" style="font-size:13px; color:#64748b;">My Active Patients</div>
            </div>
          </div>
        `;
      }
    } catch (e) {
      console.error("Dashboard stats load error:", e);
    }

    // Load Appointment Requests
    try {
      const apptRes = await this.apiRequest("/appointments/vet?status=pending");
      const requests = apptRes.appointments || [];
      if (requestsContainer) {
        if (requests.length === 0) {
          requestsContainer.innerHTML = `<p style="color:var(--muted);padding:20px 0;text-align:center;">No pending appointment requests.</p>`;
        } else {
          requestsContainer.innerHTML = requests.map(a => {
            const pet = a.petId || {};
            const owner = a.ownerId || {};
            const petPhoto = pet.petPhoto ? `<img src="${pet.petPhoto}" class="vet-request-pet-img">` : `<div class="vet-request-pet-img"><i class="fa-solid fa-paw"></i></div>`;
            return `
              <div class="vet-request-card">
                <div class="vet-request-info">
                  ${petPhoto}
                  <div class="vet-request-details">
                    <h4>${pet.petName || "Pet"} <span style="font-weight:600;color:var(--muted);font-size:13px;">(${pet.species || "Animal"} • ${pet.breed || "Breed"})</span></h4>
                    <p><strong>Owner:</strong> ${owner.name || "Owner"} (${owner.phone || "No phone"})</p>
                    <p><i class="fa-solid fa-calendar" style="color:var(--teal);"></i> ${a.date} at ${a.time} • <strong>Reason:</strong> ${a.reason || a.appointmentType}</p>
                  </div>
                </div>
                <div class="vet-request-actions">
                  <button class="vet-btn-success" onclick="PawSyncVet.acceptAppointment('${a._id}')"><i class="fa-solid fa-check"></i> Accept</button>
                  <button class="vet-btn-danger" onclick="PawSyncVet.rejectAppointment('${a._id}')"><i class="fa-solid fa-xmark"></i> Reject</button>
                </div>
              </div>
            `;
          }).join("");
        }
      }
    } catch (e) {
      console.error("Appointment requests load error:", e);
    }

    // Load Recent Patients
    try {
      const patientRes = await this.apiRequest("/patients/vet");
      const patients = patientRes.patients || [];
      if (patientsContainer) {
        if (patients.length === 0) {
          patientsContainer.innerHTML = `<p style="color:var(--muted);padding:20px 0;text-align:center;">No patients recorded yet.</p>`;
        } else {
          patientsContainer.innerHTML = patients.slice(0, 3).map(p => {
            const pet = p.pet;
            const owner = p.owner || {};
            const photo = pet.petPhoto ? `<img src="${pet.petPhoto}" class="vet-pet-photo-large">` : `<div class="vet-pet-photo-large"><i class="fa-solid fa-paw"></i></div>`;
            return `
              <div class="vet-card vet-patient-card" onclick="PawSyncVet.openPatientRecord('${pet._id}')">
                <div class="vet-patient-header">
                  ${photo}
                  <div>
                    <h3>${pet.petName}</h3>
                    <p>${pet.species} • ${pet.breed}</p>
                    <p>Owner: ${owner.name || "Owner"}</p>
                  </div>
                </div>
                <div class="vet-patient-footer">
                  <span>Last Visit: ${p.lastVisit || "N/A"}</span>
                  <span style="color:var(--teal);font-weight:800;">View Record →</span>
                </div>
              </div>
            `;
          }).join("");
        }
      }
    } catch (e) {
      console.error("Patients load error:", e);
    }
  },

  async acceptAppointment(apptId) {
    try {
      await this.apiRequest(`/appointments/${apptId}/accept`, { method: "PUT" });
      alert("Appointment accepted! Owner has been notified.");
      this.init();
    } catch (e) {
      alert("Failed to accept appointment: " + e.message);
    }
  },

  async rejectAppointment(apptId) {
    const reason = prompt("Enter rejection reason for owner (optional):");
    try {
      await this.apiRequest(`/appointments/${apptId}/reject`, {
        method: "PUT",
        body: JSON.stringify({ reason })
      });
      alert("Appointment rejected.");
      this.init();
    } catch (e) {
      alert("Failed to reject appointment: " + e.message);
    }
  },

  async completeAppointment(apptId) {
    try {
      await this.apiRequest(`/appointments/${apptId}/complete`, { method: "PUT" });
      alert("Appointment completed!");
      this.init();
    } catch (e) {
      alert("Error: " + e.message);
    }
  },

  /* =========================================================
     APPOINTMENTS PAGE CONTROLLER
  ========================================================= */
  async loadAppointmentsPage(statusFilter = "all") {
    const listEl = document.getElementById("vet-appointments-table");
    if (!listEl) return;

    try {
      const res = await this.apiRequest(`/appointments/vet?status=${statusFilter}`);
      const appts = res.appointments || [];

      if (appts.length === 0) {
        listEl.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--muted);">No appointments found under "${statusFilter}" status.</td></tr>`;
        return;
      }

      listEl.innerHTML = appts.map(a => {
        const pet = a.petId || {};
        const owner = a.ownerId || {};

        let actionBtns = "";
        if (a.status === "pending") {
          actionBtns = `
            <button class="vet-btn-success" onclick="PawSyncVet.acceptAppointment('${a._id}')"><i class="fa-solid fa-check"></i> Accept</button>
            <button class="vet-btn-danger" onclick="PawSyncVet.rejectAppointment('${a._id}')"><i class="fa-solid fa-xmark"></i> Reject</button>
          `;
        } else if (a.status === "accepted") {
          actionBtns = `
            <button class="vet-primary" style="padding:7px 14px;font-size:12.5px;" onclick="PawSyncVet.completeAppointment('${a._id}')"><i class="fa-solid fa-check-double"></i> Complete</button>
            <button class="vet-secondary" style="padding:7px 14px;font-size:12.5px;" onclick="PawSyncVet.openPatientRecord('${pet._id}')"><i class="fa-solid fa-file-medical"></i> Record</button>
          `;
        } else {
          actionBtns = `<button class="vet-secondary" style="padding:7px 14px;font-size:12.5px;" onclick="PawSyncVet.openPatientRecord('${pet._id}')">View Patient</button>`;
        }

        return `
          <tr>
            <td><strong>${a.time}</strong><br><small style="color:var(--muted);">${a.date}</small></td>
            <td>
              <strong>${pet.petName || "Pet"}</strong><br>
              <small style="color:var(--muted);">${pet.species} • ${pet.breed}</small>
            </td>
            <td>${owner.name || "Owner"}<br><small style="color:var(--muted);">${owner.phone || ""}</small></td>
            <td>${a.appointmentType || a.reason}</td>
            <td><span class="vet-status ${a.status}">${a.status}</span></td>
            <td>${actionBtns}</td>
          </tr>
        `;
      }).join("");
    } catch (e) {
      console.error("Load appointments page error:", e);
    }
  },

  /* =========================================================
     PATIENTS PAGE CONTROLLER
  ========================================================= */
  async loadPatientsPage() {
    const gridEl = document.getElementById("vet-patients-grid");
    if (!gridEl) return;

    try {
      const res = await this.apiRequest("/patients/vet");
      const patients = res.patients || [];

      if (patients.length === 0) {
        gridEl.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted);">No patients registered yet. Patients will automatically appear here when an appointment is accepted.</div>`;
        return;
      }

      gridEl.innerHTML = patients.map(p => {
        const pet = p.pet;
        const owner = p.owner || {};
        const photo = pet.petPhoto ? `<img src="${pet.petPhoto}" class="vet-pet-photo-large">` : `<div class="vet-pet-photo-large"><i class="fa-solid fa-paw"></i></div>`;

        return `
          <div class="vet-card vet-patient-card" onclick="PawSyncVet.openPatientRecord('${pet._id}')">
            <div class="vet-patient-header">
              ${photo}
              <div>
                <h3>${pet.petName}</h3>
                <p>${pet.species} • ${pet.breed}</p>
                <p>Gender: ${pet.gender} • Weight: ${pet.currentWeight ? pet.currentWeight.value + ' ' + (pet.currentWeight.unit || 'kg') : 'N/A'}</p>
                <p><strong>Owner:</strong> ${owner.name || "Owner"} (${owner.phone || "No phone"})</p>
              </div>
            </div>
            <div class="vet-patient-footer">
              <span>Visits: <strong>${p.totalAppointments} visits</strong></span>
              <span style="color:var(--teal);font-weight:800;">Open Record →</span>
            </div>
          </div>
        `;
      }).join("");
    } catch (e) {
      console.error("Load patients error:", e);
    }
  },

  /* =========================================================
     OPEN DETAILED PATIENT RECORD MODAL
  ========================================================= */
  async openPatientRecord(petId) {
    try {
      const res = await this.apiRequest(`/patients/vet/${petId}`);
      const data = res.patient;
      const pet = data.pet;
      const owner = data.owner || {};

      let modalOverlay = document.getElementById("vet-patient-modal");
      if (!modalOverlay) {
        modalOverlay = document.createElement("div");
        modalOverlay.id = "vet-patient-modal";
        modalOverlay.className = "vet-modal-overlay";
        document.body.appendChild(modalOverlay);
      }

      const photo = pet.petPhoto ? `<img src="${pet.petPhoto}" style="width:70px;height:70px;border-radius:20px;object-fit:cover;">` : `<div class="vet-pet-photo-large"><i class="fa-solid fa-paw"></i></div>`;

      modalOverlay.innerHTML = `
        <div class="vet-modal-content" style="max-width:850px;">
          <div class="vet-modal-header">
            <div style="display:flex;align-items:center;gap:16px;">
              ${photo}
              <div>
                <h3 style="margin:0;color:var(--navy);">${pet.petName}</h3>
                <p style="margin:2px 0;color:var(--muted);font-size:14px;">${pet.species} • ${pet.breed} • ${pet.gender}</p>
                <p style="margin:0;font-size:13px;"><strong>Owner:</strong> ${owner.name || "Owner"} | <strong>Phone:</strong> ${owner.phone || "N/A"}</p>
              </div>
            </div>
            <button class="vet-modal-close" onclick="document.getElementById('vet-patient-modal').remove()">✕</button>
          </div>

          <!-- Navigation Tabs -->
          <div class="vet-tabs">
            <button class="vet-tab-btn active" onclick="PawSyncVet.switchPatientTab('info', this)"><i class="fa-solid fa-paw"></i> Pet Info</button>
            <button class="vet-tab-btn" onclick="PawSyncVet.switchPatientTab('history', this)"><i class="fa-solid fa-notes-medical"></i> Medical History</button>
            <button class="vet-tab-btn" onclick="PawSyncVet.switchPatientTab('prescriptions', this)"><i class="fa-solid fa-prescription-bottle-medical"></i> Prescriptions</button>
            <button class="vet-tab-btn" onclick="PawSyncVet.switchPatientTab('vaccinations', this)"><i class="fa-solid fa-syringe"></i> Vaccinations</button>
            <button class="vet-tab-btn" onclick="PawSyncVet.switchPatientTab('appointments', this)"><i class="fa-solid fa-calendar"></i> Appointments</button>
          </div>

          <!-- Tab Content -->
          <div id="patient-tab-content">
            ${this.renderPatientInfoTab(pet, owner)}
          </div>

          <div class="vet-form-actions" style="margin-top:24px;border-top:1px solid var(--border);padding-top:18px;">
            <button class="vet-primary" onclick="PawSyncVet.showAddMedicalRecordModal('${pet._id}')"><i class="fa-solid fa-plus"></i> Add Medical Record</button>
            <button class="vet-secondary" onclick="PawSyncVet.showAddPrescriptionModal('${pet._id}')"><i class="fa-solid fa-plus"></i> Add Prescription</button>
            <button class="vet-secondary" onclick="PawSyncVet.showAddVaccinationModal('${pet._id}')"><i class="fa-solid fa-plus"></i> Add Vaccination</button>
          </div>
        </div>
      `;

      this.currentActivePatient = data;
    } catch (e) {
      alert("Error loading patient record: " + e.message);
    }
  },

  switchPatientTab(tabName, btnEl) {
    document.querySelectorAll(".vet-tab-btn").forEach(b => b.classList.remove("active"));
    btnEl.classList.add("active");

    const contentEl = document.getElementById("patient-tab-content");
    if (!contentEl || !this.currentActivePatient) return;

    const data = this.currentActivePatient;
    const pet = data.pet;

    switch (tabName) {
      case "info":
        contentEl.innerHTML = this.renderPatientInfoTab(pet, data.owner);
        break;
      case "history":
        contentEl.innerHTML = this.renderMedicalHistoryTab(data.medicalRecords);
        break;
      case "prescriptions":
        contentEl.innerHTML = this.renderPrescriptionsTab(data.prescriptions);
        break;
      case "vaccinations":
        contentEl.innerHTML = this.renderVaccinationsTab(data.vaccinations);
        break;
      case "appointments":
        contentEl.innerHTML = this.renderAppointmentHistoryTab(data.appointments);
        break;
    }
  },

  renderPatientInfoTab(pet, owner) {
    return `
      <div class="vet-form-grid" style="gap:16px;">
        <div class="vet-field">
          <label>Pet Name</label>
          <div style="font-weight:800;color:var(--navy);font-size:16px;">${pet.petName}</div>
        </div>
        <div class="vet-field">
          <label>Species & Breed</label>
          <div>${pet.species} (${pet.breed})</div>
        </div>
        <div class="vet-field">
          <label>Gender & Reproductive Status</label>
          <div>${pet.gender} (${pet.reproductiveStatus || "Unknown"})</div>
        </div>
        <div class="vet-field">
          <label>Date of Birth</label>
          <div>${pet.dateOfBirth ? new Date(pet.dateOfBirth).toLocaleDateString() : "N/A"}</div>
        </div>
        <div class="vet-field">
          <label>Current Weight</label>
          <div>${pet.currentWeight ? pet.currentWeight.value + ' ' + (pet.currentWeight.unit || 'kg') : "N/A"}</div>
        </div>
        <div class="vet-field">
          <label>Microchip ID</label>
          <div>${pet.microchipId || "None"}</div>
        </div>
        <div class="vet-field vet-full">
          <label>Medical Conditions / Allergies</label>
          <div>${pet.medicalConditions && pet.medicalConditions.length > 0 ? pet.medicalConditions.join(", ") : "None reported"}</div>
        </div>
      </div>
    `;
  },

  renderMedicalHistoryTab(records = []) {
    if (records.length === 0) {
      return `<p style="color:var(--muted);padding:20px 0;">No medical records logged yet for this patient.</p>`;
    }
    return records.map(r => `
      <div class="vet-card" style="margin-bottom:14px;background:#f8fafc;padding:18px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <strong style="color:var(--teal-dark);font-size:14px;"><i class="fa-solid fa-calendar"></i> Visit Date: ${new Date(r.visitDate).toLocaleDateString()}</strong>
          <span class="vet-status completed">Consultation</span>
        </div>
        <p style="margin:4px 0;"><strong>Reason:</strong> ${r.reason || "N/A"}</p>
        <p style="margin:4px 0;"><strong>Symptoms:</strong> ${r.symptoms || "None"}</p>
        <p style="margin:4px 0;"><strong>Diagnosis:</strong> ${r.diagnosis || "Healthy"}</p>
        <p style="margin:4px 0;"><strong>Treatment:</strong> ${r.treatment || "N/A"}</p>
        ${r.vetNotes ? `<p style="background:#e0f2fe;color:#0369a1;padding:10px;border-radius:10px;margin-top:8px;font-size:13.5px;"><strong>Vet Notes:</strong> ${r.vetNotes}</p>` : ""}
      </div>
    `).join("");
  },

  renderPrescriptionsTab(prescriptions = []) {
    if (prescriptions.length === 0) {
      return `<p style="color:var(--muted);padding:20px 0;">No prescriptions recorded.</p>`;
    }
    return prescriptions.map(p => `
      <div class="vet-card" style="margin-bottom:14px;background:#f8fafc;padding:18px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <strong style="color:var(--navy);font-size:16px;"><i class="fa-solid fa-prescription-bottle-medical" style="color:var(--teal);"></i> ${p.medicineName}</strong>
          <span class="vet-status ${p.status === 'Active' ? 'verified' : 'rejected'}">${p.status}</span>
        </div>
        <p style="margin:4px 0;"><strong>Dosage:</strong> ${p.dosage} | <strong>Frequency:</strong> ${p.frequency}</p>
        <p style="margin:4px 0;"><strong>Duration:</strong> ${p.duration} | <strong>Start Date:</strong> ${new Date(p.startDate).toLocaleDateString()}</p>
        ${p.instructions ? `<p style="color:var(--muted);margin:4px 0;"><strong>Instructions:</strong> ${p.instructions}</p>` : ""}
      </div>
    `).join("");
  },

  renderVaccinationsTab(vaccinations = []) {
    if (vaccinations.length === 0) {
      return `<p style="color:var(--muted);padding:20px 0;">No vaccination records available.</p>`;
    }
    return vaccinations.map(v => `
      <div class="vet-card" style="margin-bottom:14px;background:#f8fafc;padding:18px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <strong style="color:var(--navy);font-size:16px;"><i class="fa-solid fa-syringe" style="color:var(--teal);"></i> ${v.vaccine}</strong>
          <span class="vet-status verified">Given: ${new Date(v.dateGiven).toLocaleDateString()}</span>
        </div>
        <p style="margin:4px 0;"><strong>Next Due Date:</strong> ${new Date(v.nextDue).toLocaleDateString()}</p>
        ${v.batchNumber ? `<p style="margin:4px 0;"><strong>Batch Number:</strong> ${v.batchNumber}</p>` : ""}
      </div>
    `).join("");
  },

  renderAppointmentHistoryTab(appointments = []) {
    if (appointments.length === 0) {
      return `<p style="color:var(--muted);padding:20px 0;">No appointment history found.</p>`;
    }
    return appointments.map(a => `
      <div class="vet-card" style="margin-bottom:14px;background:#f8fafc;padding:18px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <strong>📅 ${a.date} at ${a.time}</strong>
          <span class="vet-status ${a.status}">${a.status}</span>
        </div>
        <p style="margin:6px 0 0;color:var(--muted);"><strong>Type / Reason:</strong> ${a.appointmentType || a.reason}</p>
      </div>
    `).join("");
  },

  /* =========================================================
     MODALS FOR ADDING RECORDS
  ========================================================= */
  showAddMedicalRecordModal(petId) {
    let modal = document.createElement("div");
    modal.className = "vet-modal-overlay";
    modal.innerHTML = `
      <div class="vet-modal-content">
        <div class="vet-modal-header">
          <h3><i class="fa-solid fa-notes-medical" style="color:var(--teal);"></i> + Add Medical Record</h3>
          <button class="vet-modal-close" onclick="this.closest('.vet-modal-overlay').remove()">✕</button>
        </div>
        <form onsubmit="PawSyncVet.submitMedicalRecord(event, '${petId}')">
          <div class="vet-form-grid">
            <div class="vet-field">
              <label>Visit Date</label>
              <input type="date" id="rec-visitDate" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="vet-field">
              <label>Reason for Visit</label>
              <input type="text" id="rec-reason" placeholder="e.g. General Checkup" required>
            </div>
            <div class="vet-field vet-full">
              <label>Symptoms</label>
              <input type="text" id="rec-symptoms" placeholder="Observed symptoms...">
            </div>
            <div class="vet-field vet-full">
              <label>Diagnosis</label>
              <input type="text" id="rec-diagnosis" placeholder="Diagnosis result..." required>
            </div>
            <div class="vet-field vet-full">
              <label>Treatment</label>
              <input type="text" id="rec-treatment" placeholder="Prescribed treatment or procedure...">
            </div>
            <div class="vet-field">
              <label>Weight (kg)</label>
              <input type="number" step="0.1" id="rec-weight" placeholder="e.g. 4.5">
            </div>
            <div class="vet-field">
              <label>Temperature</label>
              <input type="text" id="rec-temp" placeholder="e.g. 101.5 °F">
            </div>
            <div class="vet-field vet-full">
              <label>Vet Notes</label>
              <textarea id="rec-notes" placeholder="Additional notes or recommendations..."></textarea>
            </div>
          </div>
          <div class="vet-form-actions">
            <button type="button" class="vet-secondary" onclick="this.closest('.vet-modal-overlay').remove()">Cancel</button>
            <button type="submit" class="vet-primary">Save Medical Record</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  },

  async submitMedicalRecord(e, petId) {
    e.preventDefault();
    try {
      await this.apiRequest("/medical-records", {
        method: "POST",
        body: JSON.stringify({
          petId,
          visitDate: document.getElementById("rec-visitDate").value,
          reason: document.getElementById("rec-reason").value,
          symptoms: document.getElementById("rec-symptoms").value,
          diagnosis: document.getElementById("rec-diagnosis").value,
          treatment: document.getElementById("rec-treatment").value,
          weight: document.getElementById("rec-weight").value,
          temperature: document.getElementById("rec-temp").value,
          vetNotes: document.getElementById("rec-notes").value
        })
      });
      alert("Medical record added successfully!");
      document.querySelectorAll(".vet-modal-overlay").forEach(m => m.remove());
      this.openPatientRecord(petId);
    } catch (err) {
      alert("Failed to save medical record: " + err.message);
    }
  },

  showAddPrescriptionModal(petId) {
    let modal = document.createElement("div");
    modal.className = "vet-modal-overlay";
    modal.innerHTML = `
      <div class="vet-modal-content">
        <div class="vet-modal-header">
          <h3><i class="fa-solid fa-prescription-bottle-medical" style="color:var(--teal);"></i> + Add Prescription</h3>
          <button class="vet-modal-close" onclick="this.closest('.vet-modal-overlay').remove()">✕</button>
        </div>
        <form onsubmit="PawSyncVet.submitPrescription(event, '${petId}')">
          <div class="vet-form-grid">
            <div class="vet-field vet-full">
              <label>Medicine Name</label>
              <input type="text" id="rx-name" placeholder="e.g. Amoxicillin" required>
            </div>
            <div class="vet-field">
              <label>Dosage</label>
              <input type="text" id="rx-dosage" placeholder="e.g. 250 mg" required>
            </div>
            <div class="vet-field">
              <label>Frequency</label>
              <input type="text" id="rx-freq" placeholder="e.g. Twice daily after food">
            </div>
            <div class="vet-field">
              <label>Duration</label>
              <input type="text" id="rx-duration" placeholder="e.g. 7 days">
            </div>
            <div class="vet-field">
              <label>Start Date</label>
              <input type="date" id="rx-start" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="vet-field vet-full">
              <label>Special Instructions</label>
              <textarea id="rx-instructions" placeholder="Take with food, keep refrigerated..."></textarea>
            </div>
          </div>
          <div class="vet-form-actions">
            <button type="button" class="vet-secondary" onclick="this.closest('.vet-modal-overlay').remove()">Cancel</button>
            <button type="submit" class="vet-primary">Save Prescription</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  },

  async submitPrescription(e, petId) {
    e.preventDefault();
    try {
      await this.apiRequest("/prescriptions", {
        method: "POST",
        body: JSON.stringify({
          petId,
          medicineName: document.getElementById("rx-name").value,
          dosage: document.getElementById("rx-dosage").value,
          frequency: document.getElementById("rx-freq").value,
          duration: document.getElementById("rx-duration").value,
          startDate: document.getElementById("rx-start").value,
          instructions: document.getElementById("rx-instructions").value
        })
      });
      alert("Prescription added successfully!");
      document.querySelectorAll(".vet-modal-overlay").forEach(m => m.remove());
      this.openPatientRecord(petId);
    } catch (err) {
      alert("Failed to save prescription: " + err.message);
    }
  },

  showAddVaccinationModal(petId) {
    let modal = document.createElement("div");
    modal.className = "vet-modal-overlay";
    modal.innerHTML = `
      <div class="vet-modal-content">
        <div class="vet-modal-header">
          <h3><i class="fa-solid fa-syringe" style="color:var(--teal);"></i> + Add Vaccination</h3>
          <button class="vet-modal-close" onclick="this.closest('.vet-modal-overlay').remove()">✕</button>
        </div>
        <form onsubmit="PawSyncVet.submitVaccination(event, '${petId}')">
          <div class="vet-form-grid">
            <div class="vet-field vet-full">
              <label>Vaccine Name</label>
              <input type="text" id="vac-name" placeholder="e.g. Rabies, DHPP" required>
            </div>
            <div class="vet-field">
              <label>Date Given</label>
              <input type="date" id="vac-given" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="vet-field">
              <label>Next Due Date</label>
              <input type="date" id="vac-due" required>
            </div>
            <div class="vet-field">
              <label>Batch Number</label>
              <input type="text" id="vac-batch" placeholder="e.g. BATCH-9921">
            </div>
            <div class="vet-field vet-full">
              <label>Notes</label>
              <textarea id="vac-notes" placeholder="Notes..."></textarea>
            </div>
          </div>
          <div class="vet-form-actions">
            <button type="button" class="vet-secondary" onclick="this.closest('.vet-modal-overlay').remove()">Cancel</button>
            <button type="submit" class="vet-primary">Save Vaccination</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  },

  async submitVaccination(e, petId) {
    e.preventDefault();
    try {
      await this.apiRequest("/vaccinations", {
        method: "POST",
        body: JSON.stringify({
          petId,
          vaccine: document.getElementById("vac-name").value,
          dateGiven: document.getElementById("vac-given").value,
          nextDue: document.getElementById("vac-due").value,
          batchNumber: document.getElementById("vac-batch").value,
          notes: document.getElementById("vac-notes").value
        })
      });
      alert("Vaccination record added!");
      document.querySelectorAll(".vet-modal-overlay").forEach(m => m.remove());
      this.openPatientRecord(petId);
    } catch (err) {
      alert("Failed to save vaccination: " + err.message);
    }
  },

  /* =========================================================
     LIST PAGES CONTROLLERS
  ========================================================= */
  async loadRecordsPage() {
    const listEl = document.getElementById("vet-records-list");
    if (!listEl) return;
    try {
      const res = await this.apiRequest("/patients/vet");
      const patients = res.patients || [];
      if (patients.length === 0) {
        listEl.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--muted);">No medical records found.</td></tr>`;
        return;
      }
      listEl.innerHTML = patients.map(p => `
        <tr>
          <td><strong>${p.pet.petName}</strong></td>
          <td>${p.pet.species} (${p.pet.breed})</td>
          <td>${p.owner ? p.owner.name : "Owner"}</td>
          <td>${p.totalAppointments} Consultation Visits</td>
          <td><button class="vet-secondary" style="padding:6px 12px;" onclick="PawSyncVet.openPatientRecord('${p.pet._id}')">View Full History</button></td>
        </tr>
      `).join("");
    } catch (e) {}
  },

  async loadVaccinationsPage() {
    this.loadRecordsPage();
  },

  async loadPrescriptionsPage() {
    this.loadRecordsPage();
  },

  /* =========================================================
     VET PROFILE CONTROLLER
  ========================================================= */
  async loadProfilePage() {
    const form = document.getElementById("vet-profile-form");
    if (!form) return;

    try {
      const res = await this.apiRequest("/vet/profile/me");
      const prof = res.profile;
      const user = res.user;

      const statusContainer = document.getElementById("vet-verification-status-banner");
      if (statusContainer) {
        const rawStatus = (prof && (prof.verificationStatus || (prof.isVerified ? "APPROVED" : "PENDING")) || "PENDING").toUpperCase();

        if (rawStatus === "APPROVED" || rawStatus === "VERIFIED" || (prof && prof.isVerified)) {
          statusContainer.innerHTML = `
            <div style="background:#d1fae5; color:#059669; border:1px solid #a7f3d0; padding:18px 24px; border-radius:16px; margin-bottom:24px; display:flex; align-items:center; gap:14px;">
              <span style="font-size:32px;">🟢</span>
              <div>
                <h3 style="margin:0 0 2px; font-size:17px; font-weight:800;">PawSync Verified Veterinarian</h3>
                <p style="margin:0; font-size:13.5px; opacity:0.9;">Your professional veterinary profile and license credentials have been reviewed and approved by Platform Admin. You are visible to pet owners for appointment bookings.</p>
              </div>
            </div>
          `;
        } else if (rawStatus === "REJECTED") {
          statusContainer.innerHTML = `
            <div style="background:#fee2e2; color:#dc2626; border:1px solid #fca5a5; padding:18px 24px; border-radius:16px; margin-bottom:24px;">
              <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
                <span style="font-size:28px;">🔴</span>
                <h3 style="margin:0; font-size:18px; font-weight:800;">Verification Rejected</h3>
              </div>
              <div style="background:#ffffff; padding:12px 16px; border-radius:10px; border:1px solid #fca5a5; font-size:14px; margin-bottom:8px;">
                <strong>Reason:</strong> ${prof ? (prof.rejectionReason || "Professional registration document could not be verified.") : "Professional registration document could not be verified."}
              </div>
              <p style="margin:0; font-size:13.5px;">Please update your professional credentials and re-upload clear veterinary registration documents below, then submit for admin re-evaluation.</p>
            </div>
          `;
        } else {
          statusContainer.innerHTML = `
            <div style="background:#fef3c7; color:#d97706; border:1px solid #fde68a; padding:18px 24px; border-radius:16px; margin-bottom:24px; display:flex; align-items:center; gap:14px;">
              <span style="font-size:32px;">🟡</span>
              <div>
                <h3 style="margin:0 0 2px; font-size:17px; font-weight:800;">Verification Pending</h3>
                <p style="margin:0; font-size:13.5px; opacity:0.9;">Your veterinary registration details have been submitted and are currently pending review by Platform Admin. Once approved, your profile will be marked as "PawSync Verified".</p>
              </div>
            </div>
          `;
        }
      }

      if (prof) {
        if (document.getElementById("prof-fullName")) document.getElementById("prof-fullName").value = prof.fullName || "";
        if (document.getElementById("prof-email")) document.getElementById("prof-email").value = prof.email || "";
        if (document.getElementById("prof-phone")) document.getElementById("prof-phone").value = prof.phone || "";
        if (document.getElementById("prof-qualification")) document.getElementById("prof-qualification").value = prof.qualification || "";
        if (document.getElementById("prof-licenseNumber")) document.getElementById("prof-licenseNumber").value = prof.licenseNumber || "";
        if (document.getElementById("prof-specialization")) document.getElementById("prof-specialization").value = prof.specialization || "General Veterinary";
        if (document.getElementById("prof-experienceYears")) document.getElementById("prof-experienceYears").value = prof.experienceYears || 0;
        if (document.getElementById("prof-clinicName")) document.getElementById("prof-clinicName").value = prof.clinicName || "";
        if (document.getElementById("prof-clinicAddress")) document.getElementById("prof-clinicAddress").value = prof.clinicAddress || "";
        if (document.getElementById("prof-city")) document.getElementById("prof-city").value = prof.city || "";
        if (document.getElementById("prof-state")) document.getElementById("prof-state").value = prof.state || "";
        if (document.getElementById("prof-pincode")) document.getElementById("prof-pincode").value = prof.pincode || "";
        if (document.getElementById("prof-clinicPhone")) document.getElementById("prof-clinicPhone").value = prof.clinicPhone || "";
        if (document.getElementById("prof-consultationFee")) document.getElementById("prof-consultationFee").value = prof.consultationFee || 500;
        if (document.getElementById("prof-startHour")) document.getElementById("prof-startHour").value = prof.availableHours?.start || "10:00";
        if (document.getElementById("prof-endHour")) document.getElementById("prof-endHour").value = prof.availableHours?.end || "18:00";
      } else if (user) {
        if (document.getElementById("prof-fullName")) document.getElementById("prof-fullName").value = user.name || "";
        if (document.getElementById("prof-email")) document.getElementById("prof-email").value = user.email || "";
        if (document.getElementById("prof-phone")) document.getElementById("prof-phone").value = user.phone || "";
        if (document.getElementById("prof-clinicName")) document.getElementById("prof-clinicName").value = user.clinicName || "";
        if (document.getElementById("prof-licenseNumber")) document.getElementById("prof-licenseNumber").value = user.licenseNumber || "";
      }
    } catch (e) {
      console.error("Load profile page error:", e);
    }
  },

  async handleProfileSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    try {
      await this.apiRequest("/vet/profile", {
        method: "POST",
        body: formData
      });
      alert("Profile updated! Your details and verification documents have been saved.");
      location.reload();
    } catch (err) {
      alert("Error saving profile: " + err.message);
    }
  },

  /* =========================================================
     NOTIFICATIONS PAGE CONTROLLER
  ========================================================= */
  async loadNotificationsPage() {
    const listEl = document.getElementById("vet-notifications-list");
    if (!listEl) return;

    try {
      const res = await this.apiRequest("/notifications");
      const notifs = res.notifications || [];

      if (notifs.length === 0) {
        listEl.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted);">No notifications yet.</div>`;
        return;
      }

      listEl.innerHTML = notifs.map(n => `
        <div class="vet-card" style="margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;${!n.isRead ? 'background:#f0fdfa;border-color:var(--teal);' : ''}">
          <div>
            <h4 style="margin:0 0 4px;color:var(--navy);"><i class="fa-solid fa-bell" style="color:var(--teal);"></i> ${n.title}</h4>
            <p style="margin:0;color:var(--text);font-size:14px;">${n.message}</p>
            <small style="color:var(--muted);">${new Date(n.createdAt).toLocaleString()}</small>
          </div>
          ${!n.isRead ? `<button class="vet-secondary" style="padding:6px 14px;font-size:12.5px;" onclick="PawSyncVet.markNotifRead('${n._id}')">Mark as Read</button>` : `<span class="vet-status completed">Read</span>`}
        </div>
      `).join("");
    } catch (e) {
      console.error("Load notifications error:", e);
    }
  },

  async markNotifRead(id) {
    try {
      await this.apiRequest(`/notifications/${id}/read`, { method: "PUT" });
      this.loadNotificationsPage();
      this.loadNotificationBadge();
    } catch (e) {}
  }
};

document.addEventListener("DOMContentLoaded", () => {
  PawSyncVet.init();
});
