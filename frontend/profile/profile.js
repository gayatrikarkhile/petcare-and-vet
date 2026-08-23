// ========================================
// PAWSYNC PROFILE PAGE
// ========================================

const API_BASE_URL =
    "http://localhost:5000/api/auth";


// ========================================
// PROFILE PHOTO ELEMENTS
// ========================================

const profileAvatarImage =
    document.getElementById(
        "profileAvatarImage"
    );

const profileAvatarInitial =
    document.getElementById(
        "profileAvatarInitial"
    );


// ========================================
// EDIT PROFILE ELEMENTS
// ========================================

const editProfileButton =
    document.getElementById(
        "editProfileButton"
    );

const editProfileModal =
    document.getElementById(
        "editProfileModal"
    );

const closeProfileModal =
    document.getElementById(
        "closeProfileModal"
    );

const cancelProfileEdit =
    document.getElementById(
        "cancelProfileEdit"
    );

const editProfileForm =
    document.getElementById(
        "editProfileForm"
    );


// ========================================
// PROFILE PHOTO - EDIT MODAL ELEMENTS
// ========================================

const profilePhotoInput =
    document.getElementById(
        "profilePhotoInput"
    );

const editProfilePhotoPreview =
    document.getElementById(
        "editProfilePhotoPreview"
    );

const editProfilePhotoInitial =
    document.getElementById(
        "editProfilePhotoInitial"
    );

const removeProfilePhoto =
    document.getElementById(
        "removeProfilePhoto"
    );


// ========================================
// SELECTED PHOTO
// ========================================

let selectedProfilePhoto = null;


// ========================================
// GO BACK TO DASHBOARD
// ========================================

function goBack() {
    if (document.referrer && document.referrer.includes("/frontend/")) {
        window.history.back();
    } else {
        window.location.href = "../owner/dashboard/ownerdashboard.html";
    }
}

// ========================================
// LOAD USER PROFILE
// ========================================

async function loadProfile() {

    try {

        const token =
            localStorage.getItem(
                "pawsyncToken"
            );


        if (!token) {

            alert(
                "Please login first."
            );

            window.location.href =
                "../auth/login/login.html";

            return;
        }


        const response =
            await fetch(
                `${API_BASE_URL}/profile`,
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


        if (!response.ok) {

            console.error(
                "Profile API error:",
                data
            );

            alert(
                data.message ||
                "Unable to load profile."
            );

            return;
        }


        console.log(
            "Profile loaded:",
            data
        );


        const user =
            data.user || data;


        // ========================================
        // NAME (First Name Only)
        // ========================================

        const rawName = (user.name || "User").trim().replace(/^Dr\.\s*/i, "");
        const firstName = rawName ? rawName.split(/\s+/)[0] : "User";

        document.getElementById(
            "profileName"
        ).textContent =
            firstName;


        document.getElementById(
            "fullName"
        ).textContent =
            firstName;


        // ========================================
        // EMAIL
        // ========================================

        document.getElementById(
            "profileEmail"
        ).textContent =
            user.email ||
            "Not available";


        document.getElementById(
            "emailAddress"
        ).textContent =
            user.email ||
            "Not available";


        // ========================================
        // PHONE
        // ========================================

        document.getElementById(
            "phoneNumber"
        ).textContent =
            user.phone ||
            "Not added";


        // ========================================
        // ROLE
        // ========================================

        const role =
            user.role ||
            "owner";


        document.getElementById(
            "accountRole"
        ).textContent =
            role === "owner"
                ? "Pet Owner"
                : role;


        // ========================================
        // PROFILE PHOTO
        // ========================================

        displayProfilePhoto(
            user.profilePhoto,
            user.name || firstName
        );


        // ========================================
        // LOGIN METHOD
        // ========================================

        let loginMethod =
            "Email & Password";


        if (
            user.googleId ||
            user.authProvider === "google" ||
            user.provider === "google"
        ) {

            loginMethod =
                "Google";

        }


        document.getElementById(
            "loginMethod"
        ).textContent =
            loginMethod;


        // ========================================
        // LOAD PHOTO INTO EDIT MODAL
        // ========================================

        if (user.profilePhoto) {

            editProfilePhotoPreview.src =
                user.profilePhoto;

            editProfilePhotoPreview.style.display =
                "block";

            editProfilePhotoInitial.style.display =
                "none";

        }


    }
    catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

        alert(
            "Unable to connect to PawSync server."
        );

    }

}


// ========================================
// DISPLAY PROFILE PHOTO
// ========================================

function displayProfilePhoto(
    photoURL,
    name
) {

    if (
        photoURL &&
        profileAvatarImage &&
        profileAvatarInitial
    ) {

        profileAvatarImage.src =
            photoURL;

        profileAvatarImage.style.display =
            "block";

        profileAvatarInitial.style.display =
            "none";

    }
    else if (
        profileAvatarImage &&
        profileAvatarInitial
    ) {

        profileAvatarImage.src =
            "";

        profileAvatarImage.style.display =
            "none";

        profileAvatarInitial.textContent =
            (name || "U")
                .charAt(0)
                .toUpperCase();

        profileAvatarInitial.style.display =
            "flex";

    }

}


// ========================================
// PAGE LOAD
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProfile();

    }
);

// ========================================
// OPEN EDIT PROFILE MODAL
// ========================================

if (editProfileButton) {

    editProfileButton.addEventListener(
        "click",
        function () {

            const currentName =
                document.getElementById(
                    "fullName"
                ).textContent;


            const currentPhone =
                document.getElementById(
                    "phoneNumber"
                ).textContent;


            const currentEmail =
                document.getElementById(
                    "emailAddress"
                ).textContent;


            document.getElementById(
                "editName"
            ).value =
                currentName !== "Loading..."
                    ? currentName
                    : "";


            document.getElementById(
                "editPhone"
            ).value =
                currentPhone !== "Not added"
                    ? currentPhone
                    : "";


            document.getElementById(
                "editEmail"
            ).value =
                currentEmail !== "Not available"
                    ? currentEmail
                    : "";


            editProfileModal.classList.add(
                "show"
            );

        }
    );

}


// ========================================
// CLOSE EDIT MODAL
// ========================================

function closeEditProfileModal() {

    if (editProfileModal) {

        editProfileModal.classList.remove(
            "show"
        );

    }

}


if (closeProfileModal) {

    closeProfileModal.addEventListener(
        "click",
        closeEditProfileModal
    );

}


if (cancelProfileEdit) {

    cancelProfileEdit.addEventListener(
        "click",
        closeEditProfileModal
    );

}


// ========================================
// CLICK OUTSIDE MODAL
// ========================================

if (editProfileModal) {

    editProfileModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                editProfileModal
            ) {

                closeEditProfileModal();

            }

        }
    );

}


// ========================================
// ESC KEY
// ========================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            editProfileModal &&
            editProfileModal.classList.contains(
                "show"
            )
        ) {

            closeEditProfileModal();

        }

    }
);


// ========================================
// SAVE PROFILE CHANGES
// ========================================

if (editProfileForm) {

    editProfileForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const token =
                localStorage.getItem(
                    "pawsyncToken"
                );


            if (!token) {

                alert(
                    "Your session has expired. Please login again."
                );

                window.location.href =
                    "../auth/login/login.html";

                return;

            }


            const name =
                document.getElementById(
                    "editName"
                ).value.trim();


            const phone =
                document.getElementById(
                    "editPhone"
                ).value.trim();


            if (!name) {

                alert(
                    "Please enter your name."
                );

                return;

            }


            try {

                // ========================================
                // CREATE FORM DATA
                // ========================================

                const formData =
                    new FormData();


                formData.append(
                    "name",
                    name
                );


                formData.append(
                    "phone",
                    phone
                );


                // ========================================
                // ADD PROFILE PHOTO
                // ========================================

                if (selectedProfilePhoto) {

                    formData.append(
                        "profilePhoto",
                        selectedProfilePhoto
                    );

                }


                // ========================================
                // SEND UPDATE
                // ========================================

                const response =
                    await fetch(
                        `${API_BASE_URL}/profile`,
                        {
                            method: "PUT",

                            headers: {
                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body: formData
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    console.error(
                        "Update profile error:",
                        data
                    );

                    alert(
                        data.message ||
                        "Unable to update profile."
                    );

                    return;

                }


                console.log(
                    "Profile updated:",
                    data
                );


                // ========================================
                // UPDATE NAME
                // ========================================

                document.getElementById(
                    "profileName"
                ).textContent =
                    data.user.name;


                document.getElementById(
                    "fullName"
                ).textContent =
                    data.user.name;


                // ========================================
                // UPDATE EMAIL
                // ========================================

                document.getElementById(
                    "profileEmail"
                ).textContent =
                    data.user.email;


                document.getElementById(
                    "emailAddress"
                ).textContent =
                    data.user.email;


                // ========================================
                // UPDATE PHONE
                // ========================================

                document.getElementById(
                    "phoneNumber"
                ).textContent =
                    data.user.phone ||
                    "Not added";


                // ========================================
                // UPDATE PROFILE PHOTO
                // ========================================

                displayProfilePhoto(
                    data.user.profilePhoto,
                    data.user.name
                );


                // ========================================
                // UPDATE EDIT MODAL PHOTO
                // ========================================

                if (
                    data.user.profilePhoto
                ) {

                    editProfilePhotoPreview.src =
                        data.user.profilePhoto;

                    editProfilePhotoPreview.style.display =
                        "block";

                    editProfilePhotoInitial.style.display =
                        "none";

                }


                // ========================================
                // UPDATE STORED USER DATA
                // ========================================

                const storedUser =
                    localStorage.getItem(
                        "pawsyncUser"
                    );


                if (storedUser) {

                    try {

                        const user =
                            JSON.parse(
                                storedUser
                            );


                        user.name =
                            data.user.name;


                        user.phone =
                            data.user.phone;


                        user.profilePhoto =
                            data.user.profilePhoto ||
                            "";


                        localStorage.setItem(
                            "pawsyncUser",
                            JSON.stringify(user)
                        );

                    }
                    catch (error) {

                        console.error(
                            "Unable to update stored user:",
                            error
                        );

                    }

                }


                // Clear selected photo

                selectedProfilePhoto =
                    null;


                if (profilePhotoInput) {

                    profilePhotoInput.value =
                        "";

                }


                // Close modal

                closeEditProfileModal();


                alert(
                    "Profile updated successfully!"
                );


            }
            catch (error) {

                console.error(
                    "Update profile error:",
                    error
                );

                alert(
                    "Unable to connect to PawSync server."
                );

            }

        }
    );

}


// ========================================
// SELECT PROFILE PHOTO
// ========================================

if (profilePhotoInput) {

    profilePhotoInput.addEventListener(
        "change",
        function () {

            const file =
                this.files[0];


            if (!file) {
                return;
            }


            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                alert(
                    "Please select a JPG, PNG or WebP image."
                );

                this.value = "";

                return;

            }


            // Maximum 5 MB

            if (
                file.size >
                5 * 1024 * 1024
            ) {

                alert(
                    "Profile photo must be smaller than 5 MB."
                );

                this.value = "";

                return;

            }


            // Store selected file

            selectedProfilePhoto =
                file;


            // Create preview

            const imageURL =
                URL.createObjectURL(
                    file
                );


            editProfilePhotoPreview.src =
                imageURL;


            editProfilePhotoPreview.style.display =
                "block";


            editProfilePhotoInitial.style.display =
                "none";

        }
    );

}


// ========================================
// REMOVE PROFILE PHOTO
// ========================================

if (removeProfilePhoto) {

    removeProfilePhoto.addEventListener(
        "click",
        function () {

            selectedProfilePhoto =
                null;


            if (profilePhotoInput) {

                profilePhotoInput.value =
                    "";

            }


            editProfilePhotoPreview.src =
                "";

            editProfilePhotoPreview.style.display =
                "none";


            editProfilePhotoInitial.style.display =
                "flex";

        }
    );

}