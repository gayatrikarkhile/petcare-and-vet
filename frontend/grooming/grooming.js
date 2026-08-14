document.addEventListener("DOMContentLoaded", () => {

    initializeGroomingPage();

});


/* ============================================================
   INITIALIZE
   ============================================================ */

function initializeGroomingPage() {

    setupPetSelector();

    setupGroomingModal();

    setupChecklist();

}


/* ============================================================
   PET SELECTOR
   ============================================================ */

function setupPetSelector() {

    const petSelector =
        document.getElementById("petSelector");

    if (!petSelector) {
        return;
    }


    petSelector.addEventListener("change", () => {

        const selectedPet =
            petSelector.options[
                petSelector.selectedIndex
            ].text;

        console.log(
            "Selected pet:",
            selectedPet
        );

    });

}


/* ============================================================
   GROOMING MODAL
   ============================================================ */

function setupGroomingModal() {

    const modal =
        document.getElementById("groomingModal");

    const openButton =
        document.getElementById("addGroomingBtn");

    const scheduleButton =
        document.getElementById("scheduleBtn");

    const closeButton =
        document.getElementById("closeModal");

    const cancelButton =
        document.getElementById("cancelModal");

    const form =
        document.getElementById("groomingForm");


    if (!modal) {
        return;
    }


    function openModal() {

        modal.classList.add("active");

        document.body.style.overflow = "hidden";

    }


    function closeModal() {

        modal.classList.remove("active");

        document.body.style.overflow = "";

    }


    if (openButton) {

        openButton.addEventListener(
            "click",
            openModal
        );

    }


    if (scheduleButton) {

        scheduleButton.addEventListener(
            "click",
            openModal
        );

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeModal
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeModal
        );

    }


    modal.addEventListener(
        "click",
        (event) => {

            if (event.target === modal) {

                closeModal();

            }

        }
    );


    if (form) {

        form.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();

                saveGroomingRecord();

                closeModal();

                form.reset();

            }
        );

    }

}


/* ============================================================
   SAVE GROOMING RECORD
   ============================================================ */

function saveGroomingRecord() {

    const type =
        document.getElementById(
            "groomingType"
        ).value;

    const date =
        document.getElementById(
            "groomingDate"
        ).value;

    const cost =
        document.getElementById(
            "groomingCost"
        ).value;

    const groomer =
        document.getElementById(
            "groomerName"
        ).value;


    console.log(
        "Grooming record:",
        {
            type,
            date,
            cost,
            groomer
        }
    );


    showToast(
        "Grooming record saved successfully."
    );

}


/* ============================================================
   CHECKLIST
   ============================================================ */

function setupChecklist() {

    const checkboxes =
        document.querySelectorAll(
            ".check-item input"
        );

    const progressText =
        document.getElementById(
            "checkProgress"
        );

    const progressBar =
        document.getElementById(
            "checkProgressBar"
        );


    if (!checkboxes.length) {
        return;
    }


    function updateProgress() {

        let completed = 0;


        checkboxes.forEach(
            checkbox => {

                if (checkbox.checked) {

                    completed++;

                }

            }
        );


        const total =
            checkboxes.length;


        const percentage =
            total === 0
                ? 0
                : (completed / total) * 100;


        if (progressText) {

            progressText.textContent =
                `${completed} / ${total}`;

        }


        if (progressBar) {

            progressBar.style.width =
                `${percentage}%`;

        }

    }


    checkboxes.forEach(
        checkbox => {

            checkbox.addEventListener(
                "change",
                updateProgress
            );

        }
    );


    updateProgress();

}


/* ============================================================
   TOAST
   ============================================================ */

function showToast(message) {

    const toast =
        document.getElementById(
            "groomingToast"
        );


    if (!toast) {
        return;
    }


    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}