// ========================================
// PAWSYNC PROFILE PAGE
// ========================================

const API_BASE_URL = "http://localhost:5000/api/auth";


// ========================================
// GO BACK TO DASHBOARD
// ========================================

function goBack() {

    window.location.href =
        "../owner/dashboard/ownerdashboard.html";

}


// ========================================
// LOAD USER PROFILE
// ========================================

async function loadProfile() {

    try {

        // Get JWT token
        const token =
            localStorage.getItem("pawsyncToken");


        // If no token, user is not logged in
        if (!token) {

            alert("Please login first.");

            window.location.href =
                "../auth/login/login.html";

            return;
        }


        // Get profile from backend
        const response = await fetch(
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


        // Backend error
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


        // ========================================
        // GET USER OBJECT
        // ========================================

        const user =
            data.user || data;


        // ========================================
        // USER NAME
        // ========================================

        const name =
            user.name || "User";


        document.getElementById(
            "profileName"
        ).textContent = name;


        document.getElementById(
            "fullName"
        ).textContent = name;


        // ========================================
        // EMAIL
        // ========================================

        document.getElementById(
            "profileEmail"
        ).textContent =
            user.email || "Not available";


        document.getElementById(
            "emailAddress"
        ).textContent =
            user.email || "Not available";


        // ========================================
        // PHONE
        // ========================================

        document.getElementById(
            "phoneNumber"
        ).textContent =
            user.phone || "Not added";


        // ========================================
        // ROLE
        // ========================================

        const role =
            user.role || "owner";


        document.getElementById(
            "accountRole"
        ).textContent =
            role === "owner"
                ? "Pet Owner"
                : role;


        // ========================================
        // PROFILE AVATAR
        // ========================================

        document.getElementById(
            "profileAvatar"
        ).textContent =
            name.charAt(0).toUpperCase();


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
// PAGE LOAD
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadProfile();

    }
);

// ========================================
// EDIT PROFILE MODAL
// ========================================

const editProfileButton =
    document.getElementById("editProfileButton");

const editProfileModal =
    document.getElementById("editProfileModal");

const closeProfileModal =
    document.getElementById("closeProfileModal");

const cancelProfileEdit =
    document.getElementById("cancelProfileEdit");

const editProfileForm =
    document.getElementById("editProfileForm");


// ========================================
// OPEN MODAL
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
// CLOSE MODAL
// ========================================

function closeEditProfileModal() {

    if (editProfileModal) {

        editProfileModal.classList.remove(
            "show"
        );

    }

}


// ========================================
// CLOSE BUTTON
// ========================================

if (closeProfileModal) {

    closeProfileModal.addEventListener(
        "click",
        closeEditProfileModal
    );

}


// ========================================
// CANCEL BUTTON
// ========================================

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
// SEND PROFILE UPDATE
// ========================================

const response =
    await fetch(
        "http://localhost:5000/api/auth/profile",
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


                // Update the profile page
                document.getElementById(
                    "profileName"
                ).textContent =
                    data.user.name;


                document.getElementById(
                    "fullName"
                ).textContent =
                    data.user.name;


                document.getElementById(
                    "profileEmail"
                ).textContent =
                    data.user.email;


                document.getElementById(
                    "emailAddress"
                ).textContent =
                    data.user.email;


                document.getElementById(
                    "phoneNumber"
                ).textContent =
                    data.user.phone ||
                    "Not added";


                document.getElementById(
                    "profileAvatar"
                ).textContent =
                    data.user.name
                        .charAt(0)
                        .toUpperCase();


                // Update stored user data
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
// PROFILE PHOTO - PREVIEW
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


// Store selected photo
let selectedProfilePhoto = null;


// ========================================
// SELECT PHOTO
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


            // Allowed image types

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
// REMOVE SELECTED PHOTO
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