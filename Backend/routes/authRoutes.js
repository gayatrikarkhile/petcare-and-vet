const express = require("express");
const protect =require("../middleware/authMiddleware");
const multer = require("multer");

// =========================================
// PROFILE PHOTO UPLOAD
// =========================================

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (
            allowedTypes.includes(
                file.mimetype
            )
        ) {

            cb(null, true);

        } else {

            cb(
                new Error(
                    "Only JPG, PNG and WebP images are allowed."
                )
            );

        }

    }
});

const {
    registerUser,
    verifyEmail,
    loginUser,
    adminLogin,
    googleLogin,
    getProfile,
    updateProfile,
    changePassword
} = require("../controllers/authController");


const router =
    express.Router();


/* =========================================
   REGISTER
========================================= */

router.post(
    "/register",
    registerUser
);


/* =========================================
   VERIFY EMAIL
========================================= */

router.post(
    "/verify-email",
    verifyEmail
);


/* =========================================
   NORMAL LOGIN
========================================= */

router.post(
    "/login",
    loginUser
);


/* =========================================
   ADMIN LOGIN
========================================= */

router.post(
    "/admin-login",
    adminLogin
);


/* =========================================
   GOOGLE LOGIN
========================================= */

router.post(
    "/google",
    googleLogin
);

/* =========================================
   GET LOGGED-IN USER PROFILE
========================================= */

router.get(
    "/profile",
    protect,
    getProfile
);

router.get(
    "/me",
    protect,
    getProfile
);

/* =========================================
   UPDATE LOGGED-IN USER PROFILE
========================================= */

router.put(
    "/profile",
    protect,
    upload.single("profilePhoto"),
    updateProfile
);
/* =========================================
   CHANGE PASSWORD
========================================= */

router.put(
    "/change-password",
    protect,
    changePassword
);

module.exports = router;