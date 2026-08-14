/* =========================================
   PAWSYNC - MY PETS
   PAGE-SPECIFIC JAVASCRIPT
========================================= */


/* =========================================
   PET DATA
========================================= */

const pets = [

    {
        id: 1,
        name: "Bruno",
        type: "Dog",
        breed: "Labrador Retriever",
        age: "2 Years",
        gender: "Male",
        weight: "20 kg",
        score: 61,
        image:
            "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80"
    },

    {
        id: 2,
        name: "Kitty",
        type: "Cat",
        breed: "Persian Cat",
        age: "1 Year",
        gender: "Female",
        weight: "4.5 kg",
        score: 86,
        image:
            "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=900&q=80"
    },

    {
        id: 3,
        name: "Coco",
        type: "Bird",
        breed: "Eclectus Parrot",
        age: "3 Years",
        gender: "Male",
        weight: "420 g",
        score: 92,
        image:
            "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=900&q=80"
    }

];


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

const addPetModal =
    document.getElementById("addPetModal");

const closeAddPetModal =
    document.getElementById("closeAddPetModal");

const cancelAddPet =
    document.getElementById("cancelAddPet");

const addPetForm =
    document.getElementById("addPetForm");

const petPhotoInput =
    document.getElementById("petPhotoInput");

const petPhotoPreview =
    document.getElementById("petPhotoPreview");


/* =========================================
   RENDER PETS
========================================= */

function renderPets(list) {

    if (!petsGrid) {
        return;
    }

    petsGrid.innerHTML = "";


    if (list.length === 0) {

        if (emptyState) {
            emptyState.style.display = "block";
        }

        return;
    }


    if (emptyState) {
        emptyState.style.display = "none";
    }


    list.forEach(pet => {

        const card =
            document.createElement("article");


        card.className =
            "pet-card";


        card.innerHTML = `

            <div class="pet-image-container">

                <img
                    src="${pet.image}"
                    alt="${pet.name}"
                    class="pet-image"
                    loading="lazy"
                >

                <span class="pet-status">
                    Active
                </span>

            </div>


            <div class="pet-content">

                <h3 class="pet-name">
                    ${pet.name}
                </h3>


                <p class="pet-breed">
                    ${pet.breed}
                </p>


                <div class="pet-details">

                    <span class="pet-detail">
                        ${pet.type}
                    </span>

                    <span class="pet-detail">
                        ${pet.age}
                    </span>

                    <span class="pet-detail">
                        ${pet.gender}
                    </span>

                    <span class="pet-detail">
                        ${pet.weight}
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
                            style="width:${pet.score}%"
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


        petsGrid.appendChild(card);

    });


    attachPetButtons();

}


/* =========================================
   VIEW PET PROFILE
========================================= */

function attachPetButtons() {

    const buttons =
        document.querySelectorAll(
            ".view-pet-button"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const petId =
                    Number(
                        button.dataset.petId
                    );


                const pet =
                    pets.find(
                        item =>
                            item.id === petId
                    );


                if (!pet) {
                    return;
                }


                localStorage.setItem(
                    "pawsyncSelectedPet",
                    pet.name.toLowerCase()
                );


                window.location.href =
                    "/frontend/petProfile/petProfile.html";

            }
        );

    });

}


/* =========================================
   SEARCH + FILTER
========================================= */

function filterPets() {

    if (!petSearch || !petTypeFilter) {
        return;
    }


    const searchValue =
        petSearch.value
            .trim()
            .toLowerCase();


    const typeValue =
        petTypeFilter.value;


    const filteredPets =
        pets.filter(pet => {

            const matchesSearch =

                pet.name
                    .toLowerCase()
                    .includes(searchValue)

                ||

                pet.breed
                    .toLowerCase()
                    .includes(searchValue)

                ||

                pet.type
                    .toLowerCase()
                    .includes(searchValue);


            const matchesType =

                typeValue === "all"

                ||

                pet.type === typeValue;


            return (
                matchesSearch &&
                matchesType
            );

        });


    renderPets(filteredPets);

}


if (petSearch) {

    petSearch.addEventListener(
        "input",
        filterPets
    );

}


if (petTypeFilter) {

    petTypeFilter.addEventListener(
        "change",
        filterPets
    );

}


/* =========================================
   ADD PET MODAL
========================================= */

function openAddPetModal() {

    if (!addPetModal) {
        return;
    }


    addPetModal.style.display =
        "flex";


    document.body.style.overflow =
        "hidden";

}


function closePetModal() {

    if (!addPetModal) {
        return;
    }


    addPetModal.style.display =
        "none";


    document.body.style.overflow =
        "";

}


/* =========================================
   ADD PET BUTTON
   IMPORTANT:
   The top "Add New Pet" is an <a>
   in your HTML, so we keep it as navigation.
========================================= */

if (emptyAddPetButton) {

    emptyAddPetButton.addEventListener(
        "click",
        openAddPetModal
    );

}


/* =========================================
   CLOSE MODAL
========================================= */

if (closeAddPetModal) {

    closeAddPetModal.addEventListener(
        "click",
        closePetModal
    );

}


if (cancelAddPet) {

    cancelAddPet.addEventListener(
        "click",
        closePetModal
    );

}


/* =========================================
   PHOTO PREVIEW
========================================= */

if (petPhotoInput) {

    petPhotoInput.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];


            if (!file) {
                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function () {

                    if (petPhotoPreview) {

                        petPhotoPreview.innerHTML = `

                            <img
                                src="${reader.result}"
                                alt="Pet preview"
                            >

                        `;

                    }

                };


            reader.readAsDataURL(file);

        }
    );

}


/* =========================================
   ADD PET FORM
========================================= */

if (addPetForm) {

    addPetForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const name =
                document
                    .getElementById("petName")
                    .value
                    .trim();


            const type =
                document
                    .getElementById("petType")
                    .value;


            const breed =
                document
                    .getElementById("petBreed")
                    .value
                    .trim();


            const age =
                document
                    .getElementById("petAge")
                    .value
                    .trim();


            const gender =
                document
                    .getElementById("petGender")
                    .value;


            const weight =
                document
                    .getElementById("petWeight")
                    .value
                    .trim();


            if (
                !name ||
                !type ||
                !breed ||
                !age ||
                !gender
            ) {

                alert(
                    "Please fill all required fields."
                );

                return;

            }


            let image =
                "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80";


            if (
                petPhotoPreview &&
                petPhotoPreview.querySelector("img")
            ) {

                image =
                    petPhotoPreview
                        .querySelector("img")
                        .src;

            }


            const newPet = {

                id:
                    Date.now(),

                name:
                    name,

                type:
                    type,

                breed:
                    breed,

                age:
                    age,

                gender:
                    gender,

                weight:
                    weight || "Not added",

                score:
                    0,

                image:
                    image

            };


            pets.push(newPet);


            updatePetCount();

            filterPets();

            closePetModal();


            addPetForm.reset();


            if (petPhotoPreview) {

                petPhotoPreview.innerHTML =
                    "🐾";

            }


            alert(
                `${name} has been added successfully!`
            );

        }
    );

}


/* =========================================
   UPDATE PET COUNT
========================================= */

function updatePetCount() {

    if (petCount) {

        petCount.textContent =
            pets.length;

    }

}


/* =========================================
   CLOSE MODAL BY CLICKING OUTSIDE
========================================= */

if (addPetModal) {

    addPetModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                addPetModal
            ) {

                closePetModal();

            }

        }
    );

}


/* =========================================
   ESC KEY
========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            addPetModal &&
            addPetModal.style.display === "flex"
        ) {

            closePetModal();

        }

    }
);


/* =========================================
   INITIALIZE MY PETS PAGE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderPets(pets);

        updatePetCount();

    }
);