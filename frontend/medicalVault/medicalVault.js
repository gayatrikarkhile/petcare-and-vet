/* =========================================
   PAWSYNC - MEDICAL VAULT
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
   DOCUMENT DATA
========================================= */

let documents = [

    {
        id: 1,

        petId: 1,

        title:
            "Rabies Vaccination Certificate",

        type:
            "vaccination",

        date:
            "2026-07-18",

        doctor:
            "Dr. Anjali Sharma",

        fileType:
            "PDF",

        fileSize:
            "1.2 MB",

        icon:
            "💉"
    },


    {
        id: 2,

        petId: 1,

        title:
            "General Health Checkup",

        type:
            "medical",

        date:
            "2026-06-10",

        doctor:
            "Dr. Rahul Patil",

        fileType:
            "PDF",

        fileSize:
            "2.4 MB",

        icon:
            "🩺"
    },


    {
        id: 3,

        petId: 1,

        title:
            "Blood Test Report",

        type:
            "lab",

        date:
            "2026-05-22",

        doctor:
            "PawCare Diagnostics",

        fileType:
            "PDF",

        fileSize:
            "890 KB",

        icon:
            "🧪"
    },


    {
        id: 4,

        petId: 2,

        title:
            "Vaccination Record",

        type:
            "vaccination",

        date:
            "2026-07-05",

        doctor:
            "Dr. Neha Kulkarni",

        fileType:
            "PDF",

        fileSize:
            "1.1 MB",

        icon:
            "💉"
    },


    {
        id: 5,

        petId: 2,

        title:
            "Skin Treatment Prescription",

        type:
            "prescription",

        date:
            "2026-06-14",

        doctor:
            "Dr. Neha Kulkarni",

        fileType:
            "JPG",

        fileSize:
            "620 KB",

        icon:
            "💊"
    },


    {
        id: 6,

        petId: 3,

        title:
            "Annual Health Report",

        type:
            "medical",

        date:
            "2026-05-29",

        doctor:
            "Dr. Priya Mehta",

        fileType:
            "PDF",

        fileSize:
            "1.8 MB",

        icon:
            "🩺"
    }

];


/* =========================================
   STATE
========================================= */

let selectedPetId =
    pets.length > 0
        ? pets[0].id
        : null;


let selectedDocumentType =
    "all";


let searchTerm =
    "";


/* =========================================
   DOM ELEMENTS
========================================= */

const petCategoryGrid =
    document.getElementById(
        "petCategoryGrid"
    );


const selectedPetName =
    document.getElementById(
        "selectedPetName"
    );


const selectedPetInfo =
    document.getElementById(
        "selectedPetInfo"
    );


const documentCount =
    document.getElementById(
        "documentCount"
    );


const documentTabs =
    document.getElementById(
        "documentTabs"
    );


const documentSearch =
    document.getElementById(
        "documentSearch"
    );


const documentList =
    document.getElementById(
        "documentList"
    );


const emptyDocumentState =
    document.getElementById(
        "emptyDocumentState"
    );


const openUploadModal =
    document.getElementById(
        "openUploadModal"
    );


const uploadModal =
    document.getElementById(
        "uploadModal"
    );


const closeUploadModal =
    document.getElementById(
        "closeUploadModal"
    );


const cancelUpload =
    document.getElementById(
        "cancelUpload"
    );


const uploadDocumentForm =
    document.getElementById(
        "uploadDocumentForm"
    );


const documentPet =
    document.getElementById(
        "documentPet"
    );


const documentType =
    document.getElementById(
        "documentType"
    );


const documentTitle =
    document.getElementById(
        "documentTitle"
    );


const documentDate =
    document.getElementById(
        "documentDate"
    );


const documentDoctor =
    document.getElementById(
        "documentDoctor"
    );


const documentFile =
    document.getElementById(
        "documentFile"
    );


const documentDescription =
    document.getElementById(
        "documentDescription"
    );


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderPetCategories();

        populatePetSelect();

        updateSelectedPet();

        setupDocumentTabs();

        setupSearch();

        setupUploadModal();

        setupUploadForm();

    }
);


/* =========================================
   RENDER PET CATEGORIES
========================================= */

function renderPetCategories() {

    if (!petCategoryGrid) {
        return;
    }


    petCategoryGrid.innerHTML = "";


    pets.forEach(pet => {

        const card =
            document.createElement("button");


        card.type =
            "button";


        card.className =
            "pet-category-card";


        if (
            pet.id === selectedPetId
        ) {

            card.classList.add(
                "active"
            );

        }


        card.dataset.petId =
            pet.id;


        card.innerHTML = `

            <div class="pet-category-image">

                <img
                    src="${pet.image}"
                    alt="${pet.name}"
                >

            </div>


            <div class="pet-category-info">

                <h3>
                    ${pet.name}
                </h3>

                <p>
                    ${pet.breed} • ${pet.age}
                </p>

                <span>
                    ${getPetDocumentCount(pet.id)}
                    Documents
                </span>

            </div>

        `;


        card.addEventListener(
            "click",
            () => {

                selectedPetId =
                    pet.id;


                selectedDocumentType =
                    "all";


                searchTerm =
                    "";


                if (documentSearch) {

                    documentSearch.value =
                        "";

                }


                resetDocumentTabs();

                renderPetCategories();

                updateSelectedPet();

            }
        );


        petCategoryGrid.appendChild(
            card
        );

    });

}


/* =========================================
   PET DOCUMENT COUNT
========================================= */

function getPetDocumentCount(
    petId
) {

    return documents.filter(
        document =>
            document.petId === petId
    ).length;

}


/* =========================================
   POPULATE PET SELECT
========================================= */

function populatePetSelect() {

    if (!documentPet) {
        return;
    }


    documentPet.innerHTML = "";


    pets.forEach(pet => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            pet.id;


        option.textContent =
            pet.name;


        documentPet.appendChild(
            option
        );

    });


    if (selectedPetId) {

        documentPet.value =
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
                item.id === selectedPetId
        );


    if (!pet) {

        if (selectedPetName) {

            selectedPetName.textContent =
                "No Pet Selected";

        }


        if (selectedPetInfo) {

            selectedPetInfo.textContent =
                "";

        }


        renderDocuments([]);

        return;

    }


    if (selectedPetName) {

        selectedPetName.textContent =
            pet.name;

    }


    if (selectedPetInfo) {

        selectedPetInfo.textContent =
            `${pet.breed} • ${pet.age}`;

    }


    if (documentPet) {

        documentPet.value =
            pet.id;

    }


    renderDocuments();

}


/* =========================================
   RENDER DOCUMENTS
========================================= */

function renderDocuments() {

    if (!documentList) {
        return;
    }


    let filteredDocuments =
        documents.filter(
            document =>
                document.petId ===
                selectedPetId
        );


    /* -------------------------------
       DOCUMENT TYPE FILTER
    -------------------------------- */

    if (
        selectedDocumentType !==
        "all"
    ) {

        filteredDocuments =
            filteredDocuments.filter(
                document =>
                    document.type ===
                    selectedDocumentType
            );

    }


    /* -------------------------------
       SEARCH FILTER
    -------------------------------- */

    if (searchTerm) {

        const search =
            searchTerm.toLowerCase();


        filteredDocuments =
            filteredDocuments.filter(
                document =>

                    document.title
                        .toLowerCase()
                        .includes(search)

                    ||

                    document.doctor
                        .toLowerCase()
                        .includes(search)

                    ||

                    document.fileType
                        .toLowerCase()
                        .includes(search)

            );

    }


    /* -------------------------------
       UPDATE COUNT
    -------------------------------- */

    if (documentCount) {

        documentCount.textContent =
            filteredDocuments.length;

    }


    documentList.innerHTML = "";


    /* -------------------------------
       EMPTY STATE
    -------------------------------- */

    if (
        filteredDocuments.length === 0
    ) {

        if (emptyDocumentState) {

            emptyDocumentState.hidden =
                false;

        }

        return;

    }


    if (emptyDocumentState) {

        emptyDocumentState.hidden =
            true;

    }


    /* -------------------------------
       CREATE DOCUMENT CARDS
    -------------------------------- */

    filteredDocuments.forEach(
        document => {

            const card =
                createDocumentCard(
                    document
                );


            documentList.appendChild(
                card
            );

        }
    );

}


/* =========================================
   CREATE DOCUMENT CARD
========================================= */

function createDocumentCard(
    document
) {

    const card =
        documentElement(
            "div"
        );


    card.className =
        "document-card";


    card.dataset.documentId =
        document.id;


    card.innerHTML = `

        <div class="document-icon">
            ${document.icon}
        </div>


        <div class="document-info">

            <h3>
                ${document.title}
            </h3>

            <p>
                ${document.doctor}
            </p>


            <div class="document-meta">

                <span>
                    ${formatDate(document.date)}
                </span>

                <span>
                    ${capitalizeType(document.type)}
                </span>

            </div>

        </div>


        <div class="document-file">

            <span class="file-badge">
                ${document.fileType}
            </span>

            <span class="file-size">
                ${document.fileSize}
            </span>

        </div>


        <div class="document-actions">

            <button
                type="button"
                class="view-document-button"
                data-document-id="${document.id}"
            >
                View
            </button>


            <button
                type="button"
                class="delete-document-button"
                data-document-id="${document.id}"
                aria-label="Delete document"
            >
                ×
            </button>

        </div>

    `;


    const viewButton =
        card.querySelector(
            ".view-document-button"
        );


    const deleteButton =
        card.querySelector(
            ".delete-document-button"
        );


    if (viewButton) {

        viewButton.addEventListener(
            "click",
            () => {

                viewDocument(
                    document.id
                );

            }
        );

    }


    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            () => {

                deleteDocument(
                    document.id
                );

            }
        );

    }


    return card;

}


/* =========================================
   CREATE ELEMENT HELPER
========================================= */

function documentElement(
    tagName
) {

    return document.createElement(
        tagName
    );

}


/* =========================================
   DOCUMENT TABS
========================================= */

function setupDocumentTabs() {

    if (!documentTabs) {
        return;
    }


    const tabs =
        documentTabs.querySelectorAll(
            ".document-tab"
        );


    tabs.forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                tabs.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                tab.classList.add(
                    "active"
                );


                selectedDocumentType =
                    tab.dataset.type ||
                    "all";


                renderDocuments();

            }
        );

    });

}


/* =========================================
   RESET DOCUMENT TABS
========================================= */

function resetDocumentTabs() {

    if (!documentTabs) {
        return;
    }


    const tabs =
        documentTabs.querySelectorAll(
            ".document-tab"
        );


    tabs.forEach(tab => {

        tab.classList.remove(
            "active"
        );


        if (
            tab.dataset.type ===
            "all"
        ) {

            tab.classList.add(
                "active"
            );

        }

    });

}


/* =========================================
   SEARCH
========================================= */

function setupSearch() {

    if (!documentSearch) {
        return;
    }


    documentSearch.addEventListener(
        "input",
        () => {

            searchTerm =
                documentSearch.value
                    .trim()
                    .toLowerCase();


            renderDocuments();

        }
    );

}


/* =========================================
   VIEW DOCUMENT
========================================= */

function viewDocument(
    documentId
) {

    const documentItem =
        documents.find(
            item =>
                item.id === documentId
        );


    if (!documentItem) {
        return;
    }


    alert(

        `${documentItem.title}\n\n` +

        `Type: ${capitalizeType(
            documentItem.type
        )}\n` +

        `Date: ${formatDate(
            documentItem.date
        )}\n` +

        `Doctor/Clinic: ${
            documentItem.doctor
        }\n` +

        `File: ${
            documentItem.fileType
        } (${documentItem.fileSize})`

    );

}


/* =========================================
   DELETE DOCUMENT
========================================= */

function deleteDocument(
    documentId
) {

    const documentItem =
        documents.find(
            item =>
                item.id === documentId
        );


    if (!documentItem) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${documentItem.title}"?`
        );


    if (!confirmed) {
        return;
    }


    documents =
        documents.filter(
            item =>
                item.id !== documentId
        );


    renderPetCategories();

    renderDocuments();

}


/* =========================================
   UPLOAD MODAL
========================================= */

function setupUploadModal() {

    if (!uploadModal) {
        return;
    }


    if (openUploadModal) {

        openUploadModal.addEventListener(
            "click",
            () => {

                openModal();

            }
        );

    }


    if (closeUploadModal) {

        closeUploadModal.addEventListener(
            "click",
            () => {

                closeModal();

            }
        );

    }


    if (cancelUpload) {

        cancelUpload.addEventListener(
            "click",
            () => {

                closeModal();

            }
        );

    }


    uploadModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                uploadModal
            ) {

                closeModal();

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                !uploadModal.hidden
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

    if (!uploadModal) {
        return;
    }


    if (documentPet) {

        documentPet.value =
            selectedPetId;

    }


    uploadModal.hidden =
        false;


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================
   CLOSE MODAL
========================================= */

function closeModal() {

    if (!uploadModal) {
        return;
    }


    uploadModal.hidden =
        true;


    document.body.classList.remove(
        "modal-open"
    );

}


/* =========================================
   UPLOAD FORM
========================================= */

function setupUploadForm() {

    if (!uploadDocumentForm) {
        return;
    }


    uploadDocumentForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const petId =
                Number(
                    documentPet.value
                );


            const pet =
                pets.find(
                    item =>
                        item.id === petId
                );


            if (!pet) {

                alert(
                    "Please select a pet."
                );

                return;

            }


            const type =
                documentType.value;


            const title =
                documentTitle.value.trim();


            const date =
                documentDate.value;


            const doctor =
                documentDoctor.value.trim()
                ||
                "Not specified";


            const file =
                documentFile.files[0];


            if (
                !type ||
                !title ||
                !date ||
                !file
            ) {

                alert(
                    "Please complete all required fields."
                );

                return;

            }


            const fileExtension =
                getFileExtension(
                    file.name
                );


            const newDocument = {

                id:
                    Date.now(),

                petId:
                    petId,

                title:
                    title,

                type:
                    type,

                date:
                    date,

                doctor:
                    doctor,

                fileType:
                    fileExtension,

                fileSize:
                    formatFileSize(
                        file.size
                    ),

                icon:
                    getDocumentIcon(
                        type
                    )

            };


            documents.push(
                newDocument
            );


            selectedPetId =
                petId;


            selectedDocumentType =
                "all";


            searchTerm =
                "";


            if (documentSearch) {

                documentSearch.value =
                    "";

            }


            resetDocumentTabs();

            renderPetCategories();

            updateSelectedPet();

            uploadDocumentForm.reset();

            closeModal();


            alert(
                "Document uploaded successfully."
            );

        }
    );

}


/* =========================================
   FILE EXTENSION
========================================= */

function getFileExtension(
    fileName
) {

    const parts =
        fileName.split(".");


    if (
        parts.length < 2
    ) {

        return "FILE";

    }


    return parts[
        parts.length - 1
    ]
        .toUpperCase();

}


/* =========================================
   FILE SIZE
========================================= */

function formatFileSize(
    bytes
) {

    if (bytes < 1024) {

        return `${bytes} B`;

    }


    if (
        bytes <
        1024 * 1024
    ) {

        return `${(
            bytes / 1024
        ).toFixed(1)} KB`;

    }


    return `${(
        bytes /
        (1024 * 1024)
    ).toFixed(1)} MB`;

}


/* =========================================
   DOCUMENT ICON
========================================= */

function getDocumentIcon(
    type
) {

    const icons = {

        vaccination: "💉",

        medical: "🩺",

        prescription: "💊",

        lab: "🧪",

        discharge: "📋",

        xray: "🩻",

        history: "📑",

        other: "📄"

    };


    return (
        icons[type] ||
        "📄"
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
        new Date(
            dateString
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

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
   CAPITALIZE DOCUMENT TYPE
========================================= */

function capitalizeType(
    type
) {

    if (!type) {
        return "";
    }


    return type
        .replace(
            /-/g,
            " "
        )
        .replace(
            /\b\w/g,
            character =>
                character.toUpperCase()
        );

}