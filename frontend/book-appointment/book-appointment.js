/* =========================================
   PAWSYNC - BOOK APPOINTMENT
   FRONTEND ONLY
========================================= */


/* =========================================
   DEFAULT VET
========================================= */

const defaultVet = {

    id: 1,

    name: "Dr. Anjali Sharma",

    specialty: "General Veterinary",

    rating: 4.9,

    fee: 500,

    image:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80"

};


/* =========================================
   GET SELECTED VET
========================================= */

let selectedVet = defaultVet;


try {

    const storedVet =
        localStorage.getItem(
            "selectedVet"
        );


    if (storedVet) {

        selectedVet =
            JSON.parse(storedVet);

    }

} catch (error) {

    selectedVet =
        defaultVet;

}


/* =========================================
   ELEMENTS
========================================= */

const vetImage =
    document.getElementById(
        "vetImage"
    );

const vetName =
    document.getElementById(
        "vetName"
    );

const vetSpecialty =
    document.getElementById(
        "vetSpecialty"
    );

const vetRating =
    document.getElementById(
        "vetRating"
    );

const vetFee =
    document.getElementById(
        "vetFee"
    );


const summaryVetImage =
    document.getElementById(
        "summaryVetImage"
    );

const summaryVetName =
    document.getElementById(
        "summaryVetName"
    );

const summaryVetSpecialty =
    document.getElementById(
        "summaryVetSpecialty"
    );

const summaryFee =
    document.getElementById(
        "summaryFee"
    );


/* =========================================
   LOAD VET
========================================= */

function loadVet() {

    vetImage.src =
        selectedVet.image;

    vetImage.alt =
        selectedVet.name;


    vetName.textContent =
        selectedVet.name;


    vetSpecialty.textContent =
        selectedVet.specialty;


    vetRating.textContent =
        selectedVet.rating;


    vetFee.textContent =
        `₹${selectedVet.fee}`;


    summaryVetImage.src =
        selectedVet.image;

    summaryVetImage.alt =
        selectedVet.name;


    summaryVetName.textContent =
        selectedVet.name;


    summaryVetSpecialty.textContent =
        selectedVet.specialty;


    summaryFee.textContent =
        `₹${selectedVet.fee}`;

}


/* =========================================
   UPDATE SUMMARY
========================================= */

function updateSummary() {

    const selectedPet =
        document.querySelector(
            'input[name="pet"]:checked'
        );


    const selectedDate =
        document.querySelector(
            'input[name="date"]:checked'
        );


    const selectedTime =
        document.querySelector(
            'input[name="time"]:checked'
        );


    const selectedReason =
        document.querySelector(
            'input[name="reason"]:checked'
        );


    if (selectedPet) {

        document.getElementById(
            "summaryPet"
        ).textContent =
            selectedPet.value;

    }


    if (selectedDate) {

        document.getElementById(
            "summaryDate"
        ).textContent =
            selectedDate.value;

    }


    if (selectedTime) {

        document.getElementById(
            "summaryTime"
        ).textContent =
            selectedTime.value;

    }


    if (selectedReason) {

        document.getElementById(
            "summaryReason"
        ).textContent =
            selectedReason.value;

    }

}


/* =========================================
   RADIO CHANGE EVENTS
========================================= */

const allRadioButtons =
    document.querySelectorAll(
        'input[type="radio"]'
    );


allRadioButtons.forEach(
    radio => {

        radio.addEventListener(
            "change",
            updateSummary
        );

    }
);


/* =========================================
   FORM SUBMIT
========================================= */

const appointmentForm =
    document.getElementById(
        "appointmentForm"
    );


appointmentForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const selectedPet =
            document.querySelector(
                'input[name="pet"]:checked'
            ).value;


        const selectedDate =
            document.querySelector(
                'input[name="date"]:checked'
            ).value;


        const selectedTime =
            document.querySelector(
                'input[name="time"]:checked'
            ).value;


        const selectedReason =
            document.querySelector(
                'input[name="reason"]:checked'
            ).value;


        const notes =
            document.getElementById(
                "notes"
            ).value.trim();


        const appointment = {

            vet:
                selectedVet.name,

            vetSpecialty:
                selectedVet.specialty,

            pet:
                selectedPet,

            date:
                selectedDate,

            time:
                selectedTime,

            reason:
                selectedReason,

            notes:
                notes,

            fee:
                selectedVet.fee

        };


        /*
            Save static appointment data
            in localStorage.

            Backend can replace this later.
        */

        localStorage.setItem(
            "pawsyncAppointment",
            JSON.stringify(
                appointment
            )
        );


        showSuccess(
            appointment
        );

    }
);


/* =========================================
   SUCCESS MODAL
========================================= */

function showSuccess(
    appointment
) {

    document.getElementById(
        "successVet"
    ).textContent =
        appointment.vet;


    document.getElementById(
        "successDetails"
    ).textContent =

        `${appointment.pet} • ${appointment.date} • ${appointment.time}`;


    document.getElementById(
        "successModal"
    ).style.display =
        "flex";


    document.body.style.overflow =
        "hidden";

}


/* =========================================
   SUCCESS BUTTON
========================================= */

document.getElementById(
    "successButton"
).addEventListener(
    "click",
    () => {

        /*
            For now return to
            appointments page.

            Later this will open
            My Appointments.
        */

        window.location.href =
            "/frontend/appointments/appointments.html";

    }
);


/* =========================================
   BACK BUTTON
========================================= */

document.getElementById(
    "backButton"
).addEventListener(
    "click",
    () => {

        window.location.href =
            "/frontend/appointments/appointments.html";

    }
);


/* =========================================
   NOTIFICATIONS
========================================= */

document.getElementById(
    "notificationButton"
).addEventListener(
    "click",
    () => {

        alert(
            "You have 2 new notifications."
        );

    }
);


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadVet();

        updateSummary();

    }
);