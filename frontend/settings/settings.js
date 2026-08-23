// ========================================
// PAWSYNC SETTINGS
// ========================================


// ========================================
// BACK TO DASHBOARD
// ========================================

function goBack() {
    if (document.referrer && document.referrer.includes("/frontend/")) {
        window.history.back();
    } else {
        window.location.href = "../owner/dashboard/ownerdashboard.html";
    }
}


// ========================================
// PROFILE BUTTON
// ========================================

const profileButton = document.getElementById("profileButton");
if (profileButton) {
    profileButton.addEventListener("click", function () {
        window.location.href = "../profile/profile.html";
    });
}


// ========================================
// LOGOUT
// ========================================

const logoutButton =
    document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            const confirmed =
                confirm(
                    "Are you sure you want to log out?"
                );


            if (!confirmed) {

                return;

            }


            localStorage.removeItem(
                "pawsyncToken"
            );

            localStorage.removeItem(
                "pawsyncUser"
            );


            window.location.href =
                "../auth/login/login.html";

        }
    );

}


// ========================================
// LOAD LOGIN METHOD
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const userData =
            localStorage.getItem(
                "pawsyncUser"
            );


        if (!userData) {

            return;

        }


        try {

            const user =
                JSON.parse(userData);


            const loginMethod =
                document.getElementById(
                    "loginMethod"
                );


            if (!loginMethod) {

                return;

            }


            if (
                user.googleId ||
                user.authProvider === "google" ||
                user.provider === "google"
            ) {

                loginMethod.textContent =
                    "Google";

            }
            else {

                loginMethod.textContent =
                    "Email & Password";

            }

        }
        catch (error) {

            console.error(
                "Unable to read user information:",
                error
            );

        }

    }
);

// ========================================
// CHANGE PASSWORD MODAL
// ========================================

const changePasswordButton =
    document.getElementById(
        "changePasswordButton"
    );

const changePasswordModal =
    document.getElementById(
        "changePasswordModal"
    );

const closePasswordModal =
    document.getElementById(
        "closePasswordModal"
    );

const cancelPasswordChange =
    document.getElementById(
        "cancelPasswordChange"
    );

const changePasswordForm =
    document.getElementById(
        "changePasswordForm"
    );

const googlePasswordNotice =
    document.getElementById(
        "googlePasswordNotice"
    );


// ========================================
// OPEN MODAL
// ========================================

if (changePasswordButton) {

    changePasswordButton.addEventListener(
        "click",
        function () {

            changePasswordModal.classList.add(
                "show"
            );

        }
    );

}


// ========================================
// CLOSE MODAL
// ========================================

function closeChangePasswordModal() {

    if (changePasswordModal) {

        changePasswordModal.classList.remove(
            "show"
        );

    }

}


// ========================================
// CLOSE BUTTON
// ========================================

if (closePasswordModal) {

    closePasswordModal.addEventListener(
        "click",
        closeChangePasswordModal
    );

}


// ========================================
// CANCEL BUTTON
// ========================================

if (cancelPasswordChange) {

    cancelPasswordChange.addEventListener(
        "click",
        closeChangePasswordModal
    );

}


// ========================================
// CLICK OUTSIDE
// ========================================

if (changePasswordButton) {

    changePasswordButton.addEventListener(
        "click",
        async function () {

            changePasswordModal.classList.add(
                "show"
            );


            await checkPasswordAccountType();

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
            changePasswordModal &&
            changePasswordModal.classList.contains(
                "show"
            )
        ) {

            closeChangePasswordModal();

        }

    }
);


// ========================================
// CHECK LOGIN PROVIDER
// ========================================

async function checkPasswordAccountType() {

    const token =
        localStorage.getItem("pawsyncToken");


    if (!token) {

        console.error(
            "JWT token not found."
        );

        return;

    }


    try {

        const response =
            await fetch(
                "http://localhost:5000/api/auth/profile",
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const data =
            await response.json();


        console.log(
            "Profile response:",
            data
        );


        if (!response.ok) {

            console.error(
                "Unable to load profile:",
                data.message
            );

            return;

        }


        const user =
            data.user;


        console.log(
            "Login provider:",
            user.authProvider
        );


        // ========================================
        // GOOGLE ACCOUNT
        // ========================================

        if (
            user.authProvider === "google"
        ) {

            googlePasswordNotice.style.display =
                "flex";


            changePasswordForm.style.display =
                "none";


            return;

        }


        // ========================================
        // NORMAL ACCOUNT
        // ========================================

        googlePasswordNotice.style.display =
            "none";


        changePasswordForm.style.display =
            "block";


    } catch (error) {

        console.error(
            "Profile check error:",
            error
        );

    }

}

