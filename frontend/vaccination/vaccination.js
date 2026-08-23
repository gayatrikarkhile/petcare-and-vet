/* =========================================
   PAWSYNC - VACCINATION
   DYNAMIC PAGE JAVASCRIPT

   Shared Navbar + Sidebar:
   ../shared/js/shared.js

   Data source:
   GET  /api/pets
   GET  /api/vaccinations/:petId
   POST /api/vaccinations
========================================= */


/* =========================================
   STATE
========================================= */

let pets = [];

let vaccinations = [];

let selectedPetId = null;

let currentFilter = "all";

let calendarDate = new Date();
/* =========================================
   VACCINATION FROM ALERT
========================================= */

const alertVaccinationId =
    localStorage.getItem(
        "vaccinationId"
    );

/* =========================================
   PET FROM ALERT
========================================= */

const alertPetId =
    localStorage.getItem(
        "vaccinationPetId"
    );

/* =========================================
   API / AUTH HELPERS
========================================= */

const API_BASE = "/api";


function getAuthHeaders() {

    const headers = {
        "Content-Type": "application/json"
    };

    /*
        Your backend uses protect middleware.
        If the project stores JWT in localStorage,
        use it automatically. If JWT is stored in
        an HTTP-only cookie, credentials: "include"
        below handles it.
    */

const token = localStorage.getItem("pawsyncToken");

    if (token) {

        headers.Authorization =
            token.startsWith("Bearer ")
                ? token
                : `Bearer ${token}`;

    }

    return headers;
}


async function apiFetch(url, options = {}) {

    const requestOptions = {
        ...options,
        credentials: "include",
        headers: {
            ...getAuthHeaders(),
            ...(options.headers || {})
        }
    };

    const response =
        await fetch(url, requestOptions);

    let data = {};

    try {
        data = await response.json();
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

const petSelector =
    document.getElementById("petSelector");

const selectedPetText =
    document.getElementById("selectedPetText");

const vaccinationRecordList =
    document.getElementById("vaccinationRecordList");

const vaccinationEmpty =
    document.getElementById("vaccinationEmpty");

const upcomingVaccinationList =
    document.getElementById("upcomingVaccinationList");

const upToDateCount =
    document.getElementById("upToDateCount");

const dueSoonCount =
    document.getElementById("dueSoonCount");

const overdueCount =
    document.getElementById("overdueCount");

const totalVaccineCount =
    document.getElementById("totalVaccineCount");

const vaccineFilter =
    document.getElementById("vaccineFilter");

const calendarDays =
    document.getElementById("calendarDays");

const calendarMonthYear =
    document.getElementById("calendarMonthYear");

const previousMonth =
    document.getElementById("previousMonth");

const nextMonth =
    document.getElementById("nextMonth");

const openVaccineModal =
    document.getElementById("openVaccineModal");

const vaccineModal =
    document.getElementById("vaccineModal");

const closeVaccineModal =
    document.getElementById("closeVaccineModal");

const cancelVaccine =
    document.getElementById("cancelVaccine");

const vaccinationForm =
    document.getElementById("vaccinationForm");

const vaccinePet =
    document.getElementById("vaccinePet");

const vaccineName =
    document.getElementById("vaccineName");

const customVaccineGroup =
    document.getElementById("customVaccineGroup");

const customVaccine =
    document.getElementById("customVaccine");

const dateGiven =
    document.getElementById("dateGiven");

const nextDueDate =
    document.getElementById("nextDueDate");

const vaccineDoctor =
    document.getElementById("vaccineDoctor");

const vaccineNotes =
    document.getElementById("vaccineNotes");

const enableReminder =
    document.getElementById("enableReminder");


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener("DOMContentLoaded", async () => {

    setupVaccineFilter();

    setupCalendarControls();

    setupModal();

    setupVaccinationForm();

    setupCustomVaccine();

    await loadPets();

});


/* =========================================
   LOAD PETS FROM DATABASE
========================================= */

async function loadPets() {

    try {

        showLoadingState();


        const data =
            await apiFetch(
                `${API_BASE}/pets`
            );


        pets =
            Array.isArray(data.pets)
                ? data.pets
                : [];


        /* =====================================
           NO PETS
        ====================================== */

        if (pets.length === 0) {

            selectedPetId = null;

            renderPetSelector();

            populatePetSelect();

            updateSelectedPet();

            updateSummary();

            renderUpcomingVaccinations();

            renderCalendar();

            return;
        }


        /* =====================================
           SELECT PET
        ====================================== */

        /*
            If the user came here by clicking
            a vaccination alert, alerts.js
            stored the pet ID in localStorage.

            Example:

            vaccinationPetId = "6a7f2e..."

            We use that ID to automatically
            select the correct pet.
        */

        const storedPetId =
            localStorage.getItem(
                "vaccinationPetId"
            );


        /*
            Find the pet from the database
            using its MongoDB _id.
        */

        if (storedPetId) {

            const alertPet =
                pets.find(
                    pet =>
                        String(pet._id) ===
                        String(storedPetId)
                );


            /*
                If the pet from the alert
                exists, select that pet.
            */

            if (alertPet) {

                selectedPetId =
                    alertPet._id;

            } else {

                /*
                    If the pet cannot be found,
                    fall back to the first pet.
                */

                selectedPetId =
                    pets[0]._id;

            }

        } else {

            /*
                Normal visit to vaccination page:
                select the first pet.
            */

            selectedPetId =
                pets[0]._id;

        }


        /* =====================================
           DISPLAY SELECTED PET
        ====================================== */

        renderPetSelector();

        populatePetSelect();

        updateSelectedPet();


        /* =====================================
           LOAD VACCINATIONS FOR SELECTED PET
        ====================================== */

        await loadVaccinationsForPet(
            selectedPetId
        );


        /* =====================================
           REMOVE TEMPORARY ALERT DATA
        ====================================== */

        localStorage.removeItem(
            "vaccinationPetId"
        );

        localStorage.removeItem(
            "vaccinationId"
        );


        /* =====================================
           UPDATE PAGE
        ====================================== */

        updateSummary();

        renderUpcomingVaccinations();

        renderCalendar();


    } catch (error) {

        console.error(
            "Error loading pets:",
            error
        );


        showPageError(
            "Unable to load your pets. Please make sure you are logged in."
        );

    }

}

/* =========================================
   LOAD VACCINATIONS FOR ONE PET
========================================= */

async function loadVaccinationsForPet(
    petId
) {

    if (!petId) {

        vaccinations = [];

        renderVaccinationRecords();

        updateSummary();

        return;

    }

    try {

        const data =
            await apiFetch(
                `${API_BASE}/vaccinations/${encodeURIComponent(petId)}`
            );

        vaccinations =
            Array.isArray(data.vaccinations)
                ? data.vaccinations
                : [];

        renderVaccinationRecords();

        updateSummary();

        renderUpcomingVaccinations();

        renderCalendar();

    } catch (error) {

        console.error(
            "Error loading vaccinations:",
            error
        );

        vaccinations = [];

        renderVaccinationRecords();

        updateSummary();

        renderUpcomingVaccinations();

        renderCalendar();

        showPageError(
            "Unable to load vaccination records."
        );

    }

}


/* =========================================
   RENDER PET SELECTOR
========================================= */

function renderPetSelector() {

    if (!petSelector) {
        return;
    }

    petSelector.innerHTML = "";

    if (pets.length === 0) {

        petSelector.innerHTML = `
            <div class="vaccination-empty">
                <div class="empty-icon">🐾</div>
                <h3>No pets found</h3>
                <p>Add a pet to start managing vaccinations.</p>
            </div>
        `;

        return;
    }

    pets.forEach(pet => {

        const card =
            document.createElement("button");

        card.type = "button";

        card.className =
            "pet-selector-card";

        if (
            String(pet._id) ===
            String(selectedPetId)
        ) {

            card.classList.add("active");

        }

        const image =
            pet.petPhoto ||
            getDefaultPetImage(pet.species);

        const age =
            calculateAge(pet.dateOfBirth);

        card.innerHTML = `

            <div class="pet-selector-image">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(
                        pet.petName || "Pet"
                    )}"
                    onerror="this.src='${getDefaultPetImage(pet.species)}'"
                >

            </div>

            <div class="pet-selector-info">

                <h3>
                    ${escapeHTML(
                        pet.petName || "Unnamed Pet"
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        pet.breed || pet.species || "Pet"
                    )}
                    ${
                        age
                            ? ` • ${escapeHTML(age)}`
                            : ""
                    }
                </p>

            </div>

        `;

        card.addEventListener("click", async () => {

            selectedPetId = pet._id;

            currentFilter = "all";

            if (vaccineFilter) {
                vaccineFilter.value = "all";
            }

            renderPetSelector();

            populatePetSelect();

            updateSelectedPet();

            await loadVaccinationsForPet(
                selectedPetId
            );

        });

        petSelector.appendChild(card);

    });

}


/* =========================================
   POPULATE PET SELECT IN MODAL
========================================= */

function populatePetSelect() {

    if (!vaccinePet) {
        return;
    }

    vaccinePet.innerHTML = `
        <option value="">
            Select a pet
        </option>
    `;

    pets.forEach(pet => {

        const option =
            document.createElement("option");

        option.value =
            pet._id;

        option.textContent =
            pet.petName || "Unnamed Pet";

        vaccinePet.appendChild(option);

    });

    if (selectedPetId) {

        vaccinePet.value =
            selectedPetId;

    }

}


/* =========================================
   UPDATE SELECTED PET
========================================= */

function updateSelectedPet() {

    const pet =
        pets.find(
            item =>
                String(item._id) ===
                String(selectedPetId)
        );

    if (!pet) {

        if (selectedPetText) {

            selectedPetText.textContent =
                "Select a pet to view records.";

        }

        renderVaccinationRecords();

        return;

    }

    if (selectedPetText) {

        selectedPetText.textContent =
            `${pet.petName || "Pet"} • ${
                pet.breed ||
                pet.species ||
                "Pet"
            }`;

    }

    if (vaccinePet) {

        vaccinePet.value =
            selectedPetId;

    }

    renderVaccinationRecords();

}


/* =========================================
   GET VACCINATION STATUS
========================================= */

function getVaccinationStatus(
    vaccination
) {

    const today =
        startOfDay(new Date());

    const dueDate =
        parseLocalDate(vaccination.nextDue);

    if (Number.isNaN(dueDate.getTime())) {
        return "up-to-date";
    }

    const difference =
        differenceInDays(
            today,
            dueDate
        );

    if (difference > 0) {
        return "overdue";
    }

    if (difference >= -30) {
        return "due-soon";
    }

    return "up-to-date";

}


/* =========================================
   RENDER VACCINATION RECORDS
========================================= */

function renderVaccinationRecords() {

    if (!vaccinationRecordList) {
        return;
    }

    let records =
        vaccinations.filter(
            vaccination =>
                String(vaccination.petId) ===
                String(selectedPetId)
        );

    if (currentFilter !== "all") {

        records =
            records.filter(
                vaccination =>
                    getVaccinationStatus(
                        vaccination
                    ) === currentFilter
            );

    }

    vaccinationRecordList.innerHTML = "";

    if (records.length === 0) {

        if (vaccinationEmpty) {
            vaccinationEmpty.hidden = false;
        }

        return;

    }

    if (vaccinationEmpty) {
        vaccinationEmpty.hidden = true;
    }

    records.sort(
        (first, second) =>
            parseLocalDate(first.nextDue) -
            parseLocalDate(second.nextDue)
    );

    records.forEach(vaccination => {

        vaccinationRecordList.appendChild(
            createVaccinationRecord(
                vaccination
            )
        );

    });

}


/* =========================================
   CREATE VACCINATION RECORD
========================================= */

function createVaccinationRecord(
    vaccination
) {

    const element =
        document.createElement("div");

    const status =
        getVaccinationStatus(
            vaccination
        );

    element.className =
    "vaccination-record";


/*
    If this is the vaccination that the
    user clicked from Alerts, highlight it.
*/

if (
    alertVaccinationId &&
    String(vaccination._id) ===
        String(alertVaccinationId)
) {

    element.classList.add(
        "alert-selected-vaccination"
    );

    element.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}

    element.innerHTML = `

        <div class="vaccine-icon">
            💉
        </div>

        <div class="vaccine-record-info">

            <h3>
                ${escapeHTML(
                    vaccination.vaccine ||
                    "Vaccination"
                )}
            </h3>

            <p>
                ${escapeHTML(
                    vaccination.doctor ||
                    "Doctor not specified"
                )}
            </p>

            <div class="vaccine-record-meta">

                <span>
                    Given:
                    ${formatDate(
                        vaccination.dateGiven
                    )}
                </span>

                <span>
                    Next:
                    ${formatDate(
                        vaccination.nextDue
                    )}
                </span>

            </div>

        </div>

        <span class="vaccine-status ${status}">
            ${getStatusLabel(status)}
        </span>

    `;

    return element;

}


/* =========================================
   STATUS LABEL
========================================= */

function getStatusLabel(status) {

    const labels = {

        "up-to-date":
            "Up to Date",

        "due-soon":
            "Due Soon",

        "overdue":
            "Overdue"

    };

    return (
        labels[status] ||
        "Unknown"
    );

}


/* =========================================
   UPDATE SUMMARY
========================================= */

function updateSummary() {

    const selectedRecords =
        vaccinations.filter(
            vaccination =>
                String(vaccination.petId) ===
                String(selectedPetId)
        );

    let upToDate = 0;

    let dueSoon = 0;

    let overdue = 0;

    selectedRecords.forEach(vaccination => {

        const status =
            getVaccinationStatus(
                vaccination
            );

        if (status === "up-to-date") {
            upToDate++;
        }

        if (status === "due-soon") {
            dueSoon++;
        }

        if (status === "overdue") {
            overdue++;
        }

    });

    if (upToDateCount) {
        upToDateCount.textContent =
            upToDate;
    }

    if (dueSoonCount) {
        dueSoonCount.textContent =
            dueSoon;
    }

    if (overdueCount) {
        overdueCount.textContent =
            overdue;
    }

    if (totalVaccineCount) {
        totalVaccineCount.textContent =
            selectedRecords.length;
    }

}


/* =========================================
   UPCOMING VACCINATIONS
   Shows reminders for all owner's pets.
========================================= */

function renderUpcomingVaccinations() {

    if (!upcomingVaccinationList) {
        return;
    }

    const upcoming =
        vaccinations
            .filter(
                vaccination =>
                    vaccination.reminder === true
            )
            .filter(
                vaccination =>
                    getVaccinationStatus(
                        vaccination
                    ) !== "overdue"
            )
            .sort(
                (first, second) =>
                    parseLocalDate(first.nextDue) -
                    parseLocalDate(second.nextDue)
            )
            .slice(0, 5);

    upcomingVaccinationList.innerHTML = "";

    if (upcoming.length === 0) {

        upcomingVaccinationList.innerHTML = `

            <div class="vaccination-empty">

                <div class="empty-icon">
                    📅
                </div>

                <h3>
                    No upcoming reminders
                </h3>

                <p>
                    You are all caught up.
                </p>

            </div>

        `;

        return;
    }

    upcoming.forEach(vaccination => {

        const pet =
            pets.find(
                item =>
                    String(item._id) ===
                    String(vaccination.petId)
            );

        const date =
            parseLocalDate(
                vaccination.nextDue
            );

        const element =
            document.createElement("div");

        element.className =
            "upcoming-vaccination";

        element.innerHTML = `

            <div class="upcoming-date">

                <strong>
                    ${date.getDate()}
                </strong>

                <span>
                    ${date.toLocaleDateString(
                        "en-IN",
                        {
                            month: "short"
                        }
                    )}
                </span>

            </div>

            <div class="upcoming-info">

                <h3>
                    ${escapeHTML(
                        vaccination.vaccine ||
                        "Vaccination"
                    )}
                </h3>

                <p>
                    ${
                        pet
                            ? escapeHTML(
                                pet.petName ||
                                "Pet"
                            )
                            : "Pet"
                    }
                    •
                    ${formatDate(
                        vaccination.nextDue
                    )}
                </p>

            </div>

        `;

        upcomingVaccinationList.appendChild(
            element
        );

    });

}


/* =========================================
   VACCINE FILTER
========================================= */

function setupVaccineFilter() {

    if (!vaccineFilter) {
        return;
    }

    vaccineFilter.addEventListener(
        "change",
        () => {

            currentFilter =
                vaccineFilter.value;

            renderVaccinationRecords();

        }
    );

}


/* =========================================
   CALENDAR CONTROLS
========================================= */

function setupCalendarControls() {

    if (previousMonth) {

        previousMonth.addEventListener(
            "click",
            () => {

                calendarDate.setMonth(
                    calendarDate.getMonth() - 1
                );

                renderCalendar();

            }
        );

    }

    if (nextMonth) {

        nextMonth.addEventListener(
            "click",
            () => {

                calendarDate.setMonth(
                    calendarDate.getMonth() + 1
                );

                renderCalendar();

            }
        );

    }

}


/* =========================================
   RENDER CALENDAR
========================================= */

function renderCalendar() {

    if (!calendarDays) {
        return;
    }

    const year =
        calendarDate.getFullYear();

    const month =
        calendarDate.getMonth();

    const firstDay =
        new Date(year, month, 1);

    const lastDay =
        new Date(year, month + 1, 0);

    const daysInMonth =
        lastDay.getDate();

    const startingDay =
        firstDay.getDay();

    if (calendarMonthYear) {

        calendarMonthYear.textContent =
            calendarDate.toLocaleDateString(
                "en-IN",
                {
                    month: "long",
                    year: "numeric"
                }
            );

    }

    calendarDays.innerHTML = "";

    const previousLastDay =
        new Date(year, month, 0).getDate();

    for (
        let index = startingDay - 1;
        index >= 0;
        index--
    ) {

        const dayNumber =
            previousLastDay - index;

        calendarDays.appendChild(
            createCalendarDay(
                dayNumber,
                true
            )
        );

    }

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        calendarDays.appendChild(
            createCalendarDay(
                day,
                false
            )
        );

    }

    const totalCells =
        calendarDays.children.length;

    const remainingCells =
        totalCells % 7 === 0
            ? 0
            : 7 - (totalCells % 7);

    for (
        let day = 1;
        day <= remainingCells;
        day++
    ) {

        calendarDays.appendChild(
            createCalendarDay(
                day,
                true
            )
        );

    }

}


/* =========================================
   CREATE CALENDAR DAY
========================================= */

function createCalendarDay(
    dayNumber,
    otherMonth
) {

    const cell =
        document.createElement("div");

    cell.className =
        "calendar-day";

    if (otherMonth) {
        cell.classList.add("other-month");
    }

    const number =
        document.createElement("span");

    number.className =
        "calendar-day-number";

    number.textContent =
        dayNumber;

    cell.appendChild(number);

    if (!otherMonth) {

        const year =
            calendarDate.getFullYear();

        const month =
            calendarDate.getMonth();

        const date =
            new Date(
                year,
                month,
                dayNumber
            );

        if (
            isSameDate(
                date,
                new Date()
            )
        ) {

            cell.classList.add("today");

        }

        const dayVaccinations =
            vaccinations.filter(
                vaccination => {

                    if (
                        vaccination.reminder !==
                        true
                    ) {

                        return false;

                    }

                    const dueDate =
                        parseLocalDate(
                            vaccination.nextDue
                        );

                    return (
                        dueDate.getFullYear() ===
                            year &&
                        dueDate.getMonth() ===
                            month &&
                        dueDate.getDate() ===
                            dayNumber
                    );

                }
            );

        dayVaccinations.forEach(
            vaccination => {

                cell.appendChild(
                    createCalendarEvent(
                        vaccination
                    )
                );

            }
        );

    }

    return cell;

}


/* =========================================
   CREATE CALENDAR EVENT
========================================= */

function createCalendarEvent(
    vaccination
) {

    const event =
        document.createElement("div");

    const status =
        getVaccinationStatus(
            vaccination
        );

    const pet =
        pets.find(
            item =>
                String(item._id) ===
                String(vaccination.petId)
        );

    event.className =
        "calendar-event";

    if (status === "due-soon") {
        event.classList.add("due-soon");
    }

    if (status === "overdue") {
        event.classList.add("overdue");
    }

    const petName =
        pet
            ? pet.petName || "Pet"
            : "Pet";

    const vaccineName =
        vaccination.vaccine ||
        "Vaccination";

    event.textContent =
        `💉 ${petName} • ${vaccineName}`;

    event.title =
        `${vaccineName} - ${petName}\n` +
        `Due: ${formatDate(
            vaccination.nextDue
        )}`;

    event.addEventListener(
        "click",
        eventObject => {

            eventObject.stopPropagation();

            showVaccinationDetails(
                vaccination
            );

        }
    );

    return event;

}


/* =========================================
   SHOW VACCINATION DETAILS
========================================= */

function showVaccinationDetails(
    vaccination
) {

    const pet =
        pets.find(
            item =>
                String(item._id) ===
                String(vaccination.petId)
        );

    alert(

        `Vaccination Reminder\n\n` +

        `Pet: ${
            pet
                ? pet.petName || "Unknown"
                : "Unknown"
        }\n` +

        `Vaccine: ${
            vaccination.vaccine ||
            "Vaccination"
        }\n` +

        `Due Date: ${
            formatDate(
                vaccination.nextDue
            )
        }\n` +

        `Doctor/Clinic: ${
            vaccination.doctor ||
            "Not specified"
        }`

    );

}


/* =========================================
   MODAL SETUP
========================================= */

function setupModal() {

    if (openVaccineModal) {

        openVaccineModal.addEventListener(
            "click",
            () => openModal()
        );

    }

    if (closeVaccineModal) {

        closeVaccineModal.addEventListener(
            "click",
            () => closeModal()
        );

    }

    if (cancelVaccine) {

        cancelVaccine.addEventListener(
            "click",
            () => closeModal()
        );

    }

    if (vaccineModal) {

        vaccineModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    vaccineModal
                ) {

                    closeModal();

                }

            }
        );

    }

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                vaccineModal &&
                !vaccineModal.hidden
            ) {

                closeModal();

            }

        }
    );

}


/* =========================================
   OPEN MODAL
========================================= */

function openModal() {

    if (!vaccineModal) {
        return;
    }

    if (pets.length === 0) {

        alert(
            "Please add a pet before adding a vaccination."
        );

        return;

    }

    if (vaccinePet) {

        vaccinePet.value =
            selectedPetId || "";

    }

    vaccineModal.hidden = false;

    document.body.style.overflow = "hidden";

}


/* =========================================
   CLOSE MODAL
========================================= */

function closeModal() {

    if (!vaccineModal) {
        return;
    }

    vaccineModal.hidden = true;

    document.body.style.overflow = "";

}


/* =========================================
   CUSTOM VACCINE
========================================= */

function setupCustomVaccine() {

    if (!vaccineName) {
        return;
    }

    vaccineName.addEventListener(
        "change",
        () => {

            if (
                vaccineName.value ===
                "Other"
            ) {

                customVaccineGroup.hidden =
                    false;

                if (customVaccine) {
                    customVaccine.required =
                        true;
                }

            } else {

                customVaccineGroup.hidden =
                    true;

                if (customVaccine) {

                    customVaccine.required =
                        false;

                    customVaccine.value =
                        "";

                }

            }

        }
    );

}


/* =========================================
   FORM SUBMISSION
   DYNAMIC POST TO MONGODB
========================================= */

function setupVaccinationForm() {

    if (!vaccinationForm) {
        return;
    }

    vaccinationForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const petId =
                vaccinePet.value;

            if (!petId) {

                alert(
                    "Please select a pet."
                );

                return;

            }

            const pet =
                pets.find(
                    item =>
                        String(item._id) ===
                        String(petId)
                );

            if (!pet) {

                alert(
                    "Selected pet was not found."
                );

                return;

            }

            let selectedVaccine =
                vaccineName.value;

            if (
                selectedVaccine ===
                "Other"
            ) {

                selectedVaccine =
                    customVaccine.value.trim();

                if (!selectedVaccine) {

                    alert(
                        "Please enter the vaccine name."
                    );

                    return;

                }

            }

            const givenDate =
                dateGiven.value;

            const dueDate =
                nextDueDate.value;

            if (
                !givenDate ||
                !dueDate
            ) {

                alert(
                    "Please select both dates."
                );

                return;

            }

            if (
                parseLocalDate(dueDate) <
                parseLocalDate(givenDate)
            ) {

                alert(
                    "Next due date cannot be before the date given."
                );

                return;

            }

            const payload = {

                petId: petId,

                vaccine:
                    selectedVaccine,

                dateGiven:
                    givenDate,

                nextDue:
                    dueDate,

                doctor:
                    vaccineDoctor.value.trim() ||
                    "Not specified",

                notes:
                    vaccineNotes.value.trim(),

                reminder:
                    enableReminder
                        ? enableReminder.checked
                        : true

            };

            const saveButton =
                vaccinationForm.querySelector(
                    ".save-vaccine-button"
                );

            const originalText =
                saveButton
                    ? saveButton.textContent
                    : "Save Vaccination";

            try {

                if (saveButton) {

                    saveButton.disabled =
                        true;

                    saveButton.textContent =
                        "Saving...";

                }

                const data =
                    await apiFetch(
                        `${API_BASE}/vaccinations`,
                        {
                            method: "POST",
                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );

                /*
                    The backend returns the saved
                    MongoDB vaccination document.
                */

                if (
                    data.vaccination
                ) {

                    vaccinations.push(
                        data.vaccination
                    );

                }

                selectedPetId =
                    petId;

                currentFilter =
                    "all";

                if (vaccineFilter) {
                    vaccineFilter.value =
                        "all";
                }

                renderPetSelector();

                populatePetSelect();

                updateSelectedPet();

                updateSummary();

                renderUpcomingVaccinations();

                renderCalendar();

                vaccinationForm.reset();

                if (customVaccineGroup) {
                    customVaccineGroup.hidden =
                        true;
                }

                if (customVaccine) {
                    customVaccine.required =
                        false;
                }

                if (vaccinePet) {
                    vaccinePet.value =
                        selectedPetId;
                }

                closeModal();

                alert(
                    data.message ||
                    "Vaccination saved successfully."
                );

            } catch (error) {

                console.error(
                    "Save vaccination error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to save vaccination."
                );

            } finally {

                if (saveButton) {

                    saveButton.disabled =
                        false;

                    saveButton.textContent =
                        originalText;

                }

            }

        }
    );

}


/* =========================================
   DATE HELPERS
========================================= */

function parseLocalDate(
    value
) {

    if (!value) {
        return new Date(NaN);
    }

    /*
        MongoDB returns ISO dates such as:
        2027-08-10T00:00:00.000Z

        We only need the YYYY-MM-DD part
        and create a local date to avoid
        timezone shifting.
    */

    const dateString =
        String(value).slice(0, 10);

    const parts =
        dateString
            .split("-")
            .map(Number);

    if (
        parts.length !== 3 ||
        parts.some(
            number => Number.isNaN(number)
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


/* =========================================
   START OF DAY
========================================= */

function startOfDay(date) {

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

}


/* =========================================
   DIFFERENCE IN DAYS
========================================= */

function differenceInDays(
    firstDate,
    secondDate
) {

    const first =
        startOfDay(
            firstDate
        ).getTime();

    const second =
        startOfDay(
            secondDate
        ).getTime();

    return Math.round(
        (
            first - second
        ) /
        (
            1000 *
            60 *
            60 *
            24
        )
    );

}


/* =========================================
   SAME DATE
========================================= */

function isSameDate(
    first,
    second
) {

    return (

        first.getFullYear() ===
            second.getFullYear()

        &&

        first.getMonth() ===
            second.getMonth()

        &&

        first.getDate() ===
            second.getDate()

    );

}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(
    dateValue
) {

    if (!dateValue) {
        return "";
    }

    const date =
        parseLocalDate(
            dateValue
        );

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================
   CALCULATE PET AGE
========================================= */

function calculateAge(
    dateOfBirth
) {

    if (!dateOfBirth) {
        return "";
    }

    const birthDate =
        parseLocalDate(
            dateOfBirth
        );

    if (Number.isNaN(birthDate.getTime())) {
        return "";
    }

    const today =
        new Date();

    let years =
        today.getFullYear() -
        birthDate.getFullYear();

    let months =
        today.getMonth() -
        birthDate.getMonth();

    if (
        months < 0 ||
        (
            months === 0 &&
            today.getDate() <
                birthDate.getDate()
        )
    ) {

        years--;

        months += 12;

    }

    if (years > 0) {
        return `${years} Year${years === 1 ? "" : "s"}`;
    }

    return `${Math.max(months, 0)} Month${months === 1 ? "" : "s"}`;

}


/* =========================================
   DEFAULT PET IMAGE
========================================= */

function getDefaultPetImage(
    species
) {

    const value =
        String(
            species || ""
        ).toLowerCase();

    if (value.includes("cat")) {

        return "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=300&q=80";

    }

    if (value.includes("bird") || value.includes("parrot")) {

        return "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=300&q=80";

    }

    return "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80";

}


/* =========================================
   LOADING STATE
========================================= */

function showLoadingState() {

    if (petSelector) {

        petSelector.innerHTML = `
            <div class="vaccination-empty">
                <div class="empty-icon">🐾</div>
                <h3>Loading pets...</h3>
                <p>Please wait.</p>
            </div>
        `;

    }

}


/* =========================================
   ERROR MESSAGE
========================================= */

function showPageError(
    message
) {

    console.error(message);

    /*
        Keep the existing layout untouched.
        Show the message through the existing
        empty-state area when possible.
    */

    if (
        vaccinationRecordList &&
        vaccinations.length === 0
    ) {

        vaccinationRecordList.innerHTML = `
            <div class="vaccination-empty">
                <div class="empty-icon">⚠️</div>
                <h3>Unable to load data</h3>
                <p>${escapeHTML(message)}</p>
            </div>
        `;

    }

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(
    value
) {

    const element =
        document.createElement("div");

    element.textContent =
        value == null
            ? ""
            : String(value);

    return element.innerHTML;

}
/* =========================================
   SELECT PET FROM ALERT
========================================= */

function selectPetFromAlert() {

    const storedPetId =
        localStorage.getItem("vaccinationPetId");

    // If the page was not opened from an alert,
    // do nothing.
    if (!storedPetId) {
        return;
    }

    // Find the pet whose ID came from the alert
    const pet =
        pets.find(
            item =>
                String(item.id) ===
                String(storedPetId)
        );

    // Pet was not found
    if (!pet) {

        console.warn(
            "Pet from alert was not found:",
            storedPetId
        );

        return;
    }

    // Select this pet
    selectedPetId = pet.id;

    // Show this pet as selected
    renderPetSelector();

    // Load/show this pet's vaccination records
    updateSelectedPet();

    // Remove the temporary ID
    // so it doesn't keep selecting this pet
    localStorage.removeItem(
        "vaccinationPetId"
    );
}