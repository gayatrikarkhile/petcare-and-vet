// =========================================================
// PAWSYNC — MEDICAL VAULT
// DYNAMIC VERSION
// =========================================================

let pets = [];
let documents = [];

let selectedPetId = null;
let selectedDocumentType = "all";
let searchTerm = "";


// =========================================================
// DOM ELEMENTS
// =========================================================

const petCategoryGrid =
    document.getElementById("petCategoryGrid");

const selectedPetName =
    document.getElementById("selectedPetName");

const selectedPetInfo =
    document.getElementById("selectedPetInfo");

const documentCount =
    document.getElementById("documentCount");

const documentTabs =
    document.getElementById("documentTabs");

const documentSearch =
    document.getElementById("documentSearch");

const documentList =
    document.getElementById("documentList");

const emptyDocumentState =
    document.getElementById("emptyDocumentState");

const openUploadModal =
    document.getElementById("openUploadModal");

const uploadModal =
    document.getElementById("uploadModal");

const closeUploadModal =
    document.getElementById("closeUploadModal");

const cancelUpload =
    document.getElementById("cancelUpload");

const uploadDocumentForm =
    document.getElementById("uploadDocumentForm");

const documentPet =
    document.getElementById("documentPet");

const documentType =
    document.getElementById("documentType");

const documentTitle =
    document.getElementById("documentTitle");

const documentDate =
    document.getElementById("documentDate");

const documentDoctor =
    document.getElementById("documentDoctor");

const documentFile =
    document.getElementById("documentFile");

const documentDescription =
    document.getElementById("documentDescription");


// =========================================================
// INITIALIZE
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadPets();

        setupDocumentTabs();

        setupSearch();

        setupUploadModal();

        setupUploadForm();

    }
);


// =========================================================
// GET AUTH TOKEN
// =========================================================

function getToken() {

    return localStorage.getItem(
        "pawsyncToken"
    );

}


// =========================================================
// API REQUEST HELPER
// =========================================================

async function apiRequest(
    url,
    options = {}
) {

    const token =
        getToken();

    if (!token) {

        alert(
            "Please login first."
        );

        return null;

    }


    options.headers =
        options.headers || {};


    options.headers.Authorization =
        `Bearer ${token}`;


    if (url.startsWith("http://localhost:5000/api")) {
        url = url.replace("http://localhost:5000/api", "/api");
    }

    const response =
        await fetch(
            url,
            options
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Request failed"
        );

    }


    return data;

}


// =========================================================
// LOAD PETS FROM BACKEND
// =========================================================

async function loadPets() {

    try {

        console.log(
            "Loading pets from backend..."
        );


        const data =
            await apiRequest(
                "/api/pets"
            );


        if (!data) {
            return;
        }


        console.log(
            "PETS FROM BACKEND:",
            data
        );


        pets =
            (data.pets || []).map(
                normalizePet
            );


        console.log(
            "NORMALIZED PETS:",
            pets
        );


        if (
            pets.length === 0
        ) {

            renderPetCategories();

            showNoPetsMessage();

            return;

        }


        selectedPetId =
            pets[0].id;


        populatePetSelect();

        renderPetCategories();

        await loadDocumentsForSelectedPet();

    }

    catch (error) {

        console.error(
            "LOAD PETS ERROR:",
            error
        );


        if (petCategoryGrid) {

            petCategoryGrid.innerHTML = `

                <div class="empty-document-state">

                    <div class="empty-document-icon">
                        ⚠️
                    </div>

                    <h3>
                        Unable to load pets
                    </h3>

                    <p>
                        ${error.message}
                    </p>

                </div>

            `;

        }

    }

}


// =========================================================
// NORMALIZE PET DATA
// =========================================================

function normalizePet(pet) {

    const weightValue =
        pet.currentWeight?.value ??
        pet.weight ??
        0;


    const weightUnit =
        pet.currentWeight?.unit ??
        pet.weightUnit ??
        "kg";


    return {

        id:
            pet._id,

        name:
            pet.petName ||
            pet.name ||
            "Unnamed Pet",

        species:
            pet.species ||
            "Pet",

        breed:
            pet.breed ||
            "Unknown breed",

        gender:
            pet.gender ||
            "",

        dateOfBirth:
            pet.dateOfBirth ||
            pet.dob ||
            "",

        weight:
            weightValue,

        weightUnit:
            weightUnit,

        image:
            pet.petPhoto ||
            "",

        age:
            calculateAge(
                pet.dateOfBirth ||
                pet.dob
            )

    };

}


// =========================================================
// CALCULATE PET AGE
// =========================================================

function calculateAge(
    dateOfBirth
) {

    if (!dateOfBirth) {

        return "Age not available";

    }


    const dob =
        new Date(
            dateOfBirth
        );


    if (
        Number.isNaN(
            dob.getTime()
        )
    ) {

        return "Age not available";

    }


    const today =
        new Date();


    let years =
        today.getFullYear() -
        dob.getFullYear();


    let months =
        today.getMonth() -
        dob.getMonth();


    if (
        months < 0 ||
        (
            months === 0 &&
            today.getDate() <
            dob.getDate()
        )
    ) {

        years--;

        months += 12;

    }


    if (years > 0) {

        return `${years} ${
            years === 1
                ? "Year"
                : "Years"
        }`;

    }


    if (months > 0) {

        return `${months} ${
            months === 1
                ? "Month"
                : "Months"
        }`;

    }


    return "Less than 1 Month";

}


// =========================================================
// LOAD DOCUMENTS FOR SELECTED PET
// =========================================================

async function loadDocumentsForSelectedPet() {

    if (!selectedPetId) {
        return;
    }


    try {

        console.log(
            "Loading documents for pet:",
            selectedPetId
        );


        const data =
            await apiRequest(
                `/api/medical-documents/pet/${selectedPetId}`
            );


        if (!data) {
            return;
        }


        console.log(
            "MEDICAL DOCUMENTS:",
            data
        );


        documents =
            (data.documents || []).map(
                normalizeDocument
            );


        updateSelectedPet();

        renderPetCategories();

        renderDocuments();

    }

    catch (error) {

        console.error(
            "LOAD DOCUMENTS ERROR:",
            error
        );


        documents = [];

        updateSelectedPet();

        renderDocuments();

    }

}


// =========================================================
// NORMALIZE DOCUMENT
// =========================================================

function normalizeDocument(
    document
) {

    return {

        id:
            document._id,

        petId:
            document.petId?._id ||
            document.petId,

        title:
            document.title ||
            "Untitled Document",

        type:
            document.type ||
            "other",

        date:
            document.documentDate ||
            document.date ||
            document.createdAt,

        doctor:
            document.doctor ||
            "Not specified",

        fileType:
            getFileType(
                document.fileType
            ),

        fileSize:
            formatFileSize(
                document.fileSize
            ),

        fileUrl:
            document.fileUrl ||
            "",

        description:
            document.description ||
            "",

        icon:
            getDocumentIcon(
                document.type
            )

    };

}


// =========================================================
// RENDER PET CARDS
// =========================================================

function renderPetCategories() {

    if (!petCategoryGrid) {
        return;
    }


    petCategoryGrid.innerHTML = "";


    pets.forEach(
        pet => {

            const card =
                document.createElement(
                    "button"
                );


            card.type =
                "button";


            card.className =
                "pet-category-card";


            if (
                pet.id ===
                selectedPetId
            ) {

                card.classList.add(
                    "active"
                );

            }


            card.dataset.petId =
                pet.id;


            const imageHTML =
                pet.image

                    ? `
                        <img
                            src="${pet.image}"
                            alt="${escapeHTML(
                                pet.name
                            )}"
                            onerror="
                                this.style.display='none'
                            "
                        >
                      `

                    : `
                        <div class="pet-placeholder">
                            🐾
                        </div>
                      `;


            card.innerHTML = `

                <div class="pet-category-image">

                    ${imageHTML}

                </div>


                <div class="pet-category-info">

                    <h3>
                        ${escapeHTML(
                            pet.name
                        )}
                    </h3>


                    <p>
                        ${escapeHTML(
                            pet.breed
                        )}
                        •
                        ${escapeHTML(
                            pet.age
                        )}
                    </p>


                    <span>

                        ${getPetDocumentCount(
                            pet.id
                        )}

                        ${
                            getPetDocumentCount(
                                pet.id
                            ) === 1
                                ? "Document"
                                : "Documents"
                        }

                    </span>

                </div>

            `;


            card.addEventListener(
                "click",
                async () => {

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

                    await loadDocumentsForSelectedPet();

                }
            );


            petCategoryGrid.appendChild(
                card
            );

        }
    );

}


// =========================================================
// DOCUMENT COUNT
// =========================================================

function getPetDocumentCount(
    petId
) {

    return documents.filter(
        document =>
            document.petId ===
            petId
    ).length;

}


// =========================================================
// POPULATE PET SELECT
// =========================================================

function populatePetSelect() {

    if (!documentPet) {
        return;
    }


    documentPet.innerHTML = "";


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


            documentPet.appendChild(
                option
            );

        }
    );


    if (selectedPetId) {

        documentPet.value =
            selectedPetId;

    }


    documentPet.addEventListener(
        "change",
        async () => {

            selectedPetId =
                documentPet.value;


            selectedDocumentType =
                "all";


            resetDocumentTabs();

            renderPetCategories();

            await loadDocumentsForSelectedPet();

        }
    );

}


// =========================================================
// UPDATE SELECTED PET
// =========================================================

function updateSelectedPet() {

    const pet =
        pets.find(
            item =>
                item.id ===
                selectedPetId
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


        return;

    }


    if (selectedPetName) {

        selectedPetName.textContent =
            pet.name;

    }


    if (selectedPetInfo) {

        selectedPetInfo.textContent =
            `${pet.breed} • ${pet.age} • ${pet.gender} • ${pet.weight} ${pet.weightUnit}`;

    }


    if (documentPet) {

        documentPet.value =
            pet.id;

    }


    if (documentCount) {

        documentCount.textContent =
            documents.length;

    }

}


// =========================================================
// RENDER DOCUMENTS
// =========================================================

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


    // -------------------------------------------------------
    // TYPE FILTER
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // SEARCH
    // -------------------------------------------------------

    if (searchTerm) {

        filteredDocuments =
            filteredDocuments.filter(
                document => {

                    const title =
                        (
                            document.title ||
                            ""
                        ).toLowerCase();


                    const doctor =
                        (
                            document.doctor ||
                            ""
                        ).toLowerCase();


                    const fileType =
                        (
                            document.fileType ||
                            ""
                        ).toLowerCase();


                    return (

                        title.includes(
                            searchTerm
                        )

                        ||

                        doctor.includes(
                            searchTerm
                        )

                        ||

                        fileType.includes(
                            searchTerm
                        )

                    );

                }
            );

    }


    // -------------------------------------------------------
    // COUNT
    // -------------------------------------------------------

    if (documentCount) {

        documentCount.textContent =
            filteredDocuments.length;

    }


    documentList.innerHTML = "";


    // -------------------------------------------------------
    // EMPTY
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // CREATE CARDS
    // -------------------------------------------------------

    filteredDocuments.forEach(
        document => {

            documentList.appendChild(
                createDocumentCard(
                    document
                )
            );

        }
    );

}


// =========================================================
// CREATE DOCUMENT CARD
// =========================================================

function createDocumentCard(
    document
) {

    const card =
        document.createElement
            ? null
            : null;

    const element =
        documentElement(
            "div"
        );


    element.className =
        "document-card";


    element.dataset.documentId =
        document.id;


    element.innerHTML = `

        <div class="document-icon">

            ${document.icon}

        </div>


        <div class="document-info">

            <h3>
                ${escapeHTML(
                    document.title
                )}
            </h3>


            <p>
                ${escapeHTML(
                    document.doctor
                )}
            </p>


            <div class="document-meta">

                <span>
                    ${formatDate(
                        document.date
                    )}
                </span>


                <span>
                    ${capitalizeType(
                        document.type
                    )}
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
            >
                View
            </button>


            <button
                type="button"
                class="delete-document-button"
                aria-label="Delete document"
            >
                ×
            </button>

        </div>

    `;


    const viewButton =
        element.querySelector(
            ".view-document-button"
        );


    const deleteButton =
        element.querySelector(
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


    return element;

}


// =========================================================
// CREATE ELEMENT
// =========================================================

function documentElement(
    tagName
) {

    return document.createElement(
        tagName
    );

}


// =========================================================
// DOCUMENT TABS
// =========================================================

function setupDocumentTabs() {

    if (!documentTabs) {
        return;
    }


    const tabs =
        documentTabs.querySelectorAll(
            ".document-tab"
        );


    tabs.forEach(
        tab => {

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

        }
    );

}


// =========================================================
// RESET TABS
// =========================================================

function resetDocumentTabs() {

    if (!documentTabs) {
        return;
    }


    const tabs =
        documentTabs.querySelectorAll(
            ".document-tab"
        );


    tabs.forEach(
        tab => {

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

        }
    );

}


// =========================================================
// SEARCH
// =========================================================

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


// =========================================================
// VIEW DOCUMENT
// =========================================================

function viewDocument(
    documentId
) {

    const documentItem =
        documents.find(
            item =>
                item.id ===
                documentId
        );


    if (!documentItem) {
        return;
    }


    if (
        documentItem.fileUrl
    ) {

        window.open(
            documentItem.fileUrl,
            "_blank"
        );

        return;

    }


    alert(
        "Document file is not available."
    );

}


// =========================================================
// DELETE DOCUMENT
// =========================================================

async function deleteDocument(
    documentId
) {

    const documentItem =
        documents.find(
            item =>
                item.id ===
                documentId
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


    try {

        const data =
            await apiRequest(
                `/api/medical-documents/${documentId}`,
                {
                    method:
                        "DELETE"
                }
            );


        if (!data) {
            return;
        }


        alert(
            "Document deleted successfully."
        );


        await loadDocumentsForSelectedPet();

    }

    catch (error) {

        console.error(
            "DELETE DOCUMENT ERROR:",
            error
        );


        alert(
            error.message ||
            "Unable to delete document."
        );

    }

}


// =========================================================
// UPLOAD MODAL
// =========================================================

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


// =========================================================
// OPEN MODAL
// =========================================================

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


// =========================================================
// CLOSE MODAL
// =========================================================

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


// =========================================================
// UPLOAD DOCUMENT TO BACKEND
// =========================================================

function setupUploadForm() {

    if (!uploadDocumentForm) {
        return;
    }


    uploadDocumentForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const petId =
                documentPet.value;


            const type =
                documentType.value;


            const title =
                documentTitle.value.trim();


            const date =
                documentDate.value;


            const doctor =
                documentDoctor.value.trim();


            const description =
                documentDescription
                    ? documentDescription.value.trim()
                    : "";


            const file =
                documentFile.files[0];


            // ------------------------------------------------
            // VALIDATION
            // ------------------------------------------------

            if (!petId) {

                alert(
                    "Please select a pet."
                );

                return;

            }


            if (!type) {

                alert(
                    "Please select document type."
                );

                return;

            }


            if (!title) {

                alert(
                    "Please enter document name."
                );

                return;

            }


            if (!date) {

                alert(
                    "Please select document date."
                );

                return;

            }


            if (!file) {

                alert(
                    "Please select a file."
                );

                return;

            }


            // ------------------------------------------------
            // CREATE FORMDATA
            // ------------------------------------------------

            const formData =
                new FormData();


            formData.append(
                "petId",
                petId
            );


            formData.append(
                "type",
                type
            );


            formData.append(
                "title",
                title
            );


            formData.append(
                "documentDate",
                date
            );


            formData.append(
                "doctor",
                doctor
            );


            formData.append(
                "description",
                description
            );


            formData.append(
                "document",
                file
            );


            console.log(
                "Uploading medical document..."
            );


            // ------------------------------------------------
            // DISABLE BUTTON
            // ------------------------------------------------

            const submitButton =
                uploadDocumentForm.querySelector(
                    'button[type="submit"]'
                );


            const originalText =
                submitButton
                    ? submitButton.textContent
                    : "";


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Uploading...";

            }


            try {

                const data =
                    await apiRequest(
                        "/api/medical-documents",
                        {
                            method:
                                "POST",

                            body:
                                formData
                        }
                    );


                if (!data) {
                    return;
                }


                console.log(
                    "DOCUMENT UPLOAD RESPONSE:",
                    data
                );


                alert(
                    "Document uploaded successfully!"
                );


                uploadDocumentForm.reset();

                closeModal();


                selectedPetId =
                    petId;


                selectedDocumentType =
                    "all";


                resetDocumentTabs();


                await loadDocumentsForSelectedPet();

            }

            catch (error) {

                console.error(
                    "UPLOAD DOCUMENT ERROR:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to upload document."
                );

            }

            finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        originalText;

                }

            }

        }
    );

}


// =========================================================
// FILE TYPE
// =========================================================

function getFileType(
    fileType
) {

    if (!fileType) {
        return "FILE";
    }


    if (
        fileType.includes("/")
    ) {

        const parts =
            fileType.split("/");


        return (
            parts[1] ||
            "FILE"
        ).toUpperCase();

    }


    return fileType.toUpperCase();

}


// =========================================================
// FILE SIZE
// =========================================================

function formatFileSize(
    bytes
) {

    if (
        !bytes ||
        Number.isNaN(
            Number(bytes)
        )
    ) {

        return "";

    }


    bytes =
        Number(bytes);


    if (
        bytes < 1024
    ) {

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


// =========================================================
// DOCUMENT ICON
// =========================================================

function getDocumentIcon(
    type
) {

    const icons = {

        vaccination:
            "💉",

        medical:
            "🩺",

        prescription:
            "💊",

        lab:
            "🧪",

        discharge:
            "📋",

        xray:
            "🩻",

        history:
            "📑",

        other:
            "📄"

    };


    return (
        icons[type] ||
        "📄"
    );

}


// =========================================================
// FORMAT DATE
// =========================================================

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
            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"
        }
    );

}


// =========================================================
// CAPITALIZE TYPE
// =========================================================

function capitalizeType(
    type
) {

    if (!type) {
        return "";
    }


    return type
        .charAt(0)
        .toUpperCase()
        +
        type.slice(1);

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(
    value
) {

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


// =========================================================
// NO PETS MESSAGE
// =========================================================

function showNoPetsMessage() {

    if (!petCategoryGrid) {
        return;
    }


    petCategoryGrid.innerHTML = `

        <div class="empty-document-state">

            <div class="empty-document-icon">
                🐾
            </div>

            <h3>
                No pets added yet
            </h3>

            <p>
                Add a pet first to manage medical documents.
            </p>

        </div>

    `;

}