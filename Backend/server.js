const path = require("path");
const dotenv = require("dotenv");

// =========================================
// LOAD ENVIRONMENT VARIABLES
// =========================================

dotenv.config({
    path: path.join(__dirname, "../.env")
});


// =========================================
// IMPORT CLOUDINARY
// =========================================

const cloudinary = require("./config/cloudinary");


// =========================================
// IMPORT EXPRESS & MIDDLEWARE
// =========================================

const express = require("express");
const cors = require("cors");


// =========================================
// IMPORT DATABASE
// =========================================

const connectDB = require("./config/db");


// =========================================
// IMPORT ROUTES
// =========================================

const authRoutes = require("./routes/authRoutes");


// // =========================================
// // ENVIRONMENT VARIABLES CHECK
// // =========================================

// console.log(
//     "EMAIL_USER:",
//     process.env.EMAIL_USER
// );

// console.log(
//     "EMAIL_PASSWORD exists:",
//     !!process.env.EMAIL_PASSWORD
// );

// console.log(
//     "EMAIL_PASSWORD length:",
//     process.env.EMAIL_PASSWORD
//         ? process.env.EMAIL_PASSWORD.length
//         : undefined
// );

// console.log(
//     "MONGO_URI exists:",
//     !!process.env.MONGO_URI
// );

// console.log(
//     "GOOGLE_CLIENT_ID exists:",
//     !!process.env.GOOGLE_CLIENT_ID
// );


// =========================================
// EXPRESS APP
// =========================================

const app = express();


// =========================================
// MIDDLEWARE
// =========================================

app.use(
    cors()
);

app.use(
    express.json()
);


// =========================================
// SERVE FRONTEND / STATIC FILES
// =========================================

// Serve files from the project root.
// This allows Express to serve:
// index.html
// frontend/
// css/
// js/
// images/
// etc.

app.use(
    express.static(
        path.join(__dirname, "..")
    )
);


// =========================================
// DATABASE
// =========================================

connectDB();


// =========================================
// API ROUTES
// =========================================

app.use(
    "/api/auth",
    authRoutes
);


// =========================================
// HOME PAGE
// =========================================

// When visiting:
// http://localhost:5000
//
// Open the root index.html

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../index.html"
            )
        );

    }
);


// =========================================
// SERVER
// =========================================

const PORT = process.env.PORT || 5000;

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `PawSync server running at: http://localhost:${PORT}`
        );

    }
);