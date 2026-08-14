/* =========================================
   PAWSYNC - VACCINATION
   PAGE-SPECIFIC JAVASCRIPT

   Shared Navbar + Sidebar:
   ../shared/js/shared.js
========================================= */


/* =========================================
   PET DATA
========================================= */

const pets = [

    {
        id: 1,
        name: "Bruno",
        breed: "Labrador Retriever",
        age: "2 Years",
        image:
            "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80"
    },

    {
        id: 2,
        name: "Kitty",
        breed: "Persian Cat",
        age: "3 Years",
        image:
            "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=300&q=80"
    },

    {
        id: 3,
        name: "Coco",
        breed: "Eclectus Parrot",
        age: "1 Year",
        image:
            "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=300&q=80"
    }

];


/* =========================================
   VACCINATION DATA
========================================= */

let vaccinations = [

    {
        id: 1,

        petId: 1,

        vaccine:
            "Rabies",

        dateGiven:
            "2025-08-18",

        nextDue:
            "2026-08-18",

        doctor:
            "Dr. Anjali Sharma",

        notes:
            "Annual rabies booster",

        reminder:
            true
    },


    {
        id: 2,

        petId: 1,

        vaccine:
            "DHPP",

        dateGiven:
            "2026-02-10",

        nextDue:
            "2027-02-10",

        doctor:
            "Dr. Anjali Sharma",

        notes:
            "DHPP booster",

        reminder:
            true
    },


    {
        id: 3,

        petId: 2,

        vaccine:
            "FVRCP",

        dateGiven:
            "2026-01-15",

        nextDue:
            "2027-01-15",

        doctor:
            "Dr. Neha Kulkarni",

        notes:
            "Annual FVRCP vaccination",

        reminder:
            true
    },


    {
        id: 4,

        petId: 2,

        vaccine:
            "FeLV",

        dateGiven:
            "2026-07-01",

        nextDue:
            "2026-08-25",

        doctor:
            "Dr. Neha Kulkarni",

        notes:
            "Follow-up dose",

        reminder:
            true
    },


    {
        id: 5,

        petId: 3,

        vaccine:
            "Parrot Polyomavirus",

        dateGiven:
            "2026-05-20",

        nextDue:
            "2026-09-20",

        doctor:
            "Dr. Priya Mehta",

        notes:
            "Annual vaccination",

        reminder:
            true
    }

];


/* =========================================
   STATE
========================================= */

let selectedPetId =
    pets.length > 0
        ? pets[0].id
        : null;


let currentFilter =
    "all";


let calendarDate =
    new Date();


/*
    Set calendar to current month.

    For the static demo we use the
    current browser month.
*/


/* =========================================
   DOM ELEMENTS
========================================= */

const petSelector =
    document.getElementById(
        "petSelector"
    );


const selectedPetText =
    document.getElementById(
        "selectedPetText"
    );


const vaccinationRecordList =
    document.getElementById(
        "vaccinationRecordList"
    );


const vaccinationEmpty =
    document.getElementById(
        "vaccinationEmpty"
    );


const upcomingVaccinationList =
    document.getElementById(
        "upcomingVaccinationList"
    );


const upToDateCount =
    document.getElementById(
        "upToDateCount"
    );


const dueSoonCount =
    document.getElementById(
        "dueSoonCount"
    );


const overdueCount =
    document.getElementById(
        "overdueCount"
    );


const totalVaccineCount =
    document.getElementById(
        "totalVaccineCount"
    );


const vaccineFilter =
    document.getElementById(
        "vaccineFilter"
    );


const calendarDays =
    document.getElementById(
        "calendarDays"
    );


const calendarMonthYear =
    document.getElementById(
        "calendarMonthYear"
    );


const previousMonth =
    document.getElementById(
        "previousMonth"
    );


const nextMonth =
    document.getElementById(
        "nextMonth"
    );


const openVaccineModal =
    document.getElementById(
        "openVaccineModal"
    );


const vaccineModal =
    document.getElementById(
        "vaccineModal"
    );


const closeVaccineModal =
    document.getElementById(
        "closeVaccineModal"
    );


const cancelVaccine =
    document.getElementById(
        "cancelVaccine"
    );


const vaccinationForm =
    document.getElementById(
        "vaccinationForm"
    );


const vaccinePet =
    document.getElementById(
        "vaccinePet"
    );


const vaccineName =
    document.getElementById(
        "vaccineName"
    );


const customVaccineGroup =
    document.getElementById(
        "customVaccineGroup"
    );


const customVaccine =
    document.getElementById(
        "customVaccine"
    );


const dateGiven =
    document.getElementById(
        "dateGiven"
    );


const nextDueDate =
    document.getElementById(
        "nextDueDate"
    );


const vaccineDoctor =
    document.getElementById(
        "vaccineDoctor"
    );


const vaccineNotes =
    document.getElementById(
        "vaccineNotes"
    );


const enableReminder =
    document.getElementById(
        "enableReminder"
    );


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderPetSelector();

        populatePetSelect();

        updateSelectedPet();

        updateSummary();

        renderUpcomingVaccinations();

        renderCalendar();

        setupVaccineFilter();

        setupCalendarControls();

        setupModal();

        setupVaccinationForm();

        setupCustomVaccine();

    }
);


/* =========================================
   RENDER PET SELECTOR
========================================= */

function renderPetSelector() {

    if (!petSelector) {
        return;
    }


    petSelector.innerHTML = "";


    pets.forEach(
        pet => {

            const card =
                document.createElement(
                    "button"
                );


            card.type =
                "button";


            card.className =
                "pet-selector-card";


            if (
                pet.id ===
                selectedPetId
            ) {

                card.classList.add(
                    "active"
                );

            }


            card.innerHTML = `

                <div class="pet-selector-image">

                    <img
                        src="${pet.image}"
                        alt="${escapeHTML(
                            pet.name
                        )}"
                    >

                </div>


                <div class="pet-selector-info">

                    <h3>
                        ${escapeHTML(
                            pet.name
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            pet.breed
                        )} •
                        ${escapeHTML(
                            pet.age
                        )}
                    </p>

                </div>

            `;


            card.addEventListener(
                "click",
                () => {

                    selectedPetId =
                        pet.id;


                    currentFilter =
                        "all";


                    if (vaccineFilter) {

                        vaccineFilter.value =
                            "all";

                    }


                    renderPetSelector();

                    updateSelectedPet();

                }
            );


            petSelector.appendChild(
                card
            );

        }
    );

}


/* =========================================
   POPULATE PET SELECT
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


    pets.forEach(
        pet => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                pet.id;


            option.textContent =
                pet.name;


            vaccinePet.appendChild(
                option
            );

        }
    );


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
                item.id ===
                selectedPetId
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
            `${pet.name} • ${pet.breed}`;

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
        startOfDay(
            new Date()
        );


    const dueDate =
        parseLocalDate(
            vaccination.nextDue
        );


    const difference =
        differenceInDays(
            today,
            dueDate
        );


    /*
        Already passed
        = Overdue
    */

    if (difference > 0) {

        return "overdue";

    }


    /*
        Due within 30 days
        = Due Soon
    */

    if (difference >= -30) {

        return "due-soon";

    }


    /*
        More than 30 days away
        = Up to Date
    */

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
                vaccination.petId ===
                selectedPetId
        );


    if (
        currentFilter !==
        "all"
    ) {

        records =
            records.filter(
                vaccination =>

                    getVaccinationStatus(
                        vaccination
                    ) ===
                    currentFilter
            );

    }


    vaccinationRecordList.innerHTML =
        "";


    if (
        records.length === 0
    ) {

        if (vaccinationEmpty) {

            vaccinationEmpty.hidden =
                false;

        }

        return;

    }


    if (vaccinationEmpty) {

        vaccinationEmpty.hidden =
            true;

    }


    records.sort(
        (
            first,
            second
        ) => {

            return (
                parseLocalDate(
                    first.nextDue
                ) -

                parseLocalDate(
                    second.nextDue
                )
            );

        }
    );


    records.forEach(
        vaccination => {

            const record =
                createVaccinationRecord(
                    vaccination
                );


            vaccinationRecordList.appendChild(
                record
            );

        }
    );

}


/* =========================================
   CREATE VACCINATION RECORD
========================================= */

function createVaccinationRecord(
    vaccination
) {

    const element =
        document.createElement(
            "div"
        );


    const status =
        getVaccinationStatus(
            vaccination
        );


    const pet =
        pets.find(
            item =>
                item.id ===
                vaccination.petId
        );


    element.className =
        "vaccination-record";


    element.innerHTML = `

        <div class="vaccine-icon">
            💉
        </div>


        <div class="vaccine-record-info">

            <h3>
                ${escapeHTML(
                    vaccination.vaccine
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


        <span
            class="vaccine-status ${status}"
        >
            ${getStatusLabel(status)}
        </span>

    `;


    return element;

}


/* =========================================
   STATUS LABEL
========================================= */

function getStatusLabel(
    status
) {

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
                vaccination.petId ===
                selectedPetId
        );


    let upToDate =
        0;

    let dueSoon =
        0;

    let overdue =
        0;


    selectedRecords.forEach(
        vaccination => {

            const status =
                getVaccinationStatus(
                    vaccination
                );


            if (
                status ===
                "up-to-date"
            ) {

                upToDate++;

            }


            if (
                status ===
                "due-soon"
            ) {

                dueSoon++;

            }


            if (
                status ===
                "overdue"
            ) {

                overdue++;

            }

        }
    );


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
========================================= */

function renderUpcomingVaccinations() {

    if (!upcomingVaccinationList) {
        return;
    }


    const upcoming =
        vaccinations

            .filter(
                vaccination =>
                    vaccination.reminder ===
                    true
            )

            .filter(
                vaccination =>
                    getVaccinationStatus(
                        vaccination
                    ) !==
                    "overdue"
            )

            .sort(
                (
                    first,
                    second
                ) => {

                    return (
                        parseLocalDate(
                            first.nextDue
                        ) -

                        parseLocalDate(
                            second.nextDue
                        )
                    );

                }
            )

            .slice(
                0,
                5
            );


    upcomingVaccinationList.innerHTML =
        "";


    if (
        upcoming.length === 0
    ) {

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


    upcoming.forEach(
        vaccination => {

            const pet =
                pets.find(
                    item =>
                        item.id ===
                        vaccination.petId
                );


            const date =
                parseLocalDate(
                    vaccination.nextDue
                );


            const element =
                document.createElement(
                    "div"
                );


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
                                month:
                                    "short"
                            }
                        )}
                    </span>

                </div>


                <div class="upcoming-info">

                    <h3>
                        ${escapeHTML(
                            vaccination.vaccine
                        )}
                    </h3>

                    <p>
                        ${
                            pet
                                ? escapeHTML(
                                    pet.name
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

        }
    );

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
        new Date(
            year,
            month,
            1
        );


    const lastDay =
        new Date(
            year,
            month + 1,
            0
        );


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


    calendarDays.innerHTML =
        "";


    /*
        Previous month dates
    */

    const previousLastDay =
        new Date(
            year,
            month,
            0
        ).getDate();


    for (
        let index = startingDay - 1;
        index >= 0;
        index--
    ) {

        const dayNumber =
            previousLastDay -
            index;


        const cell =
            createCalendarDay(
                dayNumber,
                true
            );


        calendarDays.appendChild(
            cell
        );

    }


    /*
        Current month dates
    */

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const cell =
            createCalendarDay(
                day,
                false
            );


        calendarDays.appendChild(
            cell
        );

    }


    /*
        Next month dates
        Complete the last row.
    */

    const totalCells =
        calendarDays.children.length;


    const remainingCells =
        totalCells % 7 === 0
            ? 0
            : 7 -
              (
                totalCells % 7
              );


    for (
        let day = 1;
        day <= remainingCells;
        day++
    ) {

        const cell =
            createCalendarDay(
                day,
                true
            );


        calendarDays.appendChild(
            cell
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
        document.createElement(
            "div"
        );


    cell.className =
        "calendar-day";


    if (otherMonth) {

        cell.classList.add(
            "other-month"
        );

    }


    const number =
        document.createElement(
            "span"
        );


    number.className =
        "calendar-day-number";


    number.textContent =
        dayNumber;


    cell.appendChild(
        number
    );


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


        /*
            Today
        */

        if (
            isSameDate(
                date,
                new Date()
            )
        ) {

            cell.classList.add(
                "today"
            );

        }


        /*
            Find vaccination reminders
            for this date.
        */

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

                const event =
                    createCalendarEvent(
                        vaccination
                    );


                cell.appendChild(
                    event
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
        document.createElement(
            "div"
        );


    const status =
        getVaccinationStatus(
            vaccination
        );


    const pet =
        pets.find(
            item =>
                item.id ===
                vaccination.petId
        );


    event.className =
        "calendar-event";


    if (
        status ===
        "due-soon"
    ) {

        event.classList.add(
            "due-soon"
        );

    }


    if (
        status ===
        "overdue"
    ) {

        event.classList.add(
            "overdue"
        );

    }


    event.textContent =

        `💉 ${
            pet
                ? pet.name
                : "Pet"
        } • ${
            vaccination.vaccine
        }`;


    event.title =

        `${vaccination.vaccine} - ${
            pet
                ? pet.name
                : "Pet"
        }\n` +

        `Due: ${
            formatDate(
                vaccination.nextDue
            )
        }`;


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
                item.id ===
                vaccination.petId
        );


    alert(

        `Vaccination Reminder\n\n` +

        `Pet: ${
            pet
                ? pet.name
                : "Unknown"
        }\n` +

        `Vaccine: ${
            vaccination.vaccine
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
            () => {

                openModal();

            }
        );

    }


    if (closeVaccineModal) {

        closeVaccineModal.addEventListener(
            "click",
            () => {

                closeModal();

            }
        );

    }


    if (cancelVaccine) {

        cancelVaccine.addEventListener(
            "click",
            () => {

                closeModal();

            }
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
                event.key ===
                    "Escape" &&

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


    if (vaccinePet) {

        vaccinePet.value =
            selectedPetId || "";

    }


    vaccineModal.hidden =
        false;


    document.body.style.overflow =
        "hidden";

}


/* =========================================
   CLOSE MODAL
========================================= */

function closeModal() {

    if (!vaccineModal) {
        return;
    }


    vaccineModal.hidden =
        true;


    document.body.style.overflow =
        "";

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
========================================= */

function setupVaccinationForm() {

    if (!vaccinationForm) {
        return;
    }


    vaccinationForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const petId =
                Number(
                    vaccinePet.value
                );


            const pet =
                pets.find(
                    item =>
                        item.id ===
                        petId
                );


            if (!pet) {

                alert(
                    "Please select a pet."
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


            /*
                Next due date should not be
                before the date given.
            */

            if (
                parseLocalDate(
                    dueDate
                ) <
                parseLocalDate(
                    givenDate
                )
            ) {

                alert(
                    "Next due date cannot be before the date given."
                );

                return;

            }


            const newVaccination = {

                id:
                    Date.now(),

                petId:
                    petId,

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


            vaccinations.push(
                newVaccination
            );


            /*
                Keep the newly selected pet
                visible.
            */

            selectedPetId =
                petId;


            currentFilter =
                "all";


            if (vaccineFilter) {

                vaccineFilter.value =
                    "all";

            }


            /*
                Refresh everything.
            */

            renderPetSelector();

            updateSelectedPet();

            updateSummary();

            renderUpcomingVaccinations();

            renderCalendar();


            /*
                Reset and close modal.
            */

            vaccinationForm.reset();


            if (customVaccineGroup) {

                customVaccineGroup.hidden =
                    true;

            }


            if (customVaccine) {

                customVaccine.required =
                    false;

            }


            closeModal();


            alert(
                "Vaccination saved successfully. The reminder has been added to the calendar."
            );

        }
    );

}


/* =========================================
   DATE HELPERS
========================================= */

function parseLocalDate(
    dateString
) {

    const [
        year,
        month,
        day
    ] =
        dateString
            .split("-")
            .map(Number);


    return new Date(
        year,
        month - 1,
        day
    );

}


/* =========================================
   START OF DAY
========================================= */

function startOfDay(
    date
) {

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
            first -
            second
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
    dateString
) {

    if (!dateString) {
        return "";
    }


    const date =
        parseLocalDate(
            dateString
        );


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
   ESCAPE HTML
========================================= */

function escapeHTML(
    value
) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        value;


    return element.innerHTML;

}