/* =========================================================
   PAWSYNC APPOINTMENT NOTIFICATIONS CONTROLLER
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    loadNotifications();

    const markAllBtn = document.getElementById("markAllReadBtn");
    if (markAllBtn) {
        markAllBtn.addEventListener("click", markAllAsRead);
    }
});

async function loadNotifications() {
    const listEl = document.getElementById("notificationsList");
    if (!listEl) return;

    const token = localStorage.getItem("pawsyncToken");
    if (!token) {
        window.location.href = "/frontend/auth/login/login.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/notifications", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            listEl.innerHTML = `<div class="empty-notifications">
                <span>⚠️</span>
                <h3>Unable to load notifications</h3>
                <p>${data.message || "Please try refreshing the page."}</p>
            </div>`;
            return;
        }

        const notifications = data.notifications || [];

        if (notifications.length === 0) {
            listEl.innerHTML = `<div class="empty-notifications">
                <span>🔔</span>
                <h3>No appointment notifications</h3>
                <p>You have no pending or recent appointment notifications.</p>
            </div>`;
            return;
        }

        renderNotifications(notifications);

        if (window.updateNavbarNotificationBadge) {
            window.updateNavbarNotificationBadge();
        }

    } catch (error) {
        console.error("Error loading notifications:", error);
        listEl.innerHTML = `<div class="empty-notifications">
            <span>⚠️</span>
            <h3>Error connecting to server</h3>
            <p>Please check your internet connection.</p>
        </div>`;
    }
}

function renderNotifications(notifications) {
    const listEl = document.getElementById("notificationsList");
    listEl.innerHTML = "";

    notifications.forEach(item => {
        const div = document.createElement("div");
        div.className = `notification-item ${item.isRead ? "read" : "unread"}`;

        let icon = "🔔";
        let iconClass = "reminder";

        const type = (item.type || "").toLowerCase();
        if (type.includes("accepted") || type.includes("confirmed")) {
            icon = "🟢";
            iconClass = "accepted";
        } else if (type.includes("completed")) {
            icon = "🔵";
            iconClass = "completed";
        } else if (type.includes("rejected") || type.includes("cancelled")) {
            icon = "🔴";
            iconClass = "cancelled";
        }

        const formattedTime = formatTimestamp(item.createdAt);

        div.innerHTML = `
            <div class="notification-icon-wrap ${iconClass}">
                <span>${icon}</span>
            </div>
            <div class="notification-body">
                <div class="notification-title">
                    <span>${item.title || "Appointment Notification"}</span>
                </div>
                <div class="notification-message">${item.message}</div>
                <div class="notification-time">${formattedTime}</div>
            </div>
        `;

        div.addEventListener("click", () => {
            if (!item.isRead) {
                markAsRead(item._id, div);
            }
        });

        listEl.appendChild(div);
    });
}

function formatTimestamp(dateInput) {
    if (!dateInput) return "Recently";

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "Recently";

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
        return `Today • ${timeStr}`;
    } else if (isTomorrow) {
        return `Tomorrow • ${timeStr}`;
    } else {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const day = date.getDate();
        const month = monthNames[date.getMonth()];
        return `${day} ${month} • ${timeStr}`;
    }
}

async function markAsRead(id, element) {
    const token = localStorage.getItem("pawsyncToken");
    if (!token) return;

    try {
        const res = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (res.ok) {
            element.classList.remove("unread");
            element.classList.add("read");
            if (window.updateNavbarNotificationBadge) {
                window.updateNavbarNotificationBadge();
            }
        }
    } catch (err) {
        console.error("Error marking notification read:", err);
    }
}

async function markAllAsRead() {
    const token = localStorage.getItem("pawsyncToken");
    if (!token) return;

    try {
        const res = await fetch("http://localhost:5000/api/notifications/read-all", {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (res.ok) {
            loadNotifications();
        }
    } catch (err) {
        console.error("Error marking all read:", err);
    }
}
