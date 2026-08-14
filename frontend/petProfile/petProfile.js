/* =========================================
   PAWSYNC PET PROFILE
   FRONTEND ONLY
========================================= */


const pets = {

    bruno: {

        name: "Bruno",

        type: "DOG",

        species: "Dog",

        breed: "Labrador Retriever",

        age: "2 Years",

        gender: "Male",

        weight: "20 kg",

        score: 61,

        image:
            "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80"

    },


    kitty: {

        name: "Kitty",

        type: "CAT",

        species: "Cat",

        breed: "Persian Cat",

        age: "1 Year",

        gender: "Female",

        weight: "4.5 kg",

        score: 86,

        image:
            "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=900&q=80"

    },


    coco: {

        name: "Coco",

        type: "BIRD",

        species: "Bird",

        breed: "Eclectus Parrot",

        age: "3 Years",

        gender: "Male",

        weight: "420 g",

        score: 92,

        image:
            "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=900&q=80"

    }

};


/* =========================================
   GET SELECTED PET
========================================= */

const selectedPet =
    localStorage.getItem(
        "pawsyncSelectedPet"
    ) || "bruno";


const pet =
    pets[selectedPet] || pets.bruno;


/* =========================================
   LOAD PET
========================================= */

function loadPetProfile() {

    document.getElementById(
        "petImage"
    ).src = pet.image;


    document.getElementById(
        "petImage"
    ).alt = pet.name;


    document.getElementById(
        "petName"
    ).textContent = pet.name;


    document.getElementById(
        "petType"
    ).textContent = pet.type;


    document.getElementById(
        "petBreed"
    ).textContent = pet.breed;


    document.getElementById(
        "petAge"
    ).textContent = pet.age;


    document.getElementById(
        "petGender"
    ).textContent = pet.gender;


    document.getElementById(
        "petWeight"
    ).textContent = pet.weight;


    document.getElementById(
        "healthScore"
    ).textContent = pet.score;


    document.getElementById(
        "scoreProgress"
    ).style.width =
        `${pet.score}%`;


    document.getElementById(
        "infoName"
    ).textContent = pet.name;


    document.getElementById(
        "infoSpecies"
    ).textContent = pet.species;


    document.getElementById(
        "infoBreed"
    ).textContent = pet.breed;


    document.getElementById(
        "infoGender"
    ).textContent = pet.gender;


    document.getElementById(
        "infoAge"
    ).textContent = pet.age;


    document.getElementById(
        "infoWeight"
    ).textContent = pet.weight;


    const healthStatus =
        document.getElementById(
            "healthStatus"
        );


    if (pet.score >= 85) {

        healthStatus.textContent =
            "Excellent Health";

        healthStatus.style.color =
            "#148b73";

    }

    else if (pet.score >= 70) {

        healthStatus.textContent =
            "Good Health";

        healthStatus.style.color =
            "#148b73";

    }

    else {

        healthStatus.textContent =
            "Needs Attention";

        healthStatus.style.color =
            "#d58b24";

    }


    document.getElementById(
        "todayCareText"
    ).textContent =
        `${pet.name}'s daily care routine`;

}


/* =========================================
   BACK BUTTON
========================================= */

document.getElementById(
    "backButton"
).addEventListener(
    "click",
    () => {

        window.location.href =
            "/frontend/pets/pets.html";

    }
);


/* =========================================
   EDIT BUTTON
========================================= */

document.querySelector(
    ".edit-button"
).addEventListener(
    "click",
    () => {

        alert(
            `${pet.name}'s edit profile will be connected next.`
        );

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
    loadPetProfile
);