/* =========================================
   PAWSYNC - MY PETS
   DYNAMIC DATA FROM MONGODB
========================================= */


/* =========================================
   GLOBAL DATA
========================================= */

let pets = [];

let filteredPets = [];


/* =========================================
   ELEMENTS
========================================= */

const petsGrid =
    document.getElementById("petsGrid");

const emptyState =
    document.getElementById("emptyState");

const petSearch =
    document.getElementById("petSearch");

const petTypeFilter =
    document.getElementById("petTypeFilter");

const petCount =
    document.getElementById("petCount");

const emptyAddPetButton =
    document.getElementById("emptyAddPetButton");


/* =========================================
   GET AUTH TOKEN
========================================= */

function getToken() {

    return localStorage.getItem(
        "pawsyncToken"
    );

}


/* =========================================
   CALCULATE AGE
========================================= */

function calculateAge(dateOfBirth) {

    if (!dateOfBirth) {
        return "Age not available";
    }

    const birthDate =
        new Date(dateOfBirth);

    if (isNaN(birthDate.getTime())) {
        return "Age not available";
    }

    const today = new Date();

    let years =
        today.getFullYear() -
        birthDate.getFullYear();

    let months =
        today.getMonth() -
        birthDate.getMonth();

    if (
        today.getDate() <
        birthDate.getDate()
    ) {
        months--;
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    if (years > 0) {

        return years === 1
            ? "1 Year"
            : `${years} Years`;

    }

    if (months > 0) {

        return months === 1
            ? "1 Month"
            : `${months} Months`;

    }

    return "Less than 1 Month";
}


/* =========================================
   CONVERT SPECIES TO DISPLAY TYPE
========================================= */

function getPetType(species) {

    if (!species) {
        return "Other";
    }

    const value =
        species
            .toLowerCase()
            .trim();


    if (value === "dog") {
        return "Dog";
    }


    if (value === "cat") {
        return "Cat";
    }


    if (
        value === "bird" ||
        value === "lovebird" ||
        value === "parrot" ||
        value === "eclectus parrot" ||
        value === "cockatiel" ||
        value === "canary" ||
        value === "finch"
    ) {

        return "Bird";

    }


    return species;
}


/* =========================================
   CONVERT DATABASE PET
========================================= */

function formatPet(pet) {

    let weight = "Weight not available";


    if (
        pet.currentWeight &&
        pet.currentWeight.value
    ) {

        weight =
            `${pet.currentWeight.value} ${
                pet.currentWeight.unit || "kg"
            }`;

    }


    return {

        id:
            pet._id,

        name:
            pet.petName || "Unnamed Pet",

        type:
            getPetType(
                pet.species
            ),

        species:
            pet.species || "Unknown",

        breed:
            pet.breed ||
            "Breed not specified",

        age:
            calculateAge(
                pet.dateOfBirth
            ),

        gender:
            pet.gender ||
            "Not specified",

        weight:
            weight,

        image:
            pet.petPhoto || "",

        score:
            pet.healthScore !== undefined ? Number(pet.healthScore) : 0
    };

}


/* =========================================
   LOAD PETS FROM BACKEND
========================================= */

async function loadPets() {

    const token =
        getToken();


    if (!token) {

        console.error(
            "PawSync token not found."
        );

        return;

    }


    try {

        /* -------------------------------------
           LOADING MESSAGE
        ------------------------------------- */

        if (petsGrid) {

            petsGrid.innerHTML = `

                <div style="
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 50px;
                    color: #71879a;
                ">

                    Loading your pets...

                </div>

            `;

        }


        /* -------------------------------------
           API CALL
        ------------------------------------- */

        const response =
            await fetch(
                "http://localhost:5000/api/pets",
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"

                    }

                }
            );


        const data =
            await response.json();


        console.log(
            "MY PETS BACKEND RESPONSE:",
            data
        );


        /* -------------------------------------
           CHECK RESPONSE
        ------------------------------------- */

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load pets"
            );

        }


        /* -------------------------------------
           GET PET ARRAY
        ------------------------------------- */

        pets =
            Array.isArray(data.pets)
                ? data.pets.map(
                    formatPet
                )
                : [];


        filteredPets =
            [...pets];


        console.log(
            "PETS FROM MONGODB:",
            pets
        );


        /* -------------------------------------
           UPDATE COUNT
        ------------------------------------- */

        updatePetCount();


        /* -------------------------------------
           RENDER
        ------------------------------------- */

        renderPets(
            filteredPets
        );

    }

    catch (error) {

        console.error(
            "ERROR LOADING PETS:",
            error
        );


        if (petsGrid) {

            petsGrid.innerHTML = `

                <div style="
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 50px;
                ">

                    <h3>
                        Unable to load pets
                    </h3>

                    <p>
                        ${error.message}
                    </p>

                    <button
                        onclick="loadPets()"
                        style="
                            margin-top:15px;
                            padding:10px 18px;
                            border:none;
                            border-radius:8px;
                            background:#0d9588;
                            color:white;
                            cursor:pointer;
                        "
                    >
                        Try Again
                    </button>

                </div>

            `;

        }

    }

}


/* =========================================
   RENDER PET CARDS
========================================= */

function renderPets(list) {

    if (!petsGrid) {
        return;
    }


    petsGrid.innerHTML = "";


    /* -------------------------------------
       NO PETS
    ------------------------------------- */

    if (list.length === 0) {

        if (emptyState) {

            emptyState.style.display =
                "block";

        }

        return;

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    /* -------------------------------------
       CREATE CARDS
    ------------------------------------- */

    list.forEach(
        pet => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "pet-card";


            card.innerHTML = `

                <div class="pet-image-container">

                    ${
                        pet.image

                        ?

                        `
                        <img
                            src="${escapeHTML(
                                pet.image
                            )}"
                            alt="${escapeHTML(
                                pet.name
                            )}"
                            class="pet-image"
                            loading="lazy"
                        >
                        `

                        :

                        `
                        <div style="
                            width:100%;
                            height:100%;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            font-size:60px;
                            background:#eaf5f2;
                        ">
                            🐾
                        </div>
                        `
                    }


                    <span class="pet-status">
                        Active
                    </span>

                </div>


                <div class="pet-content">

                    <h3 class="pet-name">

                        ${escapeHTML(
                            pet.name
                        )}

                    </h3>


                    <p class="pet-breed">

                        ${escapeHTML(
                            pet.breed
                        )}

                    </p>


                    <div class="pet-details">

                        <span class="pet-detail">

                            ${escapeHTML(
                                pet.type
                            )}

                        </span>


                        <span class="pet-detail">

                            ${escapeHTML(
                                pet.age
                            )}

                        </span>


                        <span class="pet-detail">

                            ${escapeHTML(
                                pet.gender
                            )}

                        </span>


                        <span class="pet-detail">

                            ${escapeHTML(
                                pet.weight
                            )}

                        </span>

                    </div>


                    <div class="pet-health">

                        <div class="pet-health-row">

                            <span>
                                Health Score
                            </span>

                            <strong>
                                ${pet.score}/100
                            </strong>

                        </div>


                        <div class="pet-health-track">

                            <span
                                style="
                                    width:${pet.score}%;
                                "
                            ></span>

                        </div>

                    </div>


                    <button
                        class="view-pet-button"
                        data-pet-id="${pet.id}"
                        type="button"
                    >

                        View Pet Profile

                    </button>

                </div>

            `;


            petsGrid.appendChild(
                card
            );

        }
    );


    attachPetButtons();

}


/* =========================================
   SEARCH + FILTER
========================================= */

function filterPets() {

    const search =
        petSearch
            ? petSearch.value
                .trim()
                .toLowerCase()
            : "";


    const type =
        petTypeFilter
            ? petTypeFilter.value
            : "all";


    filteredPets =
        pets.filter(
            pet => {

                const matchesSearch =

                    pet.name
                        .toLowerCase()
                        .includes(search)

                    ||

                    pet.breed
                        .toLowerCase()
                        .includes(search)

                    ||

                    pet.species
                        .toLowerCase()
                        .includes(search);


                const matchesType =

                    type === "all"

                    ||

                    pet.type === type;


                return (
                    matchesSearch &&
                    matchesType
                );

            }
        );


    renderPets(
        filteredPets
    );

}


/* =========================================
   SEARCH EVENT
========================================= */

if (petSearch) {

    petSearch.addEventListener(
        "input",
        filterPets
    );

}


/* =========================================
   FILTER EVENT
========================================= */

if (petTypeFilter) {

    petTypeFilter.addEventListener(
        "change",
        filterPets
    );

}


/* =========================================
   VIEW PET PROFILE
========================================= */

function attachPetButtons() {

    const buttons =
        document.querySelectorAll(
            ".view-pet-button"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const petId =
                        button.dataset.petId;


                    localStorage.setItem(
                        "pawsyncSelectedPet",
                        petId
                    );


                    window.location.href =
                        "../petProfile/petProfile.html";

                }
            );

        }
    );

}


/* =========================================
   UPDATE DYNAMIC PET SUMMARY STATS
========================================= */

async function updatePetCount() {
    if (petCount) {
        petCount.textContent = pets.length;
    }

    const profileCompletionEl = document.getElementById("profileCompletionCount");
    const upcomingAppointmentsEl = document.getElementById("upcomingAppointmentsCount");

    if (!pets || pets.length === 0) {
        if (profileCompletionEl) profileCompletionEl.textContent = "0%";
        if (upcomingAppointmentsEl) upcomingAppointmentsEl.textContent = "0";
        return;
    }

    try {
        const token = getToken();
        let totalCompletion = 0;
        let totalUpcoming = 0;

        await Promise.all(pets.map(async (p) => {
            const petId = p.id || p._id;
            try {
                const res = await fetch(`http://localhost:5000/api/pets/dashboard/${petId}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                const data = await res.json();
                if (res.ok && data.success && data.dashboard) {
                    totalCompletion += (data.dashboard.profileCompletion || 50);
                    const reminders = data.dashboard.upcomingReminders || [];
                    totalUpcoming += reminders.length;
                } else {
                    totalCompletion += 50;
                }
            } catch (err) {
                totalCompletion += 50;
            }
        }));

        const avgCompletion = Math.round(totalCompletion / pets.length);
        if (profileCompletionEl) profileCompletionEl.textContent = `${avgCompletion}%`;
        if (upcomingAppointmentsEl) upcomingAppointmentsEl.textContent = totalUpcoming;
    } catch (err) {
        console.error("Error updating pet summary header cards:", err);
    }
}


/* =========================================
   ADD PET BUTTON
========================================= */

if (emptyAddPetButton) {

    emptyAddPetButton.addEventListener(
        "click",
        () => {

            window.location.href =
                "../addPetForm/addPetForm.html";

        }
    );

}


/* =========================================
   HTML ESCAPE
========================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadPets();

    }
);