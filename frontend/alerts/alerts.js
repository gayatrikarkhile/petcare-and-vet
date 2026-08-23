/* =========================================
   PAWSYNC - DYNAMIC ALERTS
   Vaccination alerts are loaded from MongoDB
========================================= */

let alerts = [];

let currentFilter = "all";

const API_BASE = "/api";


/* =========================================
   AUTHENTICATION
========================================= */

function getAuthHeaders() {

    const token =
        localStorage.getItem("pawsyncToken");

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }

    return headers;
}


/* =========================================
   API HELPER
========================================= */

async function apiFetch(
    url,
    options = {}
) {

    const response =
        await fetch(url, {

            ...options,

            credentials: "include",

            headers: {

                ...getAuthHeaders(),

                ...(options.headers || {})

            }

        });


    let data = {};

    try {

        data =
            await response.json();

    } catch (error) {

        data = {};

    }


    if (!response.ok) {

        throw new Error(

            data.message ||

            `Request failed with status ${response.status}`

        );

    }


    return data;

}


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
    async () => {

        setupFilters();

        setupMarkAllRead();

        setupVaccinationDetailsModal();

        await loadVaccinationAlerts();

    }
);


/* =========================================
   LOAD REAL VACCINATION ALERTS
========================================= */

async function loadVaccinationAlerts() {

    try {

        alerts = [];

        /* Fetch real vet notifications */
        try {
            const notifRes = await apiFetch(`${API_BASE}/notifications`);
            if (notifRes && Array.isArray(notifRes.notifications)) {
                notifRes.notifications.forEach(n => {
                    alerts.push({
                        id: `notif-${n._id}`,
                        title: n.title,
                        message: n.message,
                        type: n.type.includes("accepted") ? "appointment" : (n.type.includes("rejected") ? "important" : "reminder"),
                        category: n.type.includes("accepted") ? "appointment" : "reminder",
                        icon: n.title.includes("Confirmed") || n.title.includes("Verified") ? "🟢" : (n.title.includes("Rejected") ? "🔴" : "🔔"),
                        date: new Date(n.createdAt).toLocaleDateString(),
                        time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        unread: !n.isRead
                    });
                });
            }
        } catch (e) {
            console.error("Could not fetch vet notifications for owner:", e);
        }

        const petData =
            await apiFetch(
                `${API_BASE}/pets`
            );


        const pets =
            Array.isArray(
                petData.pets
            )
                ? petData.pets
                : [];


        alerts = [];


        /*
            Get vaccination records
            for every pet.
        */

        for (
            const pet of pets
        ) {

            try {

                const vaccinationData =
                    await apiFetch(
                        `${API_BASE}/vaccinations/${pet._id}`
                    );


                const vaccinations =
                    Array.isArray(
                        vaccinationData.vaccinations
                    )
                        ? vaccinationData.vaccinations
                        : [];


                vaccinations.forEach(
                    vaccination => {

                        const status =
                            getVaccinationStatus(
                                vaccination.nextDue
                            );


                        /*
                            Create alerts for:
                            Due Soon
                            Overdue
                        */

                        if (

                            status === "due-soon"

                            ||

                            status === "overdue"

                        ) {

                            alerts.push(

                                createVaccinationAlert(

                                    pet,

                                    vaccination,

                                    status

                                )

                            );

                        }

                    }
                );


            } catch (error) {

                console.error(

                    `Unable to load vaccinations for ${
                        pet.petName ||
                        "pet"
                    }:`,
                    error

                );

            }

        }


        /*
            Sort:
            Overdue first
            Then due dates
        */

        alerts.sort(

            (first, second) => {

                if (

                    first.category === "important"

                    &&

                    second.category !== "important"

                ) {

                    return -1;

                }


                if (

                    first.category !== "important"

                    &&

                    second.category === "important"

                ) {

                    return 1;

                }


                return (

                    parseLocalDate(
                        first.rawDueDate
                    )

                    -

                    parseLocalDate(
                        second.rawDueDate
                    )

                );

            }

        );


        renderAlerts();

        updateSummaryCounts();


    } catch (error) {

        console.error(
            "Unable to load alerts:",
            error
        );


        alerts = [];

        renderAlerts();

        updateSummaryCounts();

        showLoadError(
            error.message
        );

    }

}


/* =========================================
   VACCINATION STATUS
========================================= */

function getVaccinationStatus(
    nextDue
) {

    const today =
        startOfDay(
            new Date()
        );


    const dueDate =
        parseLocalDate(
            nextDue
        );


    if (
        Number.isNaN(
            dueDate.getTime()
        )
    ) {

        return "up-to-date";

    }


    const difference =
        differenceInDays(
            today,
            dueDate
        );


    /*
        Date has already passed
    */

    if (
        difference > 0
    ) {

        return "overdue";

    }


    /*
        Due today or within
        next 30 days
    */

    if (
        difference >= -30
    ) {

        return "due-soon";

    }


    return "up-to-date";

}

/* =========================================
   CREATE VACCINATION ALERT
========================================= */

function createVaccinationAlert(

    pet,

    vaccination,

    status

) {

    const petName =
        pet.petName ||
        pet.name ||
        "Your pet";


    const vaccineName =
        vaccination.vaccine ||
        vaccination.vaccineName ||
        vaccination.name ||
        "Vaccination";


    const dueDate =
        formatDate(
            vaccination.nextDue
        );


    /*
        Store ALL vaccination information
        inside the alert.

        This is important because the
        popup needs these values.
    */

    const baseAlert = {

        id:
            `vaccination-${status}-${vaccination._id}`,

        pet:
            petName,

        petId:
            pet._id,

        vaccinationId:
            vaccination._id,

        vaccine:
            vaccineName,

        dateGiven:
            formatDate(
                vaccination.dateGiven
            ),

        rawDueDate:
            vaccination.nextDue,

        doctor:
            vaccination.doctor ||
            vaccination.doctorClinic ||
            vaccination.clinic ||
            "Not specified",

        notes:
            vaccination.notes ||
            "No additional notes.",

        unread:
            true

    };


    /* =====================================
       OVERDUE
    ====================================== */

    if (
        status === "overdue"
    ) {

        return {

            ...baseAlert,

            title:
                `${vaccineName} Vaccination Overdue`,

            message:
                `${petName}'s ${vaccineName} vaccination was due on ${dueDate}. Please record the vaccination once it has been completed.`,

            type:
                "important",

            category:
                "important",

            icon:
                "⚠️",

            date:
                dueDate,

            time:
                "Vaccination overdue"

        };

    }


    /* =====================================
       DUE SOON
    ====================================== */

    return {

        ...baseAlert,

        title:
            `${vaccineName} Vaccination Due Soon`,

        message:
            `${petName}'s ${vaccineName} vaccination is due on ${dueDate}.`,

        type:
            "reminder",

        category:
            "reminder",

        icon:
            "💉",

        date:
            dueDate,

        time:
            "Upcoming vaccination"

    };

}


/* =========================================
   DATE HELPERS
========================================= */

function parseLocalDate(
    value
) {

    if (!value) {

        return new Date(
            NaN
        );

    }


    const dateString =
        String(value)
            .slice(0, 10);


    const parts =
        dateString
            .split("-")
            .map(Number);


    if (

        parts.length !== 3

        ||

        parts.some(
            number =>
                Number.isNaN(
                    number
                )
        )

    ) {

        return new Date(value);

    }


    return new Date(

        parts[0],

        parts[1] - 1,

        parts[2]

    );

}


function startOfDay(
    date
) {

    return new Date(

        date.getFullYear(),

        date.getMonth(),

        date.getDate()

    );

}


function differenceInDays(

    firstDate,

    secondDate

) {

    return Math.round(

        (

            startOfDay(
                firstDate
            ).getTime()

            -

            startOfDay(
                secondDate
            ).getTime()

        )

        /

        (

            1000 *

            60 *

            60 *

            24

        )

    );

}


function formatDate(
    value
) {

    const date =
        parseLocalDate(
            value
        );


    if (

        Number.isNaN(
            date.getTime()
        )

    ) {

        return "Not available";

    }


    return date.toLocaleDateString(

        "en-IN",

        {

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"

        }

    );

}


/* =========================================
   RENDER ALERTS
========================================= */

function renderAlerts() {

    if (!alertsList) {

        return;

    }


    const filteredAlerts =
        getFilteredAlerts();


    alertsList.innerHTML =
        "";


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

        return [
            ...alerts
        ];

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
                alert.category === "important"

        );

    }


    if (
        currentFilter === "reminder"
    ) {

        return alerts.filter(

            alert =>
                alert.category === "reminder"

        );

    }


    if (
        currentFilter === "appointment"
    ) {

        return alerts.filter(

            alert =>
                alert.category === "appointment"

        );

    }


    return [
        ...alerts
    ];

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


    element.classList.add(
        alert.unread
            ? "unread"
            : "read"
    );


    element.dataset.alertId =
        alert.id;


    element.innerHTML = `

        <div class="alert-icon ${getIconClass(alert)}">

            ${alert.icon}

        </div>


        <div class="alert-content">

            <div class="alert-title-row">

                <h3>
                    ${escapeHTML(
                        alert.title
                    )}
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
                ${escapeHTML(
                    alert.message
                )}
            </p>


            <div class="alert-meta">

                <span>
                    ${escapeHTML(
                        alert.pet
                    )}
                </span>


                <span>
                    ${escapeHTML(
                        alert.date
                    )}
                </span>


                <span>
                    ${escapeHTML(
                        alert.time
                    )}
                </span>


                <span
                    class="alert-badge ${alert.type}"
                >
                    ${getAlertTypeLabel(
                        alert.type
                    )}
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

                event.preventDefault();

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

                event.preventDefault();

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

        event => {

            event.preventDefault();

            event.stopPropagation();


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


    /*
        VERY IMPORTANT:
        Close createAlertElement properly.
    */

    return element;

}


/* =========================================
   ALERT ICON CLASS
========================================= */

function getIconClass(
    alert
) {

    if (
        alert.type === "important"
    ) {

        return "warning";

    }


    if (
        alert.type === "appointment"
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

        labels[type]

        ||

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

    renderAlerts();

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
                alert.category === "important"

        ).length;


    const reminders =
        alerts.filter(

            alert =>
                alert.category === "reminder"

        ).length;


    const appointments =
        alerts.filter(

            alert =>
                alert.category === "appointment"

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
        Vaccination alerts open
        the popup on THIS page.
    */

    if (

        alert.category !== "important"

        &&

        alert.category !== "reminder"

    ) {

        return;

    }


    openVaccinationDetails(
        alert
    );

}


/* =========================================
   OPEN VACCINATION DETAILS
========================================= */

function openVaccinationDetails(
    alert
) {

    const modal =
        document.getElementById(
            "vaccinationDetailsModal"
        );


    if (!modal) {

        console.error(
            "Vaccination details modal was not found."
        );

        return;

    }


    const vaccineName =
        document.getElementById(
            "detailsVaccineName"
        );


    const petName =
        document.getElementById(
            "detailsPetName"
        );


    const detailsPet =
        document.getElementById(
            "detailsPet"
        );


    const detailsVaccine =
        document.getElementById(
            "detailsVaccine"
        );


    const detailsDateGiven =
        document.getElementById(
            "detailsDateGiven"
        );


    const detailsNextDue =
        document.getElementById(
            "detailsNextDue"
        );


    const detailsDoctor =
        document.getElementById(
            "detailsDoctor"
        );


    const detailsNotes =
        document.getElementById(
            "detailsNotes"
        );


    const detailsStatus =
        document.getElementById(
            "detailsStatus"
        );


    /* =====================================
       FILL POPUP
    ====================================== */

    const vaccine =
        alert.vaccine ||
        getVaccineNameFromTitle(
            alert.title
        );


    if (vaccineName) {

        vaccineName.textContent =
            vaccine;

    }


    if (petName) {

        petName.textContent =
            alert.pet ||
            "Your pet";

    }


    if (detailsPet) {

        detailsPet.textContent =
            alert.pet ||
            "Your pet";

    }


    if (detailsVaccine) {

        detailsVaccine.textContent =
            vaccine;

    }


    if (detailsDateGiven) {

        detailsDateGiven.textContent =
            alert.dateGiven ||
            "Not available";

    }


    if (detailsNextDue) {

        detailsNextDue.textContent =
            alert.date ||
            "Not available";

    }


    if (detailsDoctor) {

        detailsDoctor.textContent =
            alert.doctor ||
            "Not available";

    }


    if (detailsNotes) {

        detailsNotes.textContent =
            alert.notes ||
            "No additional notes.";

    }


    if (detailsStatus) {

        const isOverdue =
            alert.category === "important";


        detailsStatus.textContent =
            isOverdue
                ? "Overdue"
                : "Due Soon";


        detailsStatus.className =
            "vaccination-details-status " +

            (
                isOverdue
                    ? "overdue"
                    : "due-soon"
            );

    }


    /*
        Store IDs for the next step.
    */

    if (alert.petId) {

        modal.dataset.petId =
            String(alert.petId);

    }


    if (alert.vaccinationId) {

        modal.dataset.vaccinationId =
            String(alert.vaccinationId);

    }


    /*
        Open popup.
    */

    modal.classList.add(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================
   EXTRACT VACCINE NAME
========================================= */

function getVaccineNameFromTitle(
    title
) {

    if (!title) {

        return "Vaccination";

    }


    return title

        .replace(
            " Vaccination Due Soon",
            ""
        )

        .replace(
            " Vaccination Overdue",
            ""
        )

        .trim();

}
/* =========================================
   CLOSE VACCINATION DETAILS
========================================= */

function closeVaccinationDetails() {

    const modal =
        document.getElementById(
            "vaccinationDetailsModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "modal-open"
    );

}


/* =========================================
   SETUP DETAILS MODAL
========================================= */

function setupVaccinationDetailsModal() {

    const closeButton =
        document.getElementById(
            "closeVaccinationDetails"
        );


    const overlay =
        document.getElementById(
            "vaccinationDetailsOverlay"
        );


    if (closeButton) {

        closeButton.addEventListener(

            "click",

            event => {

                event.preventDefault();

                closeVaccinationDetails();

            }

        );

    }


    if (overlay) {

        overlay.addEventListener(

            "click",

            event => {

                event.preventDefault();

                closeVaccinationDetails();

            }

        );

    }




    /*
        ESC key closes popup.
    */

    document.addEventListener(

        "keydown",

        event => {

            if (
                event.key === "Escape"
            ) {

                closeVaccinationDetails();

            }

        }

    );

        // =========================================
    // MARK VACCINATION AS COMPLETED
    // =========================================

    const completeButton =
        document.getElementById(
            "markVaccinationCompleted"
        );

    if (completeButton) {

        completeButton.addEventListener(
            "click",
            async event => {

                event.preventDefault();

                const modal =
                    document.getElementById(
                        "vaccinationDetailsModal"
                    );

                const vaccinationId =
                    modal?.dataset.vaccinationId;

                if (!vaccinationId) {

                    alert(
                        "Vaccination ID not found."
                    );

                    return;

                }

                try {

                    completeButton.disabled =
                        true;

                    completeButton.textContent =
                        "Marking as completed...";


                    const data =
                        await apiFetch(

                            `${API_BASE}/vaccinations/${vaccinationId}/complete`,

                            {
                                method: "PUT"
                            }

                        );


                    if (!data.success) {

                        throw new Error(
                            data.message ||
                            "Unable to complete vaccination."
                        );

                    }


                    // Close the popup
                    closeVaccinationDetails();


                    // Remove the completed vaccination
                    // from the current alerts
                    alerts =
                        alerts.filter(

                            alert =>
                                alert.vaccinationId !==
                                vaccinationId

                        );


                    updateSummaryCounts();

                    renderAlerts();


                    alert(
                        "Vaccination marked as completed successfully! ✓"
                    );


                } catch (error) {

                    console.error(
                        "Error completing vaccination:",
                        error
                    );


                    alert(
                        error.message ||
                        "Unable to mark vaccination as completed."
                    );


                } finally {

                    completeButton.disabled =
                        false;

                    completeButton.textContent =
                        "✓ Mark as Completed";

                }

            }
        );

    }

}


/* =========================================
   LOAD ERROR
========================================= */

function showLoadError(
    message
) {

    console.error(
        "Alerts could not be loaded:",
        message
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
        value == null
            ? ""
            : String(value);


    return div.innerHTML;

}