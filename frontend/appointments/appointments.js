/* =========================================
   PAWSYNC - VET APPOINTMENTS
   FRONTEND ONLY

   Shared Navbar + Sidebar:
   loaded by shared.js
========================================= */


/* =========================================
   VETERINARIANS
========================================= */

const veterinarians = [

    {
        id: 1,

        name: "Dr. Anjali Sharma",

        specialty: "General Veterinary",

        rating: 4.9,

        reviews: 128,

        fee: 500,

        availability: "Available Today",

        availabilityType: "today",

        location: "Pune, Maharashtra",

        experience: "8 Years",

        image:
            "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80"
    },


    {
        id: 2,

        name: "Dr. Priya Mehta",

        specialty: "Pet Nutrition",

        rating: 4.8,

        reviews: 96,

        fee: 600,

        availability: "Available Tomorrow",

        availabilityType: "tomorrow",

        location: "Pune, Maharashtra",

        experience: "7 Years",

        image:
            "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&q=80"
    },


    {
        id: 3,

        name: "Dr. Rahul Patil",

        specialty: "Veterinary Surgery",

        rating: 4.7,

        reviews: 84,

        fee: 700,

        availability: "Available Today",

        availabilityType: "today",

        location: "Pune, Maharashtra",

        experience: "10 Years",

        image:
            "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80"
    },


    {
        id: 4,

        name: "Dr. Neha Kulkarni",

        specialty: "Dermatology",

        rating: 4.9,

        reviews: 112,

        fee: 650,

        availability: "Available Today",

        availabilityType: "today",

        location: "Pune, Maharashtra",

        experience: "9 Years",

        image:
            "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?auto=format&fit=crop&w=400&q=80"
    },


    {
        id: 5,

        name: "Dr. Arjun Deshmukh",

        specialty: "General Veterinary",

        rating: 4.6,

        reviews: 73,

        fee: 450,

        availability: "Available Tomorrow",

        availabilityType: "tomorrow",

        location: "Pune, Maharashtra",

        experience: "6 Years",

        image:
            "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=400&q=80"
    },


    {
        id: 6,

        name: "Dr. Sneha Joshi",

        specialty: "Pet Nutrition",

        rating: 4.8,

        reviews: 105,

        fee: 550,

        availability: "Available Today",

        availabilityType: "today",

        location: "Pune, Maharashtra",

        experience: "8 Years",

        image:
            "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80"
    }

];


/* =========================================
   DOM ELEMENTS
========================================= */

const vetGrid =
    document.getElementById("vetGrid");

const emptyState =
    document.getElementById("emptyState");

const searchVet =
    document.getElementById("searchVet");

const specialtyFilter =
    document.getElementById("specialtyFilter");

const availabilityFilter =
    document.getElementById("availabilityFilter");

const vetCount =
    document.getElementById("vetCount");


/* =========================================
   RENDER VETERINARIANS
========================================= */

function renderVets(list) {

    if (!vetGrid) {
        return;
    }


    vetGrid.innerHTML = "";


    /* -------------------------------
       EMPTY RESULT
    -------------------------------- */

    if (list.length === 0) {

        if (emptyState) {

            emptyState.style.display =
                "block";

        }


        if (vetCount) {

            vetCount.textContent =
                "0 Veterinarians";

        }

        return;
    }


    /* -------------------------------
       RESULTS FOUND
    -------------------------------- */

    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    if (vetCount) {

        vetCount.textContent =
            `${list.length} Veterinarian${list.length > 1 ? "s" : ""}`;

    }


    list.forEach(vet => {

        const card =
            document.createElement("article");


        card.className =
            "vet-card";


        card.innerHTML = `

            <div class="vet-card-top">

                <img
                    src="${vet.image}"
                    alt="${vet.name}"
                    class="vet-photo"
                    loading="lazy"
                >


                <div class="vet-details">

                    <div class="verified">
                        ✓ Verified Veterinarian
                    </div>


                    <h3 class="vet-name">
                        ${vet.name}
                    </h3>


                    <p class="vet-specialty">
                        ${vet.specialty}
                    </p>


                    <div class="rating">

                        <strong>
                            ★ ${vet.rating}
                        </strong>

                        <span>
                            (${vet.reviews} reviews)
                        </span>

                    </div>

                </div>

            </div>


            <div class="vet-card-body">


                <div class="vet-location">
                    📍 ${vet.location}
                </div>


                <div class="vet-meta">


                    <div class="availability">

                        <span class="availability-dot"></span>

                        ${vet.availability}

                    </div>


                    <div class="fee">

                        ₹${vet.fee}

                        <span>
                            / consultation
                        </span>

                    </div>

                </div>


                <div class="vet-actions">


                    <button
                        class="profile-btn"
                        data-vet-id="${vet.id}"
                    >
                        View Profile
                    </button>


                    <button
                        class="book-btn"
                        data-vet-id="${vet.id}"
                    >
                        Book Appointment
                    </button>


                </div>


            </div>

        `;


        vetGrid.appendChild(card);

    });


    attachVetButtons();

}


/* =========================================
   VET BUTTONS
========================================= */

function attachVetButtons() {

    const profileButtons =
        document.querySelectorAll(
            ".profile-btn"
        );


    const bookButtons =
        document.querySelectorAll(
            ".book-btn"
        );


    /* =====================================
       VIEW PROFILE
    ===================================== */

    profileButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const vetId =
                    Number(
                        button.dataset.vetId
                    );


                const vet =
                    veterinarians.find(
                        item =>
                            item.id === vetId
                    );


                if (!vet) {
                    return;
                }


                alert(
                    `${vet.name}\n\n` +
                    `Specialty: ${vet.specialty}\n` +
                    `Experience: ${vet.experience}\n` +
                    `Rating: ${vet.rating}/5`
                );

            }
        );

    });


    /* =====================================
       BOOK APPOINTMENT
    ===================================== */

    bookButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const vetId =
                    Number(
                        button.dataset.vetId
                    );


                const vet =
                    veterinarians.find(
                        item =>
                            item.id === vetId
                    );


                if (!vet) {
                    return;
                }


                /* Save selected veterinarian */

                localStorage.setItem(
                    "selectedVet",
                    JSON.stringify(vet)
                );


                /* Go to booking page */

                window.location.href =
                    "/frontend/book-appointment/book-appointment.html";

            }
        );

    });

}


/* =========================================
   FILTER VETERINARIANS
========================================= */

function filterVets() {

    if (
        !searchVet ||
        !specialtyFilter ||
        !availabilityFilter
    ) {
        return;
    }


    const searchValue =
        searchVet.value
            .trim()
            .toLowerCase();


    const specialtyValue =
        specialtyFilter.value;


    const availabilityValue =
        availabilityFilter.value;


    const filtered =
        veterinarians.filter(vet => {


            const matchesSearch =

                vet.name
                    .toLowerCase()
                    .includes(searchValue)

                ||

                vet.specialty
                    .toLowerCase()
                    .includes(searchValue);


            const matchesSpecialty =

                specialtyValue === "all"

                ||

                vet.specialty ===
                    specialtyValue;


            const matchesAvailability =

                availabilityValue === "all"

                ||

                vet.availabilityType ===
                    availabilityValue;


            return (

                matchesSearch &&

                matchesSpecialty &&

                matchesAvailability

            );

        });


    renderVets(filtered);

}


/* =========================================
   SEARCH LISTENER
========================================= */

if (searchVet) {

    searchVet.addEventListener(
        "input",
        filterVets
    );

}


/* =========================================
   SPECIALTY FILTER
========================================= */

if (specialtyFilter) {

    specialtyFilter.addEventListener(
        "change",
        filterVets
    );

}


/* =========================================
   AVAILABILITY FILTER
========================================= */

if (availabilityFilter) {

    availabilityFilter.addEventListener(
        "change",
        filterVets
    );

}


/* =========================================
   MY APPOINTMENTS
========================================= */

const myAppointmentsButton =
    document.getElementById(
        "myAppointmentsButton"
    );


if (myAppointmentsButton) {

    myAppointmentsButton.addEventListener(
        "click",
        () => {

            alert(
                "Your upcoming appointments will appear here."
            );

        }
    );

}


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderVets(
            veterinarians
        );

    }
);