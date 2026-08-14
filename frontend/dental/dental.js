/* ============================================================
   PAWSYNC DENTAL CARE
   ============================================================ */


/* ============================================================
   DENTAL DATA
   ============================================================ */

const dentalData = {

    bruno: {

        name: "Bruno",

        status: "Good",

        lastCleaning: "12 Jun 2026",

        nextCheckup: "15 Sep 2026",

        gumStatus: "Healthy",

        plaque: "Low",

        gumCondition: "Healthy",

        breath: "No",

        toothProblems: "None",

        routine: [

            {
                name: "Morning Brushing",
                detail: "Brush teeth for 2–3 minutes",
                completed: true
            },

            {
                name: "Dental Chew",
                detail: "Give a suitable dental chew",
                completed: true
            },

            {
                name: "Evening Brushing",
                detail: "Brush teeth before bedtime",
                completed: false
            },

            {
                name: "Water Check",
                detail: "Keep fresh water available",
                completed: true
            }

        ],

        records: [

            {
                type: "Professional Cleaning",
                icon: "✨",
                details: "Dental cleaning completed",
                date: "12 Jun 2026"
            },

            {
                type: "Dental Checkup",
                icon: "🦷",
                details: "Teeth and gums healthy",
                date: "12 Jun 2026"
            },

            {
                type: "Tooth Brushing",
                icon: "🪥",
                details: "Regular home brushing",
                date: "10 Jun 2026"
            },

            {
                type: "Dental Checkup",
                icon: "👨‍⚕️",
                details: "No dental problems found",
                date: "15 Mar 2026"
            }

        ],

        tip:
            "Brush Bruno's teeth regularly with pet-safe toothpaste to reduce plaque and tartar."

    },


    kitty: {

        name: "Kitty",

        status: "Good",

        lastCleaning: "05 Jun 2026",

        nextCheckup: "10 Sep 2026",

        gumStatus: "Healthy",

        plaque: "Low",

        gumCondition: "Healthy",

        breath: "No",

        toothProblems: "None",

        routine: [

            {
                name: "Morning Brushing",
                detail: "Gentle brushing for 2 minutes",
                completed: true
            },

            {
                name: "Dental Treat",
                detail: "Give a dental-friendly treat",
                completed: true
            },

            {
                name: "Evening Brushing",
                detail: "Gentle evening brushing",
                completed: false
            }

        ],

        records: [

            {
                type: "Dental Checkup",
                icon: "🦷",
                details: "Teeth and gums healthy",
                date: "05 Jun 2026"
            },

            {
                type: "Tooth Brushing",
                icon: "🪥",
                details: "Home dental care",
                date: "03 Jun 2026"
            }

        ],

        tip:
            "Cats can also develop plaque and tartar, so regular dental care is important."

    },


    coco: {

        name: "Coco",

        status: "Good",

        lastCleaning: "20 May 2026",

        nextCheckup: "20 Aug 2026",

        gumStatus: "Healthy",

        plaque: "Low",

        gumCondition: "Healthy",

        breath: "No",

        toothProblems: "None",

        routine: [

            {
                name: "Oral Check",
                detail: "Check beak and mouth",
                completed: true
            },

            {
                name: "Fresh Water",
                detail: "Replace water daily",
                completed: true
            },

            {
                name: "Mouth Observation",
                detail: "Check for unusual changes",
                completed: false
            }

        ],

        records: [

            {
                type: "Dental Checkup",
                icon: "🦷",
                details: "Oral health check completed",
                date: "20 May 2026"
            },

            {
                type: "Routine Check",
                icon: "🩺",
                details: "No abnormal signs observed",
                date: "20 May 2026"
            }

        ],

        tip:
            "Regularly observe your bird's beak and mouth for unusual growth, damage or changes."

    }

};


/* ============================================================
   STATE
   ============================================================ */

let currentPet = "bruno";


/* ============================================================
   PAGE LOAD
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeDental();

    }
);


/* ============================================================
   INITIALIZE
   ============================================================ */

function initializeDental() {

    setupPetSelector();

    setupModal();

    renderDentalPage();

}


/* ============================================================
   PET SELECTOR
   ============================================================ */

function setupPetSelector() {

    const selector =
        document.getElementById(
            "petSelector"
        );


    if (!selector) {
        return;
    }


    selector.addEventListener(
        "change",
        function () {

            currentPet =
                this.value;

            renderDentalPage();

        }
    );

}


/* ============================================================
   RENDER PAGE
   ============================================================ */

function renderDentalPage() {

    const pet =
        dentalData[currentPet];


    if (!pet) {
        return;
    }


    renderSummary(pet);

    renderHealth(pet);

    renderRoutine(pet);

    renderRecords(pet);

    renderTip(pet);

}


/* ============================================================
   SUMMARY
   ============================================================ */

function renderSummary(pet) {

    const status =
        document.getElementById(
            "dentalStatus"
        );


    const cleaning =
        document.getElementById(
            "lastCleaning"
        );


    const checkup =
        document.getElementById(
            "nextCheckup"
        );


    if (status) {
        status.textContent =
            pet.status;
    }


    if (cleaning) {
        cleaning.textContent =
            pet.lastCleaning;
    }


    if (checkup) {
        checkup.textContent =
            pet.nextCheckup;
    }

}


/* ============================================================
   HEALTH
   ============================================================ */

function renderHealth(pet) {

    const gumStatus =
        document.getElementById(
            "gumStatus"
        );


    const plaque =
        document.getElementById(
            "plaqueLevel"
        );


    const gum =
        document.getElementById(
            "gumCondition"
        );


    const breath =
        document.getElementById(
            "breathStatus"
        );


    const problems =
        document.getElementById(
            "toothProblems"
        );


    if (gumStatus) {
        gumStatus.textContent =
            pet.gumStatus;
    }


    if (plaque) {
        plaque.textContent =
            pet.plaque;
    }


    if (gum) {
        gum.textContent =
            pet.gumCondition;
    }


    if (breath) {
        breath.textContent =
            pet.breath;
    }


    if (problems) {
        problems.textContent =
            pet.toothProblems;
    }

}


/* ============================================================
   ROUTINE
   ============================================================ */

function renderRoutine(pet) {

    const container =
        document.getElementById(
            "routineList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    let completed = 0;


    pet.routine.forEach(
        function (item) {

            if (item.completed) {
                completed++;
            }


            container.innerHTML +=
                `
                <div class="
                    routine-item
                    ${item.completed ? "completed" : ""}
                ">

                    <div class="routine-check">

                        ${item.completed ? "✓" : "○"}

                    </div>


                    <div class="routine-info">

                        <p class="routine-name">
                            ${item.name}
                        </p>

                        <p class="routine-detail">
                            ${item.detail}
                        </p>

                    </div>


                    <span class="routine-status">

                        ${item.completed
                            ? "Done"
                            : "Pending"}

                    </span>

                </div>
                `;

        }
    );


    const percentage =
        Math.round(
            (completed /
                pet.routine.length) *
            100
        );


    const percentageText =
        document.getElementById(
            "routinePercentage"
        );


    const progress =
        document.getElementById(
            "routineProgress"
        );


    if (percentageText) {

        percentageText.textContent =
            `${percentage}%`;

    }


    if (progress) {

        progress.style.width =
            `${percentage}%`;

    }

}


/* ============================================================
   RECORDS
   ============================================================ */

function renderRecords(pet) {

    const container =
        document.getElementById(
            "recordsList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    pet.records.forEach(
        function (record) {

            container.innerHTML +=
                `
                <div class="record-item">

                    <div class="record-icon">
                        ${record.icon}
                    </div>


                    <div class="record-info">

                        <h3>
                            ${record.type}
                        </h3>

                        <p>
                            ${record.details}
                        </p>

                    </div>


                    <span class="record-date">
                        ${record.date}
                    </span>

                </div>
                `;

        }
    );

}


/* ============================================================
   TIP
   ============================================================ */

function renderTip(pet) {

    const tip =
        document.getElementById(
            "dentalTip"
        );


    if (tip) {

        tip.textContent =
            pet.tip;

    }

}


/* ============================================================
   MODAL
   ============================================================ */

function setupModal() {

    const modal =
        document.getElementById(
            "dentalModal"
        );


    const openButton =
        document.getElementById(
            "addRecordBtn"
        );


    const closeButton =
        document.getElementById(
            "closeModal"
        );


    const cancelButton =
        document.getElementById(
            "cancelModal"
        );


    const form =
        document.getElementById(
            "dentalForm"
        );


    if (
        !modal ||
        !openButton ||
        !closeButton ||
        !cancelButton ||
        !form
    ) {

        return;

    }


    openButton.addEventListener(
        "click",
        function () {

            modal.classList.add(
                "active"
            );

            setToday();

        }
    );


    closeButton.addEventListener(
        "click",
        closeModal
    );


    cancelButton.addEventListener(
        "click",
        closeModal
    );


    modal.addEventListener(
        "click",
        function (event) {

            if (
                event.target === modal
            ) {

                closeModal();

            }

        }
    );


    form.addEventListener(
        "submit",
        saveRecord
    );

}


/* ============================================================
   SET TODAY
   ============================================================ */

function setToday() {

    const dateInput =
        document.getElementById(
            "recordDate"
        );


    if (!dateInput) {
        return;
    }


    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    dateInput.value =
        `${year}-${month}-${day}`;

}


/* ============================================================
   CLOSE MODAL
   ============================================================ */

function closeModal() {

    const modal =
        document.getElementById(
            "dentalModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "active"
    );

}


/* ============================================================
   SAVE RECORD
   ============================================================ */

function saveRecord(event) {

    event.preventDefault();


    const type =
        document.getElementById(
            "recordType"
        ).value;


    const date =
        document.getElementById(
            "recordDate"
        ).value;


    const clinic =
        document.getElementById(
            "clinicName"
        ).value;


    const notes =
        document.getElementById(
            "recordNotes"
        ).value;


    if (!type || !date) {
        return;
    }


    const pet =
        dentalData[currentPet];


    let formattedDate;


    if (date) {

        const dateObject =
            new Date(
                date + "T00:00:00"
            );


        formattedDate =
            dateObject.toLocaleDateString(
                "en-GB",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

    }


    let details =
        clinic ||
        "Dental care record added";


    if (notes) {

        details +=
            ` · ${notes}`;

    }


    pet.records.unshift({

        type: type,

        icon:
            getRecordIcon(type),

        details: details,

        date: formattedDate

    });


    renderRecords(pet);


    closeModal();


    document
        .getElementById(
            "dentalForm"
        )
        .reset();


    showToast(
        "Dental record added successfully."
    );

}


/* ============================================================
   RECORD ICON
   ============================================================ */

function getRecordIcon(type) {

    const value =
        type.toLowerCase();


    if (
        value.includes("clean")
    ) {

        return "✨";

    }


    if (
        value.includes("brush")
    ) {

        return "🪥";

    }


    if (
        value.includes("check")
    ) {

        return "🦷";

    }


    if (
        value.includes("treatment")
    ) {

        return "🩺";

    }


    return "🦷";

}


/* ============================================================
   TOAST
   ============================================================ */

function showToast(message) {

    const toast =
        document.getElementById(
            "dentalToast"
        );


    if (!toast) {
        return;
    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        function () {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}