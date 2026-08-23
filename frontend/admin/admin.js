/**
 * PawSync - Platform Admin Panel & Veterinarian Verification System
 * Private Management Area for Authorized Administrators Only
 */

const PawSyncAdmin = {
  token: localStorage.getItem("pawsyncToken"),
  currentSection: "dashboard", // "dashboard" | "verification" | "users" | "pets" | "reports"
  verificationFilter: "PENDING", // "PENDING" | "APPROVED" | "REJECTED" | "ALL"
  userRoleFilter: "ALL", // "ALL" | "owner" | "vet" | "admin"
  petSpeciesFilter: "ALL", // "ALL" | "Dog" | "Cat" | "Bird" | "Other"
  allVets: [],
  allUsers: [],
  allPets: [],
  selectedVetIdForRejection: null,
  selectedVetIdForApproval: null,

  async apiRequest(endpoint, options = {}) {
    const headers = {
      ...options.headers,
      "Authorization": `Bearer ${this.token}`,
      "Content-Type": "application/json"
    };

    const res = await fetch(`/api${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  },

  async init() {
    const appEl = document.getElementById("adminApp");

    if (!this.token) {
      this.showAccessDenied("Authentication required. Please log in as a PawSync Platform Administrator.");
      return;
    }

    try {
      // Verify user profile role === "admin"
      const userRes = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${this.token}` }
      });
      if (!userRes.ok) {
        throw new Error("Unable to verify user session.");
      }
      const userData = await userRes.json();
      const user = userData.user;

      if (!user || user.role !== "admin") {
        this.showAccessDenied("Access Denied (403). Only authorized Platform Administrators can access the Admin Panel.");
        return;
      }

      // Render Admin Dashboard Shell
      this.renderAdminShell(user);
      this.loadSection(this.currentSection);
    } catch (err) {
      console.error("Admin Access Verification Error:", err);
      this.showAccessDenied("Access Denied (403). You do not have administrator permissions to view this system.");
    }
  },

  showAccessDenied(message) {
    const appEl = document.getElementById("adminApp");
    if (!appEl) return;

    appEl.innerHTML = `
      <div class="access-denied-container">
        <div class="access-denied-card">
          <div class="access-denied-icon">🔒</div>
          <h2>403 - Access Denied</h2>
          <p>${message}</p>
          <a href="/frontend/auth/login/login.html" class="btn-login">
            <span>🔑</span> Go to Administrator Login
          </a>
        </div>
      </div>
    `;
  },

  renderAdminShell(adminUser) {
    const appEl = document.getElementById("adminApp");
    if (!appEl) return;

    appEl.innerHTML = `
      <div class="admin-shell">
        <header class="admin-topbar">
          <div class="admin-brand">
            <span>🛡️</span> PawSync Admin Panel
          </div>
          <div class="admin-topbar-right">
            <div class="admin-user-badge">
              <span>👤</span> ${adminUser.name || 'Platform Admin'}
              <span class="admin-role-tag">ADMIN</span>
            </div>
            <button class="btn-admin-logout" onclick="PawSyncAdmin.logout()">
              <span>🚪</span> Log Out
            </button>
          </div>
        </header>

        <div class="admin-body-layout">
          <aside class="admin-sidebar">
            <div class="admin-sidebar-header">
              <span>🐾</span> PawSync Admin
            </div>
            <div class="sidebar-section-title">MAIN MANAGEMENT</div>
            
            <div class="sidebar-nav-item ${this.currentSection === 'dashboard' ? 'active' : ''}" onclick="PawSyncAdmin.switchSection('dashboard', this)">
              <span>📊</span> Dashboard Overview
            </div>
            
            <div class="sidebar-nav-item ${this.currentSection === 'verification' ? 'active' : ''}" onclick="PawSyncAdmin.switchSection('verification', this)">
              <span>🩺</span> Vet Verification
            </div>
            
            <div class="sidebar-nav-item ${this.currentSection === 'users' ? 'active' : ''}" onclick="PawSyncAdmin.switchSection('users', this)">
              <span>👥</span> User Directory
            </div>
            
            <div class="sidebar-nav-item ${this.currentSection === 'pets' ? 'active' : ''}" onclick="PawSyncAdmin.switchSection('pets', this)">
              <span>🐾</span> Pet Directory
            </div>
            
            <div class="sidebar-nav-item ${this.currentSection === 'reports' ? 'active' : ''}" onclick="PawSyncAdmin.switchSection('reports', this)">
              <span>📈</span> System Reports
            </div>

            <div class="sidebar-footer">
              <div class="sidebar-nav-item" onclick="PawSyncAdmin.logout()" style="color: #ef4444;">
                <span>🚪</span> Logout Session
              </div>
            </div>
          </aside>

          <main class="admin-main-workspace" id="adminMainWorkspace">
            <!-- Dynamic Section Workspace -->
          </main>
        </div>
      </div>
    `;
  },

  switchSection(sectionName, element) {
    document.querySelectorAll(".sidebar-nav-item").forEach(el => el.classList.remove("active"));
    if (element) element.classList.add("active");
    this.currentSection = sectionName;
    this.loadSection(sectionName);
  },

  async loadSection(sectionName) {
    const workspace = document.getElementById("adminMainWorkspace");
    if (!workspace) return;

    if (sectionName === "dashboard") {
      await this.loadDashboardOverview(workspace);
    } else if (sectionName === "verification") {
      await this.loadVetVerificationSection(workspace);
    } else if (sectionName === "users") {
      await this.loadUsersSection(workspace);
    } else if (sectionName === "pets") {
      await this.loadPetsSection(workspace);
    } else if (sectionName === "reports") {
      this.loadReportsSection(workspace);
    }
  },

  /* =========================================================
     1. DASHBOARD OVERVIEW
  ========================================================= */
  async loadDashboardOverview(workspace) {
    workspace.innerHTML = `
      <div class="admin-page-header">
        <h1>Admin Dashboard Overview 📊</h1>
        <p>Monitor platform statistics, registration trends, and pending veterinarian applications.</p>
      </div>
      <div id="dashboardStatsContent">
        <p style="color:#64748b; font-weight: 600;">⏳ Loading dynamic platform statistics...</p>
      </div>
    `;

    try {
      const data = await this.apiRequest("/admin/stats");
      const stats = data.stats || {};
      const requests = data.recentRequests || [];

      document.getElementById("dashboardStatsContent").innerHTML = `
        <div class="admin-stats-grid">
          <div class="stat-card users-card">
            <div class="stat-icon users">👥</div>
            <div class="stat-info">
              <h4>Total Users</h4>
              <div class="stat-value">${stats.totalUsers || 0}</div>
            </div>
          </div>
          <div class="stat-card vets-card">
            <div class="stat-icon vets">🩺</div>
            <div class="stat-info">
              <h4>Total Veterinarians</h4>
              <div class="stat-value">${stats.totalVets || 0}</div>
            </div>
          </div>
          <div class="stat-card pending-card">
            <div class="stat-icon pending">🟡</div>
            <div class="stat-info">
              <h4>Pending Verification</h4>
              <div class="stat-value">${stats.pendingVets || 0}</div>
            </div>
          </div>
          <div class="stat-card approved-card">
            <div class="stat-icon approved">🟢</div>
            <div class="stat-info">
              <h4>Approved Veterinarians</h4>
              <div class="stat-value">${stats.approvedVets || 0}</div>
            </div>
          </div>
          <div class="stat-card rejected-card">
            <div class="stat-icon rejected">🔴</div>
            <div class="stat-info">
              <h4>Rejected Veterinarians</h4>
              <div class="stat-value">${stats.rejectedVets || 0}</div>
            </div>
          </div>
          <div class="stat-card pets-card">
            <div class="stat-icon pets">🐾</div>
            <div class="stat-info">
              <h4>Total Pets</h4>
              <div class="stat-value">${stats.totalPets || 0}</div>
            </div>
          </div>
        </div>

        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:20px; padding:28px; box-shadow: 0 6px 24px rgba(15,23,42,0.03);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <div>
              <h3 style="margin:0; font-size:19px; font-weight:850; color:#0f172a;">Recent Verification Requests</h3>
              <p style="margin:4px 0 0; color:#64748b; font-size:13px;">Review newly registered veterinarians awaiting verification approval.</p>
            </div>
            <button class="btn-action-view" style="width:auto; padding:10px 18px; border-radius:12px; font-weight:800;" onclick="PawSyncAdmin.switchSection('verification', null)">
              View All Requests →
            </button>
          </div>
          ${requests.length === 0 ? `
            <div style="text-align:center; padding:40px 20px; background:#f8fafc; border-radius:16px; border:1px solid #e2e8f0; color:#64748b;">
              <span style="font-size:36px; display:block; margin-bottom:8px;">✨</span>
              <strong style="color:#0f172a; font-size:16px;">No pending veterinarian requests!</strong>
              <p style="margin:4px 0 0;">All veterinarian applications have been reviewed. Excellent job! 🐾</p>
            </div>
          ` : `
            <div class="vet-list-container">
              ${requests.map(v => this.buildVetCardHtml(v)).join("")}
            </div>
          `}
        </div>
      `;
    } catch (err) {
      console.error("Dashboard Stats Error:", err);
      document.getElementById("dashboardStatsContent").innerHTML = `
        <div style="padding:20px; background:#fee2e2; border-radius:14px; color:#dc2626; font-weight:700;">
          ⚠️ Error loading dashboard stats: ${err.message}
        </div>
      `;
    }
  },

  /* =========================================================
     2. VET VERIFICATION SECTION
  ========================================================= */
  async loadVetVerificationSection(workspace) {
    workspace.innerHTML = `
      <div class="admin-page-header">
        <h1>Veterinarian Verification Management 🩺</h1>
        <p>Review veterinarian professional credentials, license numbers, and documents to grant "PawSync Verified" status.</p>
      </div>

      <div class="admin-controls-bar">
        <div class="admin-tabs">
          <button class="admin-tab-btn ${this.verificationFilter === 'PENDING' ? 'active' : ''}" onclick="PawSyncAdmin.setVerificationFilter('PENDING')">🟡 Pending</button>
          <button class="admin-tab-btn ${this.verificationFilter === 'APPROVED' ? 'active' : ''}" onclick="PawSyncAdmin.setVerificationFilter('APPROVED')">🟢 Approved</button>
          <button class="admin-tab-btn ${this.verificationFilter === 'REJECTED' ? 'active' : ''}" onclick="PawSyncAdmin.setVerificationFilter('REJECTED')">🔴 Rejected</button>
          <button class="admin-tab-btn ${this.verificationFilter === 'ALL' ? 'active' : ''}" onclick="PawSyncAdmin.setVerificationFilter('ALL')">📋 All Vets</button>
        </div>

        <div class="admin-search-box">
          <span>🔍</span>
          <input type="text" id="vetSearchInput" placeholder="Search doctor, clinic, license #..." oninput="PawSyncAdmin.filterVetsBySearch()">
        </div>
      </div>

      <div id="vetVerificationList" class="vet-list-container">
        <p style="color:#64748b; font-weight: 600;">⏳ Loading veterinarian applications...</p>
      </div>
    `;

    await this.fetchAndRenderVets();
  },

  async setVerificationFilter(filter) {
    this.verificationFilter = filter;
    document.querySelectorAll(".admin-tab-btn").forEach(btn => btn.classList.remove("active"));
    const activeBtn = Array.from(document.querySelectorAll(".admin-tab-btn")).find(b => b.textContent.toUpperCase().includes(filter));
    if (activeBtn) activeBtn.classList.add("active");
    await this.fetchAndRenderVets();
  },

  async fetchAndRenderVets() {
    const listEl = document.getElementById("vetVerificationList");
    if (!listEl) return;

    try {
      const res = await this.apiRequest(`/admin/vets?status=${this.verificationFilter.toLowerCase()}`);
      this.allVets = res.vets || [];

      this.filterVetsBySearch();
    } catch (err) {
      console.error("Fetch Vets Error:", err);
      listEl.innerHTML = `<p style="color:#dc2626; font-weight:700;">Failed to load veterinarians: ${err.message}</p>`;
    }
  },

  filterVetsBySearch() {
    const listEl = document.getElementById("vetVerificationList");
    const searchInput = document.getElementById("vetSearchInput");
    if (!listEl) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

    const filtered = this.allVets.filter(v => {
      const name = (v.fullName || "").toLowerCase();
      const spec = (v.specialization || "").toLowerCase();
      const clinic = (v.clinicName || "").toLowerCase();
      const license = (v.licenseNumber || "").toLowerCase();
      return name.includes(query) || spec.includes(query) || clinic.includes(query) || license.includes(query);
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:20px; padding:50px; text-align:center; color:#64748b;">
          <span style="font-size:42px; display:block; margin-bottom:10px;">🔎</span>
          <strong style="color:#0f172a; font-size:17px; display:block;">No veterinarian records found</strong>
          <p style="margin:4px 0 0;">Try switching filter tabs or adjusting your search query.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map(v => this.buildVetCardHtml(v)).join("");
  },

  buildVetCardHtml(v) {
    const photo = v.profilePhoto || (v.userId && v.userId.profilePhoto) || "";
    const photoHtml = photo
      ? `<img src="${photo}" alt="${v.fullName}" class="vet-card-photo">`
      : `<div class="vet-card-photo">👨‍⚕️</div>`;

    const rawStatus = (v.verificationStatus || (v.isVerified ? "APPROVED" : "PENDING")).toUpperCase();
    let statusClass = "PENDING";
    let statusLabel = "🟡 PENDING REVIEW";

    if (rawStatus === "APPROVED" || rawStatus === "VERIFIED" || v.isVerified) {
      statusClass = "APPROVED";
      statusLabel = "🟢 PAWSYNC VERIFIED";
    } else if (rawStatus === "REJECTED") {
      statusClass = "REJECTED";
      statusLabel = "🔴 REJECTED";
    }

    return `
      <div class="admin-vet-card" id="vet-card-${v._id}">
        <div class="vet-card-left">
          ${photoHtml}
          <div class="vet-card-meta">
            <span class="vet-status-badge ${statusClass}">${statusLabel}</span>
            <h3>Dr. ${v.fullName}</h3>
            <p><strong>Specialization:</strong> ${v.specialization || "General Veterinary"}</p>
            <p><strong>Qualification:</strong> ${v.qualification || "BVSc"}</p>
            <p><strong>License Reg #:</strong> ${v.licenseNumber || "N/A"}</p>
          </div>
        </div>

        <div class="vet-card-clinic">
          <p style="margin:0 0 6px;"><strong>Clinic:</strong> ${v.clinicName || "N/A"}</p>
          <p style="margin:0 0 6px;"><strong>Location:</strong> ${v.clinicAddress || v.city || "N/A"}</p>
          <p style="margin:0;"><strong>Consultation Fee:</strong> ₹${v.consultationFee || 500}</p>
        </div>

        <div class="vet-card-actions">
          <button type="button" class="btn-action-view" onclick="PawSyncAdmin.viewVetDetails('${v._id}')">View Details</button>
          ${statusClass !== 'APPROVED' ? `<button type="button" class="btn-action-approve" onclick="PawSyncAdmin.approveVet('${v._id}')">✓ Approve</button>` : ''}
          ${statusClass !== 'REJECTED' ? `<button type="button" class="btn-action-reject" onclick="PawSyncAdmin.openRejectModal('${v._id}')">✕ Reject</button>` : ''}
        </div>
      </div>
    `;
  },

  /* =========================================================
     3. VET DETAIL MODAL
  ========================================================= */
  async viewVetDetails(vetId) {
    const modal = document.getElementById("vetDetailModal");
    const modalBody = document.getElementById("vetDetailModalBody");
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `<p style="color:#64748b; font-weight:600;">⏳ Loading profile credentials...</p>`;
    modal.style.display = "flex";

    try {
      const res = await this.apiRequest(`/admin/vets/${vetId}`);
      const vet = res.vet;
      if (!vet) throw new Error("Veterinarian profile not found.");

      const rawStatus = (vet.verificationStatus || (vet.isVerified ? "APPROVED" : "PENDING")).toUpperCase();
      let statusBadge = `<span class="vet-status-badge PENDING">🟡 PENDING REVIEW</span>`;
      if (rawStatus === "APPROVED" || rawStatus === "VERIFIED" || vet.isVerified) {
        statusBadge = `<span class="vet-status-badge APPROVED">🟢 PAWSYNC VERIFIED</span>`;
      } else if (rawStatus === "REJECTED") {
        statusBadge = `<span class="vet-status-badge REJECTED">🔴 REJECTED</span>`;
      }

      const docs = vet.verificationDocuments || [];
      const docsHtml = docs.length > 0
        ? docs.map((url, idx) => `<a href="${url}" target="_blank" class="doc-link-pill">📄 Credential Doc #${idx + 1}</a>`).join("")
        : `<span style="color:#94a3b8; font-size:13px;">No digital documents attached</span>`;

      modalBody.innerHTML = `
        <div style="display:flex; gap:18px; align-items:center; margin-bottom:20px; background:#f8fafc; padding:20px; border-radius:18px; border:1px solid #e2e8f0;">
          <img src="${vet.profilePhoto || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80'}" style="width:76px; height:76px; border-radius:50%; object-fit:cover; border:3px solid #0d9488;">
          <div>
            ${statusBadge}
            <h2 style="margin:6px 0 2px; font-size:22px; font-weight:850; color:#0f172a;">Dr. ${vet.fullName}</h2>
            <p style="margin:0; color:#64748b; font-size:14px; font-weight:600;">${vet.specialization} • ${vet.qualification || 'BVSc'}</p>
          </div>
        </div>

        <div class="detail-grid">
          <div class="detail-item">
            <strong>Registration / License #</strong>
            <span>${vet.licenseNumber}</span>
          </div>
          <div class="detail-item">
            <strong>Years of Experience</strong>
            <span>${vet.experienceYears || 0} Years</span>
          </div>
          <div class="detail-item">
            <strong>Email Address</strong>
            <span>${vet.email || 'N/A'}</span>
          </div>
          <div class="detail-item">
            <strong>Phone Number</strong>
            <span>${vet.phone || 'N/A'}</span>
          </div>
          <div class="detail-item">
            <strong>Clinic Name</strong>
            <span>${vet.clinicName || 'N/A'}</span>
          </div>
          <div class="detail-item">
            <strong>Consultation Fee</strong>
            <span>₹${vet.consultationFee || 500}</span>
          </div>
          <div class="detail-item" style="grid-column: 1 / -1;">
            <strong>Clinic Address</strong>
            <span>${vet.clinicAddress || ''} ${vet.city || ''} ${vet.state || ''} ${vet.pincode || ''}</span>
          </div>
        </div>

        <div style="margin-top:24px;">
          <h4 style="margin:0 0 10px; font-size:15px; font-weight:850; color:#0f172a;">Verification Documents & Certificates</h4>
          <div>${docsHtml}</div>
        </div>

        ${vet.rejectionReason ? `
          <div style="margin-top:18px; background:#fee2e2; border:1px solid #fca5a5; padding:14px 18px; border-radius:14px; color:#b91c1c; font-size:13.5px;">
            <strong style="display:block; margin-bottom:2px;">Rejection Reason:</strong> ${vet.rejectionReason}
          </div>
        ` : ''}

        <div style="margin-top:28px; display:flex; justify-content:flex-end; gap:12px; border-top:1px solid #e2e8f0; padding-top:20px;">
          <button type="button" class="btn-action-view" onclick="PawSyncAdmin.closeModal('vetDetailModal')" style="width:auto; padding:10px 22px; border-radius:12px;">Close</button>
          ${rawStatus !== 'APPROVED' ? `<button type="button" class="btn-action-approve" onclick="PawSyncAdmin.approveVet('${vet._id}')" style="width:auto; padding:10px 22px; border-radius:12px;">✓ Approve Veterinarian</button>` : ''}
          ${rawStatus !== 'REJECTED' ? `<button type="button" class="btn-action-reject" onclick="PawSyncAdmin.openRejectModal('${vet._id}')" style="width:auto; padding:10px 22px; border-radius:12px;">✕ Reject Application</button>` : ''}
        </div>
      `;
    } catch (err) {
      modalBody.innerHTML = `<p style="color:#dc2626; font-weight:700;">Error: ${err.message}</p>`;
    }
  },

  /* =========================================================
     4. APPROVE & REJECT ACTIONS
  ========================================================= */
  approveVet(vetId) {
    this.selectedVetIdForApproval = vetId;
    const modal = document.getElementById("approveModal");
    const confirmBtn = document.getElementById("confirmApproveBtn");
    if (confirmBtn) {
      confirmBtn.onclick = () => this.confirmApprove();
    }
    if (modal) modal.style.display = "flex";
  },

  async confirmApprove() {
    if (!this.selectedVetIdForApproval) return;
    try {
      const res = await this.apiRequest(`/admin/vets/${this.selectedVetIdForApproval}/approve`, { method: "PUT" });
      this.closeModal('approveModal');
      this.closeModal('vetDetailModal');
      this.selectedVetIdForApproval = null;
      await this.loadSection(this.currentSection);
    } catch (err) {
      alert("Approval failed: " + err.message);
    }
  },

  openRejectModal(vetId) {
    this.selectedVetIdForRejection = vetId;
    const modal = document.getElementById("rejectModal");
    const input = document.getElementById("rejectionReasonInput");
    const confirmBtn = document.getElementById("confirmRejectBtn");

    if (input) input.value = "";
    if (confirmBtn) {
      confirmBtn.onclick = () => this.confirmReject();
    }
    if (modal) modal.style.display = "flex";
  },

  async confirmReject() {
    if (!this.selectedVetIdForRejection) return;

    const input = document.getElementById("rejectionReasonInput");
    const reason = input ? input.value.trim() : "";

    if (!reason) {
      alert("Please provide a reason for rejecting the veterinarian.");
      return;
    }

    try {
      const res = await this.apiRequest(`/admin/vets/${this.selectedVetIdForRejection}/reject`, {
        method: "PUT",
        body: JSON.stringify({ reason })
      });
      alert("Veterinarian rejected successfully.");
      this.closeModal('rejectModal');
      this.closeModal('vetDetailModal');
      this.selectedVetIdForRejection = null;
      await this.loadSection(this.currentSection);
    } catch (err) {
      alert("Rejection failed: " + err.message);
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = "none";
  },

  /* =========================================================
     5. USER MANAGEMENT SECTION (DYNAMIC SEARCH & FILTER)
  ========================================================= */
  async loadUsersSection(workspace) {
    workspace.innerHTML = `
      <div class="admin-page-header">
        <h1>User Management Directory 👥</h1>
        <p>View, search, and filter all registered pet owners, veterinarians, and platform administrators.</p>
      </div>

      <div class="admin-controls-bar">
        <div class="admin-tabs">
          <button class="admin-tab-btn ${this.userRoleFilter === 'ALL' ? 'active' : ''}" onclick="PawSyncAdmin.setUserRoleFilter('ALL')">👥 All Users</button>
          <button class="admin-tab-btn ${this.userRoleFilter === 'owner' ? 'active' : ''}" onclick="PawSyncAdmin.setUserRoleFilter('owner')">🐾 Pet Owners</button>
          <button class="admin-tab-btn ${this.userRoleFilter === 'vet' ? 'active' : ''}" onclick="PawSyncAdmin.setUserRoleFilter('vet')">🩺 Veterinarians</button>
          <button class="admin-tab-btn ${this.userRoleFilter === 'admin' ? 'active' : ''}" onclick="PawSyncAdmin.setUserRoleFilter('admin')">🛡️ Administrators</button>
        </div>

        <div class="admin-search-box">
          <span>🔍</span>
          <input type="text" id="userSearchInput" placeholder="Search user by name, email, or role..." oninput="PawSyncAdmin.filterUsersBySearch()">
        </div>
      </div>

      <div id="usersContent" class="table-card-container">
        <p style="padding:24px; color:#64748b; font-weight:600;">⏳ Loading dynamic user records...</p>
      </div>
    `;

    try {
      const res = await this.apiRequest("/admin/users");
      this.allUsers = res.users || [];
      this.filterUsersBySearch();
    } catch (err) {
      document.getElementById("usersContent").innerHTML = `
        <div style="padding:20px; color:#dc2626; font-weight:700;">Error: ${err.message}</div>
      `;
    }
  },

  setUserRoleFilter(role) {
    this.userRoleFilter = role;
    document.querySelectorAll(".admin-tab-btn").forEach(btn => btn.classList.remove("active"));
    const activeBtn = Array.from(document.querySelectorAll(".admin-tab-btn")).find(b => b.textContent.toLowerCase().includes(role === 'ALL' ? 'all' : role));
    if (activeBtn) activeBtn.classList.add("active");
    this.filterUsersBySearch();
  },

  filterUsersBySearch() {
    const contentEl = document.getElementById("usersContent");
    const searchInput = document.getElementById("userSearchInput");
    if (!contentEl) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

    const filtered = this.allUsers.filter(u => {
      const matchesRole = this.userRoleFilter === "ALL" || u.role === this.userRoleFilter;
      const name = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const roleStr = (u.role || "").toLowerCase();
      const matchesSearch = name.includes(query) || email.includes(query) || roleStr.includes(query);
      return matchesRole && matchesSearch;
    });

    if (filtered.length === 0) {
      contentEl.innerHTML = `
        <div style="padding:50px; text-align:center; color:#64748b;">
          <span style="font-size:36px; display:block; margin-bottom:8px;">🔎</span>
          <strong style="color:#0f172a; font-size:16px;">No users match your filter criteria</strong>
          <p style="margin:4px 0 0;">Try adjusting your search query or switching role tabs.</p>
        </div>
      `;
      return;
    }

    contentEl.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>User Details</th>
            <th>Email Address</th>
            <th>Platform Role</th>
            <th>Verification</th>
            <th>Joined Date</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(u => {
            const initial = (u.name || "U").charAt(0).toUpperCase();
            const roleClass = u.role === 'admin' ? 'admin' : (u.role === 'vet' ? 'vet' : 'owner');
            const joinedDate = new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            return `
              <tr>
                <td>
                  <div style="display:flex; align-items:center;">
                    <div class="user-avatar-circle">${initial}</div>
                    <strong style="font-size:15px; color:#0f172a;">${u.name}</strong>
                  </div>
                </td>
                <td style="font-weight:600; color:#475569;">${u.email}</td>
                <td>
                  <span class="user-role-badge ${roleClass}">
                    ${u.role}
                  </span>
                </td>
                <td>
                  <span style="font-weight:700; color:${u.isEmailVerified ? '#059669' : '#64748b'};">
                    ${u.isEmailVerified ? '🟢 Verified' : '⚪ Active'}
                  </span>
                </td>
                <td style="font-weight:600; color:#64748b;">${joinedDate}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    `;
  },

  /* =========================================================
     6. PET DIRECTORY SECTION (DYNAMIC SEARCH & SPECIES FILTER)
  ========================================================= */
  async loadPetsSection(workspace) {
    workspace.innerHTML = `
      <div class="admin-page-header">
        <h1>Pet Directory 🐾</h1>
        <p>View and manage all registered pets across the PawSync platform.</p>
      </div>

      <div class="admin-controls-bar">
        <div class="admin-tabs">
          <button class="admin-tab-btn ${this.petSpeciesFilter === 'ALL' ? 'active' : ''}" onclick="PawSyncAdmin.setPetSpeciesFilter('ALL')">🐾 All Pets</button>
          <button class="admin-tab-btn ${this.petSpeciesFilter === 'Dog' ? 'active' : ''}" onclick="PawSyncAdmin.setPetSpeciesFilter('Dog')">🐶 Dogs</button>
          <button class="admin-tab-btn ${this.petSpeciesFilter === 'Cat' ? 'active' : ''}" onclick="PawSyncAdmin.setPetSpeciesFilter('Cat')">🐱 Cats</button>
          <button class="admin-tab-btn ${this.petSpeciesFilter === 'Bird' ? 'active' : ''}" onclick="PawSyncAdmin.setPetSpeciesFilter('Bird')">🐦 Birds</button>
        </div>

        <div class="admin-search-box">
          <span>🔍</span>
          <input type="text" id="petSearchInput" placeholder="Search pet name, breed, or owner..." oninput="PawSyncAdmin.filterPetsBySearch()">
        </div>
      </div>

      <div id="petsContent" class="table-card-container">
        <p style="padding:24px; color:#64748b; font-weight:600;">⏳ Loading dynamic pet directory...</p>
      </div>
    `;

    try {
      const res = await this.apiRequest("/admin/pets");
      this.allPets = res.pets || [];
      this.filterPetsBySearch();
    } catch (err) {
      document.getElementById("petsContent").innerHTML = `
        <div style="padding:20px; color:#dc2626; font-weight:700;">Error: ${err.message}</div>
      `;
    }
  },

  setPetSpeciesFilter(species) {
    this.petSpeciesFilter = species;
    document.querySelectorAll(".admin-tab-btn").forEach(btn => btn.classList.remove("active"));
    const activeBtn = Array.from(document.querySelectorAll(".admin-tab-btn")).find(b => b.textContent.includes(species === 'ALL' ? 'All Pets' : species));
    if (activeBtn) activeBtn.classList.add("active");
    this.filterPetsBySearch();
  },

  filterPetsBySearch() {
    const contentEl = document.getElementById("petsContent");
    const searchInput = document.getElementById("petSearchInput");
    if (!contentEl) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

    const filtered = this.allPets.filter(p => {
      const matchesSpecies = this.petSpeciesFilter === "ALL" || (p.species || "").toLowerCase().includes(this.petSpeciesFilter.toLowerCase());
      const petName = (p.petName || "").toLowerCase();
      const breed = (p.breed || "").toLowerCase();
      const ownerName = (p.ownerId && p.ownerId.name ? p.ownerId.name : "").toLowerCase();
      const ownerEmail = (p.ownerId && p.ownerId.email ? p.ownerId.email : "").toLowerCase();
      const matchesSearch = petName.includes(query) || breed.includes(query) || ownerName.includes(query) || ownerEmail.includes(query);
      return matchesSpecies && matchesSearch;
    });

    if (filtered.length === 0) {
      contentEl.innerHTML = `
        <div style="padding:50px; text-align:center; color:#64748b;">
          <span style="font-size:36px; display:block; margin-bottom:8px;">🔎</span>
          <strong style="color:#0f172a; font-size:16px;">No pets match your criteria</strong>
          <p style="margin:4px 0 0;">Try adjusting your search query or species tab.</p>
        </div>
      `;
      return;
    }

    contentEl.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Pet Details</th>
            <th>Species</th>
            <th>Breed</th>
            <th>Gender</th>
            <th>Pet Owner</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(p => `
            <tr>
              <td>
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="font-size:22px;">🐾</span>
                  <strong style="font-size:15px; color:#0f172a;">${p.petName}</strong>
                </div>
              </td>
              <td><span style="font-weight:700; color:#0d9488;">${p.species}</span></td>
              <td><span style="font-weight:600; color:#475569;">${p.breed || 'Standard'}</span></td>
              <td><span style="font-weight:600; color:#475569;">${p.gender || 'N/A'}</span></td>
              <td>
                <div style="font-weight:750; color:#0f172a;">${p.ownerId ? p.ownerId.name : 'N/A'}</div>
                <div style="font-size:12px; color:#64748b;">${p.ownerId ? p.ownerId.email : ''}</div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  },

  /* =========================================================
     7. SYSTEM REPORTS SECTION
  ========================================================= */
  loadReportsSection(workspace) {
    workspace.innerHTML = `
      <div class="admin-page-header">
        <h1>Platform System Reports 📈</h1>
        <p>PawSync system health and verification security audit report.</p>
      </div>
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:20px; padding:36px; box-shadow:0 6px 24px rgba(15,23,42,0.03);">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
          <span style="font-size:28px;">🛡️</span>
          <h3 style="margin:0; font-size:20px; font-weight:850; color:#0f172a;">Verification System Status</h3>
        </div>
        <p style="color:#475569; margin:0 0 24px; font-size:14.5px; line-height:1.6;">
          All veterinarian verification workflows are strictly governed by backend role-based access control middleware (<code>protect.requireAdmin</code>). Unverified veterinarians with <code>PENDING</code> or <code>REJECTED</code> status are strictly excluded from public appointment bookings.
        </p>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:20px;">
          <div style="background:#f8fafc; padding:20px; border-radius:16px; border:1px solid #e2e8f0;">
            <strong style="color:#0f172a; display:block; margin-bottom:6px; font-size:13px; text-transform:uppercase; letter-spacing:0.05em;">Security Audit</strong>
            <span style="color:#059669; font-weight:850; font-size:15px;">🟢 Active (Backend Guard Enabled)</span>
          </div>
          <div style="background:#f8fafc; padding:20px; border-radius:16px; border:1px solid #e2e8f0;">
            <strong style="color:#0f172a; display:block; margin-bottom:6px; font-size:13px; text-transform:uppercase; letter-spacing:0.05em;">Database Enforcement</strong>
            <span style="color:#059669; font-weight:850; font-size:15px;">🟢 Enforced (PENDING → APPROVED)</span>
          </div>
          <div style="background:#f8fafc; padding:20px; border-radius:16px; border:1px solid #e2e8f0;">
            <strong style="color:#0f172a; display:block; margin-bottom:6px; font-size:13px; text-transform:uppercase; letter-spacing:0.05em;">Notifications Engine</strong>
            <span style="color:#059669; font-weight:850; font-size:15px;">🟢 Connected (Appointment Bell API)</span>
          </div>
        </div>
      </div>
    `;
  },

  logout() {
    localStorage.removeItem("pawsyncToken");
    window.location.href = "/frontend/auth/login/login.html";
  }
};

document.addEventListener("DOMContentLoaded", () => {
  PawSyncAdmin.init();
});
