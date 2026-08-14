/* =========================================
   PAWSYNC - ALERTS
   PAGE-SPECIFIC JAVASCRIPT

   Shared Navbar + Sidebar:
   ../shared/js/shared.js
========================================= */


/* =========================================
   ALERT DATA
========================================= */

let alerts = [

    {
        id: 1,

        title: "Rabies Vaccination Due",

        message:
            "Bruno's rabies booster is due on 18 Aug. Please make sure the vaccination is completed on time.",

        pet: "Bruno",

        type: "important",

        category: "important",

        icon: "💉",

        date: "18 Aug",

        time: "2 days ago",

        unread: true
    },


    {
        id: 2,

        title: "Vet Appointment Upcoming",

        message:
            "Bruno has a general health checkup scheduled with Dr. Sharma on 23 Aug at 10:00 AM.",

        pet: "Bruno",

        type: "appointment",

        category: "appointment",

        icon: "👨‍⚕️",

        date: "23 Aug",

        time: "3 hours ago",

        unread: true
    },


    {
        id: 3,

        title: "Grooming Reminder",

        message:
            "Kitty's grooming session is scheduled for 20 Aug.",

        pet: "Kitty",

        type: "reminder",

        category: "reminder",

        icon: "✂️",

        date: "20 Aug",

        time: "5 hours ago",

        unread: true
    },


    {
        id: 4,

        title: "Health Checkup Reminder",

        message:
            "Coco's regular health checkup is coming up on 26 Aug.",

        pet: "Coco",

        type: "reminder",

        category: "reminder",

        icon: "🩺",

        date: "26 Aug",

        time: "Yesterday",

        unread: true
    },


    {
        id: 5,

        title: "Vaccination Record Updated",

        message:
            "Kitty's vaccination record has been successfully updated in Medical Vault.",

        pet: "Kitty",

        type: "reminder",

        category: "reminder",

        icon: "💉",

        date: "05 Aug",

        time: "2 days ago",

        unread: false
    },


    {
        id: 6,

        title: "Activity Level Needs Attention",

        message:
            "Bruno's average activity has decreased compared with the previous week.",

        pet: "Bruno",

        type: "important",

        category: "important",

        icon: "🏃",

        date: "14 Aug",

        time: "3 days ago",

        unread: true
    },


    {
        id: 7,

        title: "Medical Document Added",

        message:
            "A new medical report was added to Coco's Medical Vault.",

        pet: "Coco",

        type: "reminder",

        category: "reminder",

        icon: "📄",

        date: "12 Aug",

        time: "4 days ago",

        unread: false
    },


    {
        id: 8,

        title: "Health Score Improved",

        message:
            "Kitty's health score has improved to 86/100. Keep following the current care routine.",

        pet: "Kitty",

        type: "reminder",

        category: "reminder",

        icon: "❤️",

        date: "10 Aug",

        time: "5 days ago",

        unread: false
    }

];


/* =========================================
   CURRENT FILTER
========================================= */

let currentFilter = "all";


/* =========================================
   DOM ELEMENTS
========================================= */

const alertsList =
    document.getElementById(
        "alertsList"
    );


const alertsEmpty =
    document.getElementById(
        "alertsEmpty"
    );


const importantCount =
    document.getElementById(
        "importantCount"
    );


const reminderCount =
    document.getElementById(
        "reminderCount"
    );


const appointmentCount =
    document.getElementById(
        "appointmentCount"
    );


const unreadCount =
    document.getElementById(
        "unreadCount"
    );


const markAllReadButton =
    document.getElementById(
        "markAllReadButton"
    );


const filterButtons =
    document.querySelectorAll(
        ".alert-filter"
    );


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderAlerts();

        updateSummaryCounts();

        setupFilters();

        setupMarkAllRead();

    }
);


/* =========================================
   RENDER ALERTS
========================================= */

function renderAlerts() {

    if (!alertsList) {
        return;
    }


    let filteredAlerts =
        getFilteredAlerts();


    alertsList.innerHTML = "";


    /* =====================================
       EMPTY STATE
    ====================================== */

    if (
        filteredAlerts.length === 0
    ) {

        if (alertsEmpty) {

            alertsEmpty.hidden =
                false;

        }

        return;

    }


    if (alertsEmpty) {

        alertsEmpty.hidden =
            true;

    }


    /* =====================================
       CREATE ALERT ITEMS
    ====================================== */

    filteredAlerts.forEach(
        alert => {

            const alertElement =
                createAlertElement(
                    alert
                );


            alertsList.appendChild(
                alertElement
            );

        }
    );

}


/* =========================================
   GET FILTERED ALERTS
========================================= */

function getFilteredAlerts() {

    if (
        currentFilter === "all"
    ) {

        return [...alerts];

    }


    if (
        currentFilter === "unread"
    ) {

        return alerts.filter(
            alert =>
                alert.unread === true
        );

    }


    if (
        currentFilter === "important"
    ) {

        return alerts.filter(
            alert =>
                alert.category ===
                "important"
        );

    }


    if (
        currentFilter === "reminder"
    ) {

        return alerts.filter(
            alert =>
                alert.category ===
                "reminder"
        );

    }


    return [...alerts];

}


/* =========================================
   CREATE ALERT ELEMENT
========================================= */

function createAlertElement(
    alert
) {

    const element =
        document.createElement(
            "div"
        );


    element.className =
        "alert-item";


    if (alert.unread) {

        element.classList.add(
            "unread"
        );

    } else {

        element.classList.add(
            "read"
        );

    }


    element.dataset.alertId =
        alert.id;


    element.innerHTML = `

        <div class="alert-icon ${getIconClass(alert)}">
            ${alert.icon}
        </div>


        <div class="alert-content">

            <div class="alert-title-row">

                <h3>
                    ${escapeHTML(alert.title)}
                </h3>

                ${
                    alert.unread
                        ? `
                            <span
                                class="unread-dot"
                                aria-label="Unread"
                            ></span>
                          `
                        : ""
                }

            </div>


            <p>
                ${escapeHTML(alert.message)}
            </p>


            <div class="alert-meta">

                <span>
                    ${escapeHTML(alert.pet)}
                </span>

                <span>
                    ${escapeHTML(alert.date)}
                </span>

                <span>
                    ${escapeHTML(alert.time)}
                </span>


                <span class="alert-badge ${alert.type}">
                    ${getAlertTypeLabel(alert.type)}
                </span>

            </div>

        </div>


        <div class="alert-actions">

            <button
                type="button"
                class="alert-action-button mark-read-button"
                title="${
                    alert.unread
                        ? "Mark as read"
                        : "Mark as unread"
                }"
                data-alert-id="${alert.id}"
            >
                ${
                    alert.unread
                        ? "✓"
                        : "↺"
                }
            </button>


            <button
                type="button"
                class="alert-action-button delete-alert-button"
                title="Remove alert"
                data-alert-id="${alert.id}"
            >
                ×
            </button>

        </div>

    `;


    /* =====================================
       MARK READ BUTTON
    ====================================== */

    const markReadButton =
        element.querySelector(
            ".mark-read-button"
        );


    if (markReadButton) {

        markReadButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                toggleAlertRead(
                    alert.id
                );

            }
        );

    }


    /* =====================================
       DELETE BUTTON
    ====================================== */

    const deleteButton =
        element.querySelector(
            ".delete-alert-button"
        );


    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                removeAlert(
                    alert.id
                );

            }
        );

    }


    /* =====================================
       CLICK ALERT
    ====================================== */

    element.addEventListener(
        "click",
        () => {

            if (alert.unread) {

                markAlertAsRead(
                    alert.id
                );

            }


            handleAlertClick(
                alert
            );

        }
    );


    return element;

}


/* =========================================
   ALERT ICON CLASS
========================================= */

function getIconClass(
    alert
) {

    if (
        alert.type ===
        "important"
    ) {

        return "warning";

    }


    if (
        alert.type ===
        "appointment"
    ) {

        return "appointment";

    }


    if (
        alert.icon === "✂️"
    ) {

        return "grooming";

    }


    if (
        alert.icon === "🏃"
    ) {

        return "activity";

    }


    if (
        alert.icon === "🩺"
    ) {

        return "health";

    }


    return "vaccination";

}


/* =========================================
   ALERT TYPE LABEL
========================================= */

function getAlertTypeLabel(
    type
) {

    const labels = {

        important:
            "Important",

        reminder:
            "Reminder",

        appointment:
            "Appointment"

    };


    return (
        labels[type] ||
        "Alert"
    );

}


/* =========================================
   SETUP FILTERS
========================================= */

function setupFilters() {

    filterButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    filterButtons.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    currentFilter =
                        button.dataset.filter ||
                        "all";


                    renderAlerts();

                }
            );

        }
    );

}


/* =========================================
   MARK SINGLE ALERT AS READ
========================================= */

function markAlertAsRead(
    alertId
) {

    const alert =
        alerts.find(
            item =>
                item.id === alertId
        );


    if (!alert) {
        return;
    }


    alert.unread =
        false;


    updateSummaryCounts();

}


/* =========================================
   TOGGLE READ / UNREAD
========================================= */

function toggleAlertRead(
    alertId
) {

    const alert =
        alerts.find(
            item =>
                item.id === alertId
        );


    if (!alert) {
        return;
    }


    alert.unread =
        !alert.unread;


    updateSummaryCounts();

    renderAlerts();

}


/* =========================================
   MARK ALL READ
========================================= */

function setupMarkAllRead() {

    if (!markAllReadButton) {
        return;
    }


    markAllReadButton.addEventListener(
        "click",
        () => {

            alerts.forEach(
                alert => {

                    alert.unread =
                        false;

                }
            );


            updateSummaryCounts();

            renderAlerts();

        }
    );

}


/* =========================================
   REMOVE ALERT
========================================= */

function removeAlert(
    alertId
) {

    const alert =
        alerts.find(
            item =>
                item.id === alertId
        );


    if (!alert) {
        return;
    }


    const confirmed =
        confirm(
            `Remove "${alert.title}" from your alerts?`
        );


    if (!confirmed) {
        return;
    }


    alerts =
        alerts.filter(
            item =>
                item.id !== alertId
        );


    updateSummaryCounts();

    renderAlerts();

}


/* =========================================
   SUMMARY COUNTS
========================================= */

function updateSummaryCounts() {

    const important =
        alerts.filter(
            alert =>
                alert.category ===
                "important"
        ).length;


    const reminders =
        alerts.filter(
            alert =>
                alert.category ===
                "reminder"
        ).length;


    const appointments =
        alerts.filter(
            alert =>
                alert.category ===
                "appointment"
        ).length;


    const unread =
        alerts.filter(
            alert =>
                alert.unread === true
        ).length;


    if (importantCount) {

        importantCount.textContent =
            important;

    }


    if (reminderCount) {

        reminderCount.textContent =
            reminders;

    }


    if (appointmentCount) {

        appointmentCount.textContent =
            appointments;

    }


    if (unreadCount) {

        unreadCount.textContent =
            unread;

    }

}


/* =========================================
   ALERT CLICK
========================================= */

function handleAlertClick(
    alert
) {

    /*
        For now this is a static frontend.

        Later, each alert can navigate
        to its related page.

        Examples:

        Vaccination → vaccination.html
        Appointment → appointments.html
        Medical → medicalVault.html
        Grooming → grooming.html
        Activity → activity.html
    */


    console.log(
        "Alert clicked:",
        alert
    );

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value;


    return div.innerHTML;

}