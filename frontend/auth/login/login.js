/* ==========================
   PAWSYNC AUTHENTICATION
   STEP 2 - BACKEND CONNECTED
========================== */


/* ==========================
   BACKEND API
========================== */

const API_URL = "/api/auth";


/* ==========================
   DOM ELEMENTS
========================== */

/* Sections */

const roleSection =
    document.getElementById("role-selection-section");

const loginSection =
    document.getElementById("login-section");

const signupSection =
    document.getElementById("signup-section");

const forgotSection =
    document.getElementById("forgot-password-section");

const otpSection =
    document.getElementById("otp-section");


/* Role cards */

const petOwnerCard =
    document.getElementById("card-pet-owner");

const vetCard =
    document.getElementById("card-vet");


/* Navigation buttons */

const loginBackBtn =
    document.getElementById("login-back-btn");

const signupBackBtn =
    document.getElementById("signup-back-btn");

const forgotBackBtn =
    document.getElementById("forgot-back-btn");

const goToSignupBtn =
    document.getElementById("go-to-signup");

const goToLoginBtn =
    document.getElementById("go-to-login");

const goToForgotBtn =
    document.getElementById("go-to-forgot-password");


/* Dynamic elements */

const loginRoleBadge =
    document.getElementById("login-role-badge");

const signupRoleBadge =
    document.getElementById("signup-role-badge");

const vetSpecificFields =
    document.getElementById("vet-specific-fields");


/* ==========================
   STATE
========================== */

let currentRole = "";

let pendingVerificationEmail = "";


/* ==========================
   SHOW SECTION
========================== */

function showSection(sectionToShow) {

    roleSection.classList.add("hidden");

    loginSection.classList.add("hidden");

    signupSection.classList.add("hidden");

    forgotSection.classList.add("hidden");

    otpSection.classList.add("hidden");

    sectionToShow.classList.remove("hidden");
}


/* ==========================
   SELECT PET OWNER
========================== */

petOwnerCard.addEventListener("click", () => {

    currentRole = "owner";

    loginRoleBadge.textContent =
        "Pet Owner";

    signupRoleBadge.textContent =
        "Pet Owner";

    vetSpecificFields.classList.add("hidden");

    showSection(loginSection);

});


/* ==========================
   SELECT VETERINARIAN
========================== */

vetCard.addEventListener("click", () => {

    currentRole = "vet";

    loginRoleBadge.textContent =
        "Veterinarian";

    signupRoleBadge.textContent =
        "Veterinarian";

    vetSpecificFields.classList.remove("hidden");

    showSection(loginSection);

});


/* ==========================
   CHANGE ROLE
========================== */

loginBackBtn.addEventListener("click", () => {

    showSection(roleSection);

});


signupBackBtn.addEventListener("click", () => {

    showSection(roleSection);

});


forgotBackBtn.addEventListener("click", () => {

    showSection(loginSection);

});


/* ==========================
   LOGIN → SIGNUP
========================== */

goToSignupBtn.addEventListener("click", () => {

    signupRoleBadge.textContent =
        currentRole === "vet"
            ? "Veterinarian"
            : "Pet Owner";


    if (currentRole === "vet") {

        vetSpecificFields.classList.remove("hidden");

    } else {

        vetSpecificFields.classList.add("hidden");

    }


    showSection(signupSection);

});


/* ==========================
   SIGNUP → LOGIN
========================== */

goToLoginBtn.addEventListener("click", () => {

    showSection(loginSection);

});


/* ==========================
   LOGIN → FORGOT PASSWORD
========================== */

goToForgotBtn.addEventListener("click", () => {

    showSection(forgotSection);

});


/* ==========================
   FORGOT → LOGIN
========================== */

forgotBackBtn.addEventListener("click", () => {

    showSection(loginSection);

});


/* ==========================
   OTP → SIGNUP
========================== */

document
    .getElementById("otp-back-btn")
    .addEventListener("click", () => {

        showSection(signupSection);

    });


/* ==========================
   SHOW / HIDE PASSWORD
========================== */

const togglePasswordButtons =
    document.querySelectorAll(".toggle-password");


togglePasswordButtons.forEach(button => {

    button.addEventListener("click", function () {

        const input =
            this.previousElementSibling;


        if (input.type === "password") {

            input.type = "text";

            this.textContent = "Hide";

        } else {

            input.type = "password";

            this.textContent = "Show";

        }

    });

});


/* =========================================================
   LOGIN FORM
========================================================= */

document
    .getElementById("login-form")
    .addEventListener("submit", async function (event) {

        event.preventDefault();


        const email =
            document
                .getElementById("login-email")
                .value
                .trim();


        const password =
            document
                .getElementById("login-password")
                .value;


        const message =
            document.getElementById(
                "login-message"
            );


        if (!currentRole) {

            message.textContent =
                "Please select your role.";

            message.style.color =
                "#DC2626";

            return;
        }


        if (!email || !password) {

            message.textContent =
                "Please enter email and password.";

            message.style.color =
                "#DC2626";

            return;
        }


        try {

            message.textContent =
                "Logging in...";

            message.style.color =
                "#64748B";


            const response =
                await fetch(
                    `${API_URL}/login`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            email: email,

                            password: password,

                            role: currentRole

                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Login failed.";

                message.style.color =
                    "#DC2626";

                return;
            }


            message.textContent =
                "Login successful!";

            message.style.color =
                "#00A896";


            localStorage.setItem(
                "pawsyncToken",
                data.token
            );


            localStorage.setItem(
                "pawsyncUser",
                JSON.stringify(data.user)
            );


            setTimeout(() => {

                if (data.user.role === "owner") {

                    window.location.href =
                        "../../owner/dashboard/ownerdashboard.html";

                } else if (
                    data.user.role === "vet"
                ) {

                    window.location.href =
                        "../../vet-dashboard/vet-pages/vetdashboard.html";

                }

            }, 700);


        } catch (error) {

            console.error(
                "Login Error:",
                error
            );


            message.textContent =
                "Unable to connect to the server.";

            message.style.color =
                "#DC2626";

        }

    });

    /* =========================================================
   SIGNUP FORM
========================================================= */

document
    .getElementById("signup-form")
    .addEventListener("submit", async function (event) {

        event.preventDefault();


        /* --------------------------
           GET FORM VALUES
        -------------------------- */

        const name =
            document
                .getElementById("signup-name")
                .value
                .trim();


        const email =
            document
                .getElementById("signup-email")
                .value
                .trim();


        const phone =
            document
                .getElementById("signup-phone")
                .value
                .trim();


        const password =
            document
                .getElementById("signup-password")
                .value;


        const confirmPassword =
            document
                .getElementById(
                    "signup-confirm-password"
                )
                .value;


        const message =
            document.getElementById(
                "signup-message"
            );


        /* --------------------------
           VET FIELDS
        -------------------------- */

        const clinicInput =
            document.getElementById(
                "vet-clinic"
            );


        const licenseInput =
            document.getElementById(
                "vet-license"
            );


        const clinicName =
            clinicInput
                ? clinicInput.value.trim()
                : "";


        const licenseNumber =
            licenseInput
                ? licenseInput.value.trim()
                : "";


        /* --------------------------
           CHECK ROLE
        -------------------------- */

        if (!currentRole) {

            message.textContent =
                "Please select your role.";

            message.style.color =
                "#DC2626";

            return;
        }


        /* --------------------------
           PASSWORD MATCH
        -------------------------- */

        if (password !== confirmPassword) {

            message.textContent =
                "Passwords do not match.";

            message.style.color =
                "#DC2626";

            return;
        }


        /* --------------------------
           VET VALIDATION
        -------------------------- */

        if (currentRole === "vet") {

            if (
                !clinicName ||
                !licenseNumber
            ) {

                message.textContent =
                    "Please enter clinic name and license number.";

                message.style.color =
                    "#DC2626";

                return;
            }
        }


        try {

            /* --------------------------
               LOADING
            -------------------------- */

            message.textContent =
                "Creating your account...";

            message.style.color =
                "#64748B";


            /* --------------------------
               REQUEST BODY
            -------------------------- */

            const requestBody = {

                name: name,

                email: email,

                phone: phone,

                password: password,

                role: currentRole

            };


            /*
                Only send veterinarian
                fields when role = vet.
            */

            if (currentRole === "vet") {

                requestBody.clinicName =
                    clinicName;

                requestBody.licenseNumber =
                    licenseNumber;

            }


            /* --------------------------
               SEND TO BACKEND
            -------------------------- */

            const response =
                await fetch(
                    `${API_URL}/register`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                requestBody
                            )

                    }
                );


            /* --------------------------
               BACKEND RESPONSE
            -------------------------- */

            const data =
                await response.json();


            /* --------------------------
               REGISTRATION FAILED
            -------------------------- */

            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Registration failed.";

                message.style.color =
                    "#DC2626";

                return;
            }


            /* --------------------------
               REGISTRATION SUCCESS
            -------------------------- */

            pendingVerificationEmail =
                email;


            /*
                Show email on OTP screen.
            */

            document.getElementById(
                "otp-email-display"
            ).textContent =
                email;


            /*
                Clear previous OTP.
            */

            document.getElementById(
                "otp-input"
            ).value = "";


            /*
                Clear previous OTP message.
            */

            document.getElementById(
                "otp-message"
            ).textContent = "";


            /*
                Open OTP screen.
            */

            showSection(otpSection);


        } catch (error) {

            console.error(
                "Registration Error:",
                error
            );


            message.textContent =
                "Unable to connect to the server.";

            message.style.color =
                "#DC2626";

        }

    });


/* =========================================================
   FORGOT PASSWORD
========================================================= */

document
    .getElementById("forgot-password-form")
    .addEventListener("submit", async function (event) {

        event.preventDefault();


        const email =
            document
                .getElementById("forgot-email")
                .value
                .trim();


        if (!email) {

            return;
        }


        /*
            Password reset backend will be
            implemented after the basic
            authentication flow is working.
        */

        document
            .getElementById(
                "reset-success-message"
            )
            .classList.remove("hidden");

    });


/* =========================================================
   OTP VERIFICATION
========================================================= */

document
    .getElementById("otp-form")
    .addEventListener("submit", async function (event) {

        event.preventDefault();


        const otp =
            document
                .getElementById("otp-input")
                .value
                .trim();


        const message =
            document.getElementById(
                "otp-message"
            );


        /* -------------------------
           CHECK EMAIL
        ------------------------- */

        if (!pendingVerificationEmail) {

            message.textContent =
                "Verification session expired.";

            message.style.color =
                "#DC2626";

            return;
        }


        /* -------------------------
           CHECK OTP
        ------------------------- */

        if (!/^\d{6}$/.test(otp)) {

            message.textContent =
                "Please enter a valid 6-digit OTP.";

            message.style.color =
                "#DC2626";

            return;
        }


        try {

            message.textContent =
                "Verifying...";

            message.style.color =
                "#64748B";


            /* -------------------------
               SEND OTP TO BACKEND
            ------------------------- */

            const response =
                await fetch(
                    `${API_URL}/verify-email`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            email:
                                pendingVerificationEmail,

                            otp:
                                otp

                        })

                    }
                );


            const data =
                await response.json();


            /* -------------------------
               OTP FAILED
            ------------------------- */

            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "OTP verification failed.";

                message.style.color =
                    "#DC2626";

                return;
            }


            /* -------------------------
               OTP SUCCESS
            ------------------------- */

            message.textContent =
                "Email verified successfully.";

            message.style.color =
                "#00A896";


            /*
                First popup.
            */

            showPawSyncModal(
                "success",
                "Account Created Successfully",
                "Your PawSync account has been created successfully.",
                "OK",
                function () {

                    /*
                        Second popup.
                    */

                    showPawSyncModal(
                        "question",
                        "Go to Login?",
                        "Would you like to continue to the login page?",
                        "Go to Login",
                        function () {

                            showSection(
                                loginSection
                            );

                        }
                    );

                }
            );


        } catch (error) {

            console.error(
                "OTP Verification Error:",
                error
            );


            message.textContent =
                "Unable to connect to the server.";

            message.style.color =
                "#DC2626";

        }

    });

    /* =========================================================
   PAWSYNC POPUP
========================================================= */

function showPawSyncModal(
    type,
    title,
    message,
    buttonText,
    callback
) {

    /* --------------------------
       REMOVE OLD MODAL
    -------------------------- */

    const oldModal =
        document.getElementById(
            "pawsync-modal"
        );


    if (oldModal) {

        oldModal.remove();

    }


    /* --------------------------
       CREATE OVERLAY
    -------------------------- */

    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "pawsync-modal";


    overlay.className =
        "modal-overlay";


    /* --------------------------
       MODAL ICON
    -------------------------- */

    const icon =
        type === "success"
            ? "✓"
            : "?";


    const iconClass =
        type === "success"
            ? "modal-success"
            : "modal-question";


    /* --------------------------
       MODAL HTML
    -------------------------- */

    overlay.innerHTML = `

        <div class="pawsync-modal">

            <div class="modal-icon ${iconClass}">
                ${icon}
            </div>

            <h2>
                ${title}
            </h2>

            <p>
                ${message}
            </p>

            <button
                type="button"
                class="modal-primary-button"
                id="modal-action-button"
            >
                ${buttonText}
            </button>

        </div>

    `;


    /* --------------------------
       ADD MODAL TO PAGE
    -------------------------- */

    document.body.appendChild(
        overlay
    );


    /* --------------------------
       BUTTON ACTION
    -------------------------- */

    const modalActionButton =
        document.getElementById(
            "modal-action-button"
        );


    if (modalActionButton) {

        modalActionButton.addEventListener(
            "click",
            function () {

                overlay.remove();


                /*
                    Run the callback
                    after closing popup.
                */

                if (
                    typeof callback ===
                    "function"
                ) {

                    callback();

                }

            }
        );

    }

}

/* =========================================================
   GOOGLE LOGIN
========================================================= */

/*
    IMPORTANT:
    Replace this with your actual Google OAuth Client ID.
*/

const GOOGLE_CLIENT_ID =
    "806160044381-k35e973j3tl2imdf8vqgkmii1ck5mvqn.apps.googleusercontent.com";


/* =========================================================
   INITIALIZE GOOGLE LOGIN
========================================================= */

function initializeGoogleLogin() {

    /* --------------------------
       CHECK GOOGLE LIBRARY
    -------------------------- */

    if (
        !window.google ||
        !window.google.accounts ||
        !window.google.accounts.id
    ) {

        console.error(
            "Google Identity Services has not loaded."
        );

        return;
    }


    /* --------------------------
       INITIALIZE GOOGLE
    -------------------------- */

    google.accounts.id.initialize({

        client_id:
            GOOGLE_CLIENT_ID,

        callback:
            handleGoogleLogin

    });


    /* --------------------------
       FIND GOOGLE BUTTON
    -------------------------- */

    const googleButton =
        document.getElementById(
            "google-login-btn"
        );


    if (!googleButton) {

        console.error(
            "Google login button container not found."
        );

        return;
    }


    /* --------------------------
       RENDER GOOGLE BUTTON
    -------------------------- */

    google.accounts.id.renderButton(

        googleButton,

        {

            type: "standard",

            theme: "outline",

            size: "large",

            text: "continue_with",

            shape: "rectangular",

            logo_alignment: "left",

            width: 400

        }

    );


    console.log(
        "Google Sign-In button initialized successfully."
    );

}


/* =========================================================
   GOOGLE LOGIN CALLBACK
========================================================= */

async function handleGoogleLogin(response) {

    console.log("Google login successful.");


    /* ==========================
       CHECK GOOGLE CREDENTIAL
    ========================== */

    if (
        !response ||
        !response.credential
    ) {

        console.error(
            "Google credential was not received."
        );

        return;
    }


    /* ==========================
       CHECK SELECTED ROLE
    ========================== */

    if (
        currentRole !== "owner" &&
        currentRole !== "vet"
    ) {

        alert(
            "Please select Pet Owner or Veterinarian first."
        );

        return;
    }


    try {

        console.log(
            "Sending Google credential to backend..."
        );


        /* ==========================
           SEND TO BACKEND
        ========================== */

        const backendResponse =
            await fetch(
                `${API_URL}/google`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        credential:
                            response.credential,

                        role:
                            currentRole

                    })

                }
            );


        /* ==========================
           GET BACKEND RESPONSE
        ========================== */

        const data =
            await backendResponse.json();


        console.log(
            "Google backend response:",
            data
        );


        /* ==========================
           LOGIN FAILED
        ========================== */

        if (!backendResponse.ok) {

            alert(
                data.message ||
                "Google login failed."
            );

            return;
        }


        /* ==========================
           SAVE JWT
        ========================== */

        localStorage.setItem(
            "pawsyncToken",
            data.token
        );


        /* ==========================
           SAVE USER
        ========================== */

        localStorage.setItem(
            "pawsyncUser",
            JSON.stringify(
                data.user
            )
        );


        /* ==========================
           SUCCESS
        ========================== */

        alert(
            "Google login successful!"
        );


        /* ==========================
   DASHBOARD CONFIRMATION
========================== */

let goToDashboard = false;

if (data.user.role === "owner") {

    goToDashboard = confirm(
        "Google login successful!\n\n" +
        "You are logged in as a Pet Owner.\n\n" +
        "Do you want to go to the Owner Dashboard?"
    );

    if (goToDashboard) {

        window.location.href =
            "../../owner/dashboard/ownerdashboard.html";

    }

}

else if (data.user.role === "vet") {

    goToDashboard = confirm(
        "Google login successful!\n\n" +
        "You are logged in as a Veterinarian.\n\n" +
        "Do you want to go to the Veterinarian Dashboard?"
    );

    if (goToDashboard) {

        window.location.href =
             "../../vet-dashboard/vet-pages/vetdashboard.html";

    }

}

    } catch (error) {

        console.error(
            "Google Login Error:",
            error
        );


        alert(
            "Unable to connect to the server."
        );

    }

}

/* =========================================================
   START GOOGLE LOGIN
========================================================= */

window.addEventListener(
    "load",
    function () {

        initializeGoogleLogin();

    }
);